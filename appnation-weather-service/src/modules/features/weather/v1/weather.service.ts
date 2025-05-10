import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { OpenWeatherService } from 'src/modules/external/open-weather/open-weather.service';
import { GetWeatherHistoryAdminDTO } from './dto/request/get-weather-history-admin.dto';
import { DatabaseService } from 'src/modules/shared/database/database.service';
import { GetWeatherUserDTO } from './dto/request/get-weather-user.dto';
import { RedisService } from 'src/modules/shared/redis/redis.service';
import { REDIS_CONSTANT } from 'src/modules/shared/redis/redis.constant';

@Injectable()
export class WeatherService {
  constructor(
    private readonly openWeatherService: OpenWeatherService,
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}
  async getWeather(filters: GetWeatherUserDTO, userId: string) {
    let cacheKey: string;

    if (filters.location) cacheKey = filters.location;
    else if (filters.lat !== undefined && filters.lon !== undefined) cacheKey = `${filters.lat},${filters.lon}`;
    else throw new Error('Either location or coordinates must be provided.');

    const cachedData = await this.redisService.getHSet(cacheKey);
    if (cachedData) return cachedData;

    let weatherData;
    if (filters.location) weatherData = await this.openWeatherService.getByLocation(filters.location, filters.lang);
    else weatherData = await this.openWeatherService.getByCoordinates(filters.lat, filters.lon, filters.lang);

    const createdHistory = await this.databaseService.weatherHistory.create({
      data: {
        userAccountId: userId,
        location: filters.location,
        lat: filters.lat,
        lon: filters.lon,
        responseJson: weatherData,
      },
    });

    await this.redisService.setHSet(cacheKey, weatherData, REDIS_CONSTANT.REDIS_WEATHER_DB_TTL_SECOND);

    return createdHistory;
  }

  async getWeatherHistory(filters: GetWeatherHistoryAdminDTO, userIdFromToken?: string) {
    const whereConditions: any = {};

    if (filters.userId && userIdFromToken) throw new ForbiddenException('You cannot query using double userId.');

    if (filters.weatherId) {
      whereConditions.id = filters.weatherId;
      if (userIdFromToken) whereConditions.userAccountId = userIdFromToken;
      const results = await this.databaseService.weatherHistory.findMany({ where: whereConditions, orderBy: { createdAt: 'desc' } });
      if (!results || results.length === 0) throw new NotFoundException('No weather history found for the given criteria.');
      return results;
    }

    const effectiveUserId = filters.userId || userIdFromToken;
    if (effectiveUserId) {
      whereConditions.userAccountId = effectiveUserId;
    }

    // 3. location varsa
    if (filters.location) {
      whereConditions.location = filters.location;
    }

    if (filters.lat && filters.lon) {
      whereConditions.lat = filters.lat;
      whereConditions.lon = filters.lon;
    }

    if (filters.startDate && filters.endDate) {
      whereConditions.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    } else if (filters.startDate) {
      whereConditions.createdAt = { gte: new Date(filters.startDate) };
    } else if (filters.endDate) {
      whereConditions.createdAt = { lte: new Date(filters.endDate) };
    }

    const results = await this.databaseService.weatherHistory.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
    });
    if (!results || results.length === 0) throw new NotFoundException('No weather history found for the given criteria.');
    return results;
  }
}
