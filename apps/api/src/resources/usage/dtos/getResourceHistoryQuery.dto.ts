import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

export class GetResourceHistoryQueryDto {
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'The page number to retrieve',
    example: 1,
    required: false,
  })
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'The number of items per page',
    example: 10,
    required: false,
  })
  limit?: number = 10;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'The user ID to filter by',
    example: 1,
    required: false,
  })
  userId?: number;
}
