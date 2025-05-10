import { Expose, Transform } from 'class-transformer';

export class SignInAdminResponseDTO {
  @Expose()
  @Transform(({ obj }) => obj?.id)
  id: string;

  @Expose()
  @Transform(({ obj }) => obj?.email)
  email: string;

  @Expose()
  @Transform(({ obj }) => obj?.account.role)
  role: string;
}
