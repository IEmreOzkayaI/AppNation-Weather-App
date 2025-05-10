import { Module } from '@nestjs/common';
import { OpenWeatherService } from './open-weather.service';
import { OpenWeatherConfig } from './open-weather.config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [OpenWeatherService, OpenWeatherConfig],
  exports: [OpenWeatherService],
})
export class OpenWeatherModule {}
