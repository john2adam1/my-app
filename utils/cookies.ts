// Utility to extract token from cookie header
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const token = cookieHeader
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("token="))
    ?.split("=")[1];
  return token || null;
}

