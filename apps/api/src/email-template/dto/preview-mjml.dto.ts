import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PreviewMjmlDto {
  @ApiProperty({
    description: 'The MJML content to preview',
    example:
      '<mjml><mj-body><mj-section><mj-column><mj-text>Hello, world!</mj-text></mj-column></mj-section></mj-body></mjml>',
  })
  @IsNotEmpty()
  @IsString()
  mjmlContent: string;
}

export class PreviewMjmlResponseDto {
  @ApiProperty({
    description: 'The HTML content of the MJML',
    example: '<div>Hello, world!</div>',
  })
  html: string;

  @ApiProperty({
    description: 'Indicates if there were any errors during conversion',
    example: false,
  })
  hasErrors: boolean;

  @ApiProperty({
    description: 'Error message if conversion failed',
    example: null,
    required: false,
  })
  error?: string;
}
