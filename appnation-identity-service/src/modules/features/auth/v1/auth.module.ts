import { Module } from '@nestjs/common';
import { AuthV1AdminController } from './controllers/admin.controller';
import { AuthService } from './auth.service';
import { ConfigType } from '@nestjs/config';
import { ENV } from 'src/modules/shared/env/env.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthV1UserController } from './controllers/user.controller';

@Module({
  imports: [JwtModule],
  controllers: [AuthV1AdminController, AuthV1UserController],
  providers: [AuthService],
})
export class AuthModule {}
