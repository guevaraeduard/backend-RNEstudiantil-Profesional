import { Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { InvalidToken } from './entities/invalid-token.entity';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { EmailsService } from 'src/emails/emails.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    @InjectModel(InvalidToken.name)
    private readonly InvalidTokenModel: Model<InvalidToken>,
    private readonly jwtService: JwtService,
    private readonly emailsService: EmailsService,
    private readonly configService: ConfigService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const newUser = await this.UserModel.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      const { password: _, ...userWithoutPassword } = newUser.toObject();
      
      this.emailsService.sendEmail(newUser.email, 'Verificación de correo electrónico', './verify', { baseUrl: this.configService.get('BASE_URL_FRONT'),
        id: newUser._id
       });
      
      return {
        user: userWithoutPassword,
        token: this.getJwtToken({ id: newUser._id, email: newUser.email })
      };

    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    
    const { email, password } = loginUserDto;
    
    const user = await this.UserModel.findOne(
      { email }
    );

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const isPasswordValid = await bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
   
    return {
      user: userWithoutPassword,
      token: this.getJwtToken({ id: user._id, email: user.email })
    };
  }

  private handleExceptions(error: any): never {
    if (error.code == '11000') {
      const fieldName = Object.keys(error.keyPattern)[0];
      if(fieldName == 'identification'){
        throw new BadRequestException(`Ya existe un usuario con este identificación`);
      }
      throw new BadRequestException(`Ya existe un usuario con este ${fieldName}`);
    }
    throw new InternalServerErrorException('Error inesperado');
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async invalidateToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      if (!decoded || !decoded.exp) {
        throw new BadRequestException('Token inválido');
      }

      const expiresAt = new Date(decoded.exp * 1000);
      await this.InvalidTokenModel.create({ token, expiresAt });
    } catch (error) {
      throw new InternalServerErrorException('Error al invalidar el token');
    }
  }

  async isTokenInvalid(token: string): Promise<boolean> {
    const invalidToken = await this.InvalidTokenModel.findOne({ token });
    return !!invalidToken;
  }

  async logout(token: string): Promise<void> {
    await this.invalidateToken(token);
  }

  async sendVerificationEmail(user: User): Promise<void> {
    try {
      await this.emailsService.sendEmail(user.email, 'Verificación de correo electrónico', './verify', { baseUrl: this.configService.get('BASE_URL_FRONT'),
        id: user._id
       });
    } catch (error) {
      throw new InternalServerErrorException('Error al enviar el correo de verificación');
    }
  }

  async verifyEmail(id: string): Promise<void> {
    try {
      const user = await this.UserModel.findById(id);
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }
      await this.UserModel.findByIdAndUpdate(id, {
        email_verified_at: new Date().toISOString()
      });
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al verificar el correo electrónico');
    }
  }
}
