import { Module } from '@nestjs/common';
import { WeatherModule } from './modules/features/weather/v1/weather.module';
import { loggerConfig } from './commons/config/logger.config';
import { LoggerModule } from 'nestjs-pino';
import { EnvModule } from './modules/shared/env/env.module';
import { DatabaseModule } from './modules/shared/database/database.module';
import { RedisModule } from './modules/shared/redis/redis.module';

@Module({
  imports: [WeatherModule, DatabaseModule, EnvModule, LoggerModule.forRoot(loggerConfig), RedisModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
