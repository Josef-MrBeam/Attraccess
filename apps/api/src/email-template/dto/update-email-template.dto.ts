import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEmailTemplateDto {
  @ApiPropertyOptional({
    description: 'Email subject line',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiPropertyOptional({
    description: 'MJML content of the email body',
  })
  @IsOptional()
  @IsString()
  body?: string;
}
