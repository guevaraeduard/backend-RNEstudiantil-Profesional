import { Injectable } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const newUser = await this.UserModel.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      const { password: _, ...userWithoutPassword } = newUser.toObject();
      return {
        ...userWithoutPassword,
        token: this.getJwtToken({ id: newUser._id, email: newUser.email })
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    
    const { email, password } = loginUserDto;
    
    const user = await this.UserModel.findOne(
      { email },
      { email: 1, password: 1 }
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
      ...userWithoutPassword,
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

}
