import React, { useCallback, useEffect, useState } from "react";
import api, { setAuthToken } from "../api/client";
import { jwtDecode } from "jwt-decode";
import type { LoginResponseDto } from "../types";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<{
    id: string;
    username?: string;
    email?: string;
  } | null>(() => {
    return null;
  });

  const fetchUserById = useCallback(async (id: string) => {
    try {
      const { data } = await api.get(`/users/id/${id}`);
      setUser({ id, username: data.username, email: undefined });
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setAuthToken(null);
      setUser(null);
      return;
    }
    setAuthToken(token);

    try {
      const decoded = jwtDecode<{ sub: string; email?: string }>(token);
      const id = decoded.sub;
      fetchUserById(id);
    } catch {
      setAuthToken(null);
      setToken(null);
      setUser(null);
    }
  }, [token, fetchUserById]);

  const login = (payload: LoginResponseDto) => {
    setToken(payload.token);
    setAuthToken(payload.token);
    setUser({
      id: payload.id,
      username: payload.username,
      email: payload.email,
    });
  };

  const logout = () => {
    setToken(null);
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
