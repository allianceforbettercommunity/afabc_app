"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app, this would be stored in a database
const ADMIN_USER = {
  id: "admin-123",
  name: "ABC Team",
  email: "admin@abc.org",
  password: "password123", // In a real app, this would be hashed
  role: "admin" as const,
};

const MOCK_USERS: Record<string, User & { password: string }> = {
  [ADMIN_USER.email]: ADMIN_USER,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS[email];
    
    if (!user || user.password !== password) {
      setIsLoading(false);
      throw new Error("Invalid email or password");
    }
    
    const { password: _, ...userWithoutPassword } = user;
    setUser(userWithoutPassword);
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    setIsLoading(false);
    router.push("/dashboard");
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (MOCK_USERS[email]) {
      setIsLoading(false);
      throw new Error("Email already in use");
    }
    
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: "user" as const,
    };
    
    MOCK_USERS[email] = newUser;
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    setIsLoading(false);
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};