import { ErrorCode } from './ErrorCode';

export interface IApiError {
  code: ErrorCode,
  structured: string,
  message?: string,
  details?: any,
}