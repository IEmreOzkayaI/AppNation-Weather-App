import * as bcrypt from 'bcryptjs';

export async function hashData(data: string): Promise<string> {
  return bcrypt.hash(data, 10);
}

export async function compareHash(data: string, hash: string): Promise<boolean> {
  return bcrypt.compare(data, hash);
}
