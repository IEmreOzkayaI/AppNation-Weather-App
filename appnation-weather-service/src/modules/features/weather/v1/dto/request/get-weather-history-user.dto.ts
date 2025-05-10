import { GetWeatherHistoryAdminDTO } from './get-weather-history-admin.dto';
import { OmitType } from '@nestjs/mapped-types';

export class GetWeatherHistoryUserDTO extends OmitType(GetWeatherHistoryAdminDTO, ['userId'] as const) {}
