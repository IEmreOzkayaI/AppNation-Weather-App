import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';
import * as Joi from 'joi';

// ENV yapılandırmasını genişletin
export const ENV = registerAs('ENV', () => ({
  PORT: parseInt(process.env.PORT, 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPEN_WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY,
  OPEN_WEATHER_BASE_URL: process.env.OPEN_WEATHER_BASE_URL,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: parseInt(process.env.REDIS_PORT, 10),
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB_INDEX: parseInt(process.env.REDIS_DB_INDEX, 10) || 0,
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [ENV],
      validationSchema: Joi.object({
        PORT: Joi.number().required().default(3000),
        OPEN_WEATHER_API_KEY: Joi.string().required(),
        OPEN_WEATHER_BASE_URL: Joi.string().required().uri(),

        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_USERNAME: Joi.string().optional(),
        REDIS_PASSWORD: Joi.string().optional(),
        REDIS_DB_INDEX: Joi.number().required().default(0),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
  exports: [ConfigModule],
})
export class EnvModule {}
