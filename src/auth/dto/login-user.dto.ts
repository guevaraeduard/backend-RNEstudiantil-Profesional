import { IsNotEmpty, IsEmail, IsString } from "class-validator";

export class LoginUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    password: string;
}


