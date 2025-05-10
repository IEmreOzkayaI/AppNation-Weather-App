import { Body, Controller, Post, Res, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Response, Request } from 'express'; // Express tiplerini import et
import { AuthService } from '../auth.service';
import { SignInAdminDTO } from '../dto/request/sign-in-admin.dto';
import { SignUpAdminDTO } from '../dto/request/sign-up-admin.dto';
import { SerializeInterceptor } from 'src/commons/interceptors/serialize.interceptor';
import { SignInAdminResponseDTO } from '../dto/response/sign-in-admin-response.dto';

@Controller({
  version: '1',
  path: 'admin/auth',
})
export class AuthV1AdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @SerializeInterceptor(SignInAdminResponseDTO)
  async signin(@Body() signInAdminDTO: SignInAdminDTO, @Res({ passthrough: true }) res: Response) {
    return await this.authService.adminSignIn(signInAdminDTO, res);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signUpAdminDTO: SignUpAdminDTO) {
    return this.authService.adminSignUp(signUpAdminDTO);
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.adminSignOut(req.cookies['account_id'], res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.authService.adminRefreshToken(req.cookies['account_id'], req.cookies['refresh_token'], res);
  }
}
