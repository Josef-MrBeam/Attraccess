import { BadRequestException, NotFoundException } from '@nestjs/common';

export class InvalidSSOProviderIdException extends BadRequestException {
  constructor() {
    super('ERROR_INVALID_PROVIDER_ID');
  }
}

export class InvalidSSOProviderTypeException extends BadRequestException {
  constructor() {
    super('ERROR_INVALID_PROVIDER_TYPE');
  }
}

export class SSOProviderNotFoundException extends NotFoundException {
  constructor() {
    super('ERROR_PROVIDER_NOT_FOUND');
  }
}
