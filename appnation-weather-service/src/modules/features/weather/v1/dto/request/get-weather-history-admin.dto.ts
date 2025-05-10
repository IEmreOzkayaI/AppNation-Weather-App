import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, IsString, IsDateString, ValidateIf } from 'class-validator';
import { Requires } from 'src/commons/decorators/requires.decorator';
import { CannotBeUsedWith } from 'src/commons/decorators/validate-exclusive.decorator';

export class GetWeatherHistoryAdminDTO {
  @CannotBeUsedWith(['lat', 'lon', 'weatherId'])
  @IsOptional()
  @IsString()
  location?: string;

  @CannotBeUsedWith(['location', 'weatherId'])
  @Requires(['lon'])
  @Transform(({ value }) => (value ? parseFloat(value) : value))
  @IsOptional()
  @IsNumber()
  lat?: number;

  @CannotBeUsedWith(['location', 'weatherId'])
  @Requires(['lat'])
  @Transform(({ value }) => (value ? parseFloat(value) : value))
  @IsOptional()
  @IsNumber()
  lon?: number;

  @CannotBeUsedWith(['weatherId'])
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @CannotBeUsedWith(['weatherId'])
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @CannotBeUsedWith(['weatherId'])
  @IsOptional()
  @IsString()
  userId?: string;

  @CannotBeUsedWith(['location', 'lat', 'lon', 'startDate', 'endDate', 'userId'])
  @IsOptional()
  @IsString()
  weatherId?: string;
}
