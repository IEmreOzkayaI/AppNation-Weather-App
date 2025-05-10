import { Module } from '@nestjs/common';
import { ConfigModule, registerAs } from '@nestjs/config';
import * as Joi from 'joi';

// ENV yapılandırmasını genişletin
export const ENV = registerAs('ENV', () => ({
  PORT: parseInt(process.env.PORT, 10),
  JWT_ACCESS_EXPIRATION_TIME: process.env.JWT_ACCESS_EXPIRATION_TIME,
  NODE_ENV: process.env.NODE_ENV || 'development',
}));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [ENV],
      validationSchema: Joi.object({
        PORT: Joi.number().required().default(3000),
        JWT_ACCESS_EXPIRATION_TIME: Joi.string().required(),
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
