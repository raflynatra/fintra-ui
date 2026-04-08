export interface User {
  id?: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}
