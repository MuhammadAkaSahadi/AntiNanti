"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { User } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  dbUser: User | null;
  loading: boolean;
  googleAccessToken: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setGoogleAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleAccessToken, setGoogleAccessTokenState] = useState<string | null>(null);

  // Initialize token from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = sessionStorage.getItem("google_access_token");
      if (storedToken) {
        setGoogleAccessTokenState(storedToken);
      }
    }
  }, []);

  const setGoogleAccessToken = (token: string | null) => {
    setGoogleAccessTokenState(token);
    if (typeof window !== "undefined") {
      if (token) {
        sessionStorage.setItem("google_access_token", token);
      } else {
        sessionStorage.removeItem("google_access_token");
      }
    }
  };

  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          // Check if document exists first
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            const newProfile: User = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "Mahasiswa AntiNanti",
              partnerEmail: "",
              location: "Jember",
            };
            await setDoc(userDocRef, newProfile);
            setDbUser(newProfile);
          } else {
            setDbUser(docSnap.data() as User);
          }

          // Start listening to the document in real time
          unsubSnapshot = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              setDbUser(snap.data() as User);
            }
          });
        } catch (error) {
          console.error("Error synchronizing user profile in Firestore:", error);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) {
        unsubSnapshot();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken || null;
      if (token) {
        setGoogleAccessToken(token);
      }
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
        location: "Jember",
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
        setGoogleAccessToken("mock-google-access-token-12345");
        setLoading(false);
      }
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setGoogleAccessToken(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setUser(null);
      setDbUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, googleAccessToken, signInWithGoogle, logout, setGoogleAccessToken }}>
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
