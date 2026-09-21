import axios, { AxiosError } from "axios";

export interface ApiError {
  status: number;
  message: string;
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function extractMessage(err: AxiosError<{ message?: string | string[] }>): string {
  const raw = err.response?.data?.message;
  if (Array.isArray(raw)) return raw[0] ?? "Xatolik yuz berdi";
  if (typeof raw === "string") return raw;
  if (err.code === "ERR_NETWORK") return "Serverga ulanib bo'lmadi";
  return "Xatolik yuz berdi";
}

http.interceptors.response.use(
  (res) => {
    if (res.data && typeof res.data === "object" && "data" in res.data) {
      return { ...res, data: res.data.data };
    }
    return res;
  },
  (err: AxiosError<{ message?: string | string[] }>) => {
    const status = err.response?.status ?? 0;
    const isAuthEndpoint = err.config?.url?.startsWith("/auth/");

    if (status === 401 && !isAuthEndpoint) {
      onUnauthorized?.();
    }

    const apiError: ApiError = { status, message: extractMessage(err) };
    return Promise.reject(apiError);
  },
);
