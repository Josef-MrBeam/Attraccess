import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @IsString()
  @ApiProperty({
    description: 'The token to verify the email',
    example: '1234567890',
  })
  token: string;

  @IsEmail()
  @ApiProperty({
    description: 'The email to verify',
    example: 'john.doe@example.com',
  })
  email: string;
}
