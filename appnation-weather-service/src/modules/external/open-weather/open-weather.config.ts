import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ENV } from 'src/modules/shared/env/env.module';

@Injectable()
export class OpenWeatherConfig {
  BASE_URL: string;
  API_KEY: string;

  constructor(
    @Inject(ENV.KEY) private readonly envService: ConfigType<typeof ENV>,
  ) {
    this.BASE_URL = this.envService.OPEN_WEATHER_BASE_URL;
    this.API_KEY = this.envService.OPEN_WEATHER_API_KEY;
  }

  getByCoordinates(lat: number, lon: number, lang: string): string {
    const path = `/data/2.5/weather`;
    const url = `${this.BASE_URL}${path}?lat=${lat}&lon=${lon}&lang=${lang}&appid=${this.API_KEY}`;
    return url;
  }

  getByLocation(location: string, lang: string): string {
    const path = `/data/2.5/weather`;
    const url = `${this.BASE_URL}${path}?q=${location}&lang=${lang}&appid=${this.API_KEY}`;
    return url;
  }
}
