import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Requires } from 'src/commons/decorators/requires.decorator';
import { CannotBeUsedWith } from 'src/commons/decorators/validate-exclusive.decorator';

export class GetWeatherUserDTO {
  @IsString()
  @IsOptional()
  location?: string;

  @CannotBeUsedWith(['location'])
  @Requires(['lon'])
  @Transform(({ value }) => (value ? parseFloat(value) : value))
  @IsNumber()
  @IsOptional()
  lat?: number;

  @CannotBeUsedWith(['location'])
  @Requires(['lat'])
  @Transform(({ value }) => (value ? parseFloat(value) : value))
  @IsNumber()
  @IsOptional()
  lon?: number;

  @IsString()
  @IsOptional()
  lang?: string = 'en';
}
