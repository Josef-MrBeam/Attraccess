import { ForbiddenException } from '@nestjs/common';

export class MissingIntroductionPermissionException extends ForbiddenException {
  constructor() {
    super('MissingIntroductionPermissionException');
  }
}
