import { sign, verify, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

export interface JwtPayload {
  userId: string;
  role: string;
  baseId?: string | null;
}

export const signJwt = (payload: JwtPayload) => {
  return sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

export const verifyJwt = (token: string) => {
  return verify(token, JWT_SECRET) as JwtPayload;
};
