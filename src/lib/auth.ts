import { createHmac } from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.ADMIN_SESSION_SECRET ?? "formixa-dev-secret-change-in-prod";
export const ADMIN_EMAIL = "saad232272@gmail.com";
export const COOKIE_NAME = "formixa_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export function signToken(email: string): string {
  const ts = Date.now().toString();
  const data = `${email}|${ts}`;
  const sig = createHmac("sha256", SECRET).update(data).digest("hex");
  return Buffer.from(JSON.stringify({ data, sig })).toString("base64url");
}

export function verifyToken(token: string): boolean {
  try {
    const { data, sig } = JSON.parse(
      Buffer.from(token, "base64url").toString(),
    ) as { data: string; sig: string };
    const expected = createHmac("sha256", SECRET).update(data).digest("hex");
    return sig === expected;
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}
