import { NotFoundException } from '@nestjs/common';

export class ResourceNotFoundException extends NotFoundException {
  constructor(resourceId: number) {
    super('ResourceNotFoundException', {
      description: `Resource with ID ${resourceId} not found`,
    });
  }
}
