import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, isAdmin: boolean = false): string {
  return jwt.sign(
    { userId, isAdmin },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

export function verifyToken(token: string): { userId: string; isAdmin: boolean } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      isAdmin: decoded.isAdmin || false,
    };
  } catch (error) {
    return null;
  }
}

export function generateTemporaryPassword(): string {
  // Format: Name123 style - Name + number
  const adjectives = ['Red', 'Blue', 'Green', 'Happy', 'Smart', 'Fast'];
  const animals = ['Fox', 'Bear', 'Eagle', 'Wolf', 'Lion', 'Tiger'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${adjective}${animal}${number}`;
}
