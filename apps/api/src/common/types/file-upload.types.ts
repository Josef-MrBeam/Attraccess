export interface FileUpload {
  /** Name of the form field */
  fieldname: string;
  /** Name of the uploaded file */
  originalname: string;
  /** Encoding type of the file */
  encoding: string;
  /** Mime type of the file */
  mimetype: string;
  /** Buffer of the file content */
  buffer: Buffer;
  /** Size of the file in bytes */
  size: number;
}
