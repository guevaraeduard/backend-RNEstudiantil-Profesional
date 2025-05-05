import { ConfigModule } from '@nestjs/config';
import { join } from 'path'; // en Node
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { appConfig } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      validationSchema: JoiValidationSchema,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'), 
    }),

    MongooseModule.forRoot(process.env.MONGODB),

    CommonModule,

    AuthModule,
  ],
})
export class AppModule { }