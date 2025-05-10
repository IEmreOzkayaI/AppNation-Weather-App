import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from '../weather.service';
import { GetWeatherHistoryUserDTO } from '../dto/request/get-weather-history-user.dto';
import { GetWeatherUserDTO } from '../dto/request/get-weather-user.dto';
import { ExtractUserId } from '../commons/user-id.decorator';

@Controller({
  version: '1',
  path: '/user/weather',
})
export class WeatherV1UserController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('information')
  async getWeather(@Query() query: GetWeatherUserDTO, @ExtractUserId() userId: string) {
    return this.weatherService.getWeather(query, userId);
  }

  @Get('history')
  async getWeatherHistory(@Query() query: GetWeatherHistoryUserDTO, @ExtractUserId() userId: string) {
    return this.weatherService.getWeatherHistory(query, userId);
  }
}