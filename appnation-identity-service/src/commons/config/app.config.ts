import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { GlobalResponseInterceptor } from '../interceptors/global-response.interceptor';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import * as cookieParser from 'cookie-parser';

export function initConfig(app: INestApplication) {
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      forbidUnknownValues: true,
    }),
  );
  app.useGlobalInterceptors(new GlobalResponseInterceptor());
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new GlobalExceptionFilter(app.get(Logger)));

  app.use(cookieParser());
  app.enableCors({
    origin: '*', 
    credentials: true, 
  });
}
