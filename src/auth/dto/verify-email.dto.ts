import { IsNotEmpty, IsMongoId } from 'class-validator';

export class VerifyEmailDto {
    @IsMongoId({ message: 'El token proporcionado no es válido' })
    @IsNotEmpty({ message: 'El token es requerido' })
    id: string;
} 