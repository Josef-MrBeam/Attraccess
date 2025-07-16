import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(userIdentifier: string | number) {
    super('UserNotFoundException', {
      description: `User with identifier "${userIdentifier}" not found`,
    });
  }
}
