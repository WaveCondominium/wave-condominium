import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// Consome tempo mesmo sem hash (usuario inexistente) para nao vazar
// a existencia da conta por timing.
export async function verifyPassword(
  hash: string | undefined | null,
  plain: string
): Promise<boolean> {
  if (!hash) {
    await bcrypt.hash(plain, SALT_ROUNDS);
    return false;
  }
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}