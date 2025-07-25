
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "@/services/auth";
import { AuthContextType } from "@/hooks/use-auth";
import { Skeleton } from "./ui/skeleton";
import { doc, onSnapshot } from "firebase/firestore";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // If we have a user, listen for real-time updates to their profile
        const userDocRef = doc(db, "users", authUser.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
             // Combine auth data with firestore data for a complete user object
            const firestoreData = doc.data();
             setUser({
              ...authUser,
              displayName: firestoreData.name,
              photoURL: firestoreData.avatarUrl,
             } as User);
          } else {
             // Fallback to just auth user if firestore doc doesn't exist yet
            setUser(authUser);
          }
           setLoading(false);
        });

        // Return the firestore listener so it gets cleaned up
        return () => unsubscribeFirestore();

      } else {
        // No user, clear the state
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
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
