"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { User } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  dbUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch or create user record in Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setDbUser(docSnap.data() as User);
          } else {
            // Create user document if it doesn't exist
            const newProfile: User = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "Mahasiswa AntiNanti",
              partnerEmail: "",
            };
            await setDoc(userDocRef, newProfile);
            setDbUser(newProfile);
          }
        } catch (error) {
          console.error("Error synchronizing user profile in Firestore:", error);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign in failed, falling back to mock user in development:", error);
      
      // In development mode, auto sign-in with mock credentials to bypass popup blocks
      const mockUser = {
        uid: "mock-uid-12345",
        email: "budi.santoso@mahasiswa.ac.id",
        displayName: "Budi Santoso",
      };
      
      let profile: User = {
        uid: mockUser.uid,
        email: mockUser.email,
        displayName: mockUser.displayName,
        partnerEmail: "rekan.belajar@gmail.com",
      };
      
      try {
        const userDocRef = doc(db, "users", mockUser.uid);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          profile = docSnap.data() as User;
        } else {
          await setDoc(userDocRef, profile);
        }
      } catch (dbError) {
        console.error("Failed to sync mock profile in Firestore (bypassing):", dbError);
      } finally {
        setUser(mockUser as any);
        setDbUser(profile);
        setLoading(false);
      }
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setUser(null);
      setDbUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, signInWithGoogle, logout }}>
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
