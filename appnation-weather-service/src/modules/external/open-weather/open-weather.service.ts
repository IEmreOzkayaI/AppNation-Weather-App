import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OpenWeatherConfig } from './open-weather.config';
import { lastValueFrom } from 'rxjs';
import { tryCatch } from 'src/commons/utils/try-catch.util';

@Injectable()
export class OpenWeatherService {
  constructor(
    private readonly httpService: HttpService,
    private readonly openWeatherConfig: OpenWeatherConfig,
  ) {}

  async getByCoordinates(lat: number, lon: number, lang: string) {
    const url = this.openWeatherConfig.getByCoordinates(lat, lon, lang);
    const [error, response] = await tryCatch(lastValueFrom(this.httpService.get(url)));
    if (error) throw new HttpException('Failed to fetch weather data by coordinates', 490);
    return response?.data;
  }

  async getByLocation(location: string, lang: string) {
    const url = this.openWeatherConfig.getByLocation(location, lang);
    const [error, response] = await tryCatch(lastValueFrom(this.httpService.get(url)));
    if (error) throw new HttpException('Failed to fetch weather data by location name', 490);
    return response?.data;
  }
}
