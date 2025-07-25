
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "@/services/auth";
import { AuthContextType } from "@/hooks/use-auth";
import { Skeleton } from "./ui/skeleton";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: signInWithEmailAndPassword,
    signUp: createUserWithEmailAndPassword,
    signOut,
  };

  if (loading) {
      return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
