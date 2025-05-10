import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initConfig } from './commons/config/app.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  initConfig(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('ENV.PORT');
  await app.listen(port);
}
bootstrap();
