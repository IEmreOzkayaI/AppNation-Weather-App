import { Module } from '@nestjs/common';
import { EnvModule } from './modules/shared/env/env.module';
import { LoggerModule } from 'nestjs-pino';
import { loggerConfig } from './commons/config/logger.config';
import { DatabaseModule } from './modules/shared/database/database.module';
import { AuthModule } from './modules/features/auth/v1/auth.module';
import { UserModule } from './modules/features/user/v1/user.module';

@Module({
  imports: [DatabaseModule, EnvModule, LoggerModule.forRoot(loggerConfig), AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
