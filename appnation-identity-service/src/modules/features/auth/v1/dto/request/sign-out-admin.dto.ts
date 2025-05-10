import { IsString, IsUUID } from 'class-validator';

export class SignOutAdminDTO {
  @IsUUID('4')
  @IsString()
  'x-user-id': string;
}
