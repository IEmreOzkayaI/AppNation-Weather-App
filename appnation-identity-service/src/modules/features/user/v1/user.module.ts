import { Module } from '@nestjs/common';
import { UserV1AdminController } from './controllers/admin.controller';
import { UserService } from './user.service';

@Module({
  imports: [],
  controllers: [UserV1AdminController],
  providers: [UserService],
})
export class UserModule {}
