import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule,  ConfigService} from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { InvalidToken, InvalidTokenSchema } from './entities/invalid-token.entity';
import { InvalidTokenMiddleware } from './middleware/invalid-token.middleware';
import { EmailsModule } from 'src/emails/emails.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: InvalidToken.name,
        schema: InvalidTokenSchema
      }
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' }
      })
    }),
    EmailsModule,
  ],
  exports: [JwtStrategy, MongooseModule, PassportModule, JwtModule]
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(InvalidTokenMiddleware)
      .forRoutes(
        { path: 'auth/validate-token', method: RequestMethod.POST },
        { path: 'auth/logout', method: RequestMethod.POST }
      );
  }
}
