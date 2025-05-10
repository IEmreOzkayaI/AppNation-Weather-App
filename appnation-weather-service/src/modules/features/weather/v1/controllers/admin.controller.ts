import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from '../weather.service';
import { GetWeatherHistoryAdminDTO } from '../dto/request/get-weather-history-admin.dto';

@Controller({
  version: '1',
  path: '/admin/weather',
})
export class WeatherV1AdminController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('history')
  async getWeatherHistory(@Query() query: GetWeatherHistoryAdminDTO) {
    return this.weatherService.getWeatherHistory(query);
  }
}