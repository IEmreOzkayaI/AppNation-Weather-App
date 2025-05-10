import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { initConfig } from './commons/config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  initConfig(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('ENV.PORT');
  await app.listen(port);
  console.log(`Application is running on: ${port}`);
}
bootstrap();
