import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';

const secretKey = process.env.SESSION_SECRET || 'your-super-secret-key-that-is-long-enough';
const key = new TextEncoder().encode(secretKey);
const COOKIE_NAME = 'session';

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Token valid for 1 hour
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // This could be because the token is expired or invalid
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function createSession(userId: number) {
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  const session = await encrypt({ userId, expires });

  cookies().set(COOKIE_NAME, session, { expires, httpOnly: true });
}

export async function getSession() {
  const sessionCookie = cookies().get(COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  const session = await decrypt(sessionCookie);
  if (!session?.userId) return null;

  return session;
}

export async function deleteSession() {
  cookies().set(COOKIE_NAME, '', { expires: new Date(0) });
}
