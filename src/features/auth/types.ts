import * as z from "zod";
import { ApiResponse } from "@/types/api";
import { loginSchema } from "./schema";

export type LoginPayload = z.infer<typeof loginSchema>;

export interface User {
  id?: string;
  name: string;
  email: string;
}

export interface LoginData {
  user: User;
  token: string;
}

export type LoginResponse = ApiResponse<LoginData>;

export interface RefreshData {
  token: string;
}

export type RefreshResponse = ApiResponse<RefreshData>;

export interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}
