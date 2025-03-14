import { ErrorCode } from './ErrorCode';
import { IApiError } from './IApiError';

export class ApiError extends Error {
  constructor(public httpCode: ErrorCode, public structuredError: string, public errMessage: string, public errDetails?: any) {
    super();
  }

  get json(): IApiError {
    return {
      code: this.httpCode,
      structured: this.structuredError,
      message: this.errMessage,
      details: this.errDetails
    }
  }
}
