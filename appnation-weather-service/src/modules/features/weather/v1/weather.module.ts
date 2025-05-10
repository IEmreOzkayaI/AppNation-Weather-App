import { Module } from '@nestjs/common';
import { WeatherV1UserController } from './controllers/user.controller';
import { WeatherV1AdminController } from './controllers/admin.controller';
import { WeatherService } from './weather.service';
import { OpenWeatherModule } from 'src/modules/external/open-weather/open-weather.module';

@Module({
  imports: [OpenWeatherModule],
  controllers: [WeatherV1UserController, WeatherV1AdminController],
  providers: [WeatherService],
})
export class WeatherModule {}
