import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SignInUserDTO {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  applicationSignature: string;
}
