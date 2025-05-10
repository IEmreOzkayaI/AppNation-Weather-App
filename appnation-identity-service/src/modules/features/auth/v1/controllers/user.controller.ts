import { Body, Controller, Post, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express'; // Express tiplerini import et
import { AuthService } from '../auth.service';
import { SignInUserDTO } from '../dto/request/sign-in-user.dto';
import { SerializeInterceptor } from 'src/commons/interceptors/serialize.interceptor';
import { SignInUserResponseDTO } from '../dto/response/sign-in-user-response.dto';

@Controller({
  version: '1',
  path: 'user/auth',
})
export class AuthV1UserController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @SerializeInterceptor(SignInUserResponseDTO)
  async signin(@Body() signInUserDTO: SignInUserDTO, @Res({ passthrough: true }) res: Response) {
    return await this.authService.userSignIn(signInUserDTO, res);
  }
}
