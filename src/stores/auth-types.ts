import type { User } from "@/types/auth";

export interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}
