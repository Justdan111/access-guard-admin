"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem("auth_token");
        const userJson = localStorage.getItem("user");
        console.log("Checking auth with token:", storedToken);


        if (storedToken && userJson) {
          const parsedUser = JSON.parse(userJson);

          // Use the access token that is stored as the authentication signal.
          // If a token exists, consider the user authenticated (no verifyMockJWT).
          setUser(parsedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          // No token/user found -> ensure cleared state
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  };

  return { user, token, isLoading, isAuthenticated, logout };
}
