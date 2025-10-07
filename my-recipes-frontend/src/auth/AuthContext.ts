import { createContext } from "react";
import type { LoginResponseDto } from "../types";

type User = {
  id: string;
  username?: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (payload: LoginResponseDto) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
