import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUserDTO {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  applicationSignature: string;
}
