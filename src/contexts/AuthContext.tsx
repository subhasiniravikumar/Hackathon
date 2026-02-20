"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, dateOfBirth: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get stored users
      const storedUsers = localStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Find user
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userToStore = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name
        };
        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, dateOfBirth: string): Promise<boolean> => {
    try {
      // Get stored users
      const storedUsers = localStorage.getItem('users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        return false; // User already exists
      }
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        password, // In production, this should be hashed!
        name,
        dateOfBirth
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Auto login after signup
      const userToStore = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        dateOfBirth: newUser.dateOfBirth
      };
      setUser(userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
