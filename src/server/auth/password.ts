import argon2 from "argon2";

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

// verify roda mesmo sem hash (dummy) para nao vazar existencia de usuario por tempo
const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export async function verifyPassword(
  hash: string | undefined | null,
  plain: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash ?? DUMMY_HASH, plain);
  } catch {
    return false;
  }
}
