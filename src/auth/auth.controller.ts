import { Controller, Get, Post, Body,  UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, VerifyEmailDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators/auth.decorator';
import { Request } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('validate-token')
  @Auth()
  validateToken(@GetUser() user: User, @Req() req: Request) {
    const { password, ...userWithoutPassword } = user.toObject();
    const token = req.headers.authorization?.split(' ')[1];
    return {
      user: userWithoutPassword,
      token
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    await this.authService.logout(token);
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Post('send-verification-email')
  @Auth()
  sendVerificationEmail(@GetUser() user: User) {
    return this.authService.sendVerificationEmail(user);
  }

  @Post('verify-email')
  @Auth()
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto.id);
  }
}

