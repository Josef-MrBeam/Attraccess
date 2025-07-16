import { BadRequestException } from '@nestjs/common';

export class FileUploadValidationError extends BadRequestException {
  constructor(cause: string) {
    super('FileUploadValidationError', {
      cause,
    });
  }
}
