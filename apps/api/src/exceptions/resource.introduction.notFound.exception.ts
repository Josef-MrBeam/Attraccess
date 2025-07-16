import { NotFoundException } from '@nestjs/common';

export class ResourceIntroductionNotFoundException extends NotFoundException {
  constructor(introductionId: number) {
    super('ResourceIntroductionNotFoundException', {
      description: `Resource introduction with ID ${introductionId} not found`,
    });
  }
}
