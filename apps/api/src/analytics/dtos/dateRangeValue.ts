import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

import { IsDate } from 'class-validator';

export class DateRangeValue {
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ type: Date, description: 'The start date of the range', example: '2021-01-01' })
  start: Date;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ type: Date, description: 'The end date of the range', example: '2021-01-01' })
  end: Date;
}
