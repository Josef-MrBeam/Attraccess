import { ApiProperty } from '@nestjs/swagger';
import { ResourceUsage } from '@attraccess/database-entities';

export class GetActiveUsageSessionDto {
  @ApiProperty({
    description: 'The active usage session or null if none exists',
    type: () => ResourceUsage,
    nullable: true,
  })
  usage: ResourceUsage | null;
}
