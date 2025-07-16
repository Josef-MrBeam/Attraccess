import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserPermissionsDto } from './updateUserPermissions.dto';

class UserPermissionsUpdateItem {
  @ApiProperty({
    description: 'The user ID',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'The permission updates to apply',
    example: {
      canManageResources: true,
      canManageSystemConfiguration: false,
      canManageUsers: false,
    },
  })
  @ValidateNested()
  @Type(() => UpdateUserPermissionsDto)
  permissions: UpdateUserPermissionsDto;
}

export class BulkUpdateUserPermissionsDto {
  @ApiProperty({
    description: 'Array of user permission updates',
    type: [UserPermissionsUpdateItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionsUpdateItem)
  updates: UserPermissionsUpdateItem[];
}
