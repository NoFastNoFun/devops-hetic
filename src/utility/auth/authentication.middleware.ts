
import { Request } from 'express';
import { JWT } from 'utility/JWT/JWT';
import { JWT_ACCESS_AUD, JWT_ISSUER } from 'utility/JWT/JWTConstants';
import { IAccessToken } from './IAccessToken';
import { ApiError } from 'utility/error/apiError';
import { ErrorCode } from 'utility/error/ErrorCode';

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<IAccessToken|null> {

  if (securityName === 'jwt') {
    const authheader = request.headers.authorization || '';
    if (!authheader.startsWith('Bearer ')) {
      throw new ApiError(ErrorCode.Unauthorized, 'auth/missing-header', 'Missing authorization header with Bearer token');
    }

    const token = authheader.split('Bearer ')[1];

    const jwt = new JWT();
    let decoded = await jwt.decodeAndVerify<IAccessToken>(token, {
      issuer: JWT_ISSUER,
      audience: JWT_ACCESS_AUD,
    });
    
    return decoded;
  }

  return null;
}