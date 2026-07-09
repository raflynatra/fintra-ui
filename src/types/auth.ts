import { loginSchema } from "@/validations/login.schema";
import * as z from "zod";
import { ApiResponse } from "./api";

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
