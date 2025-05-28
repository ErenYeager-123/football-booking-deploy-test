"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types/user";
import { mockUsers } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng quay trở lại, ${foundUser.name}!`,
      });
      return true;
    } else {
      toast({
        title: "Đăng nhập thất bại",
        description: "Email hoặc mật khẩu không chính xác",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      toast({
        title: "Đăng ký thất bại",
        description: "Email đã được sử dụng",
        variant: "destructive",
      });
      return false;
    }

    // In a real app, this would be handled server-side
    const newUser: User = {
      id: `user${mockUsers.length + 1}`,
      name,
      email,
      password, // In a real app, this would be hashed
      isAdmin: false,
    };

    // Add to mock data (in a real app, this would be a database operation)
    mockUsers.push(newUser);
    
    // Auto-login after registration
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    
    toast({
      title: "Đăng ký thành công",
      description: "Tài khoản của bạn đã được tạo thành công",
    });
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất thành công",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}