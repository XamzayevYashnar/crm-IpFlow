import { http } from "../lib/http";
import type { AuthUser } from "../types/user";

export function signIn(email: string, password: string) {
  return http.post<{ message: string }>("/auth/sign/in", { email, password }).then((r) => r.data);
}

export function verifyOtp(email: string, code: string) {
  return http.post<{ user: AuthUser }>("/auth/verify/otp", { email, code }).then((r) => r.data.user);
}
