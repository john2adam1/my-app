// app/api/auth/logout/route.ts
import { clearAuthCookie } from "@/services/authService";

export async function POST() {
  return clearAuthCookie();
}
