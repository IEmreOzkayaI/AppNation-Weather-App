import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class DeleteByIdUserDTO {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  id: string;
}
