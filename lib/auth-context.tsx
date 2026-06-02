'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/src/firebase';
import { onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, SubscriptionTier } from '@/src/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  showCheckout: { active: boolean; tier: SubscriptionTier | null };
  setShowCheckout: (state: { active: boolean; tier: SubscriptionTier | null }) => void;
  loginGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState<{ active: boolean; tier: SubscriptionTier | null }>({
    active: false,
    tier: null
  });
  const router = useRouter();

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    try {
      const docRef = doc(db, 'users', uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const d = snapshot.data();
        setProfile({
          uid,
          email: d.email || auth.currentUser.email || '',
          displayName: d.displayName || auth.currentUser.displayName || 'Usuário',
          role: d.role || 'user',
          credits: d.credits ?? 5,
          subscriptionTier: d.subscriptionTier || 'free',
          imagesProcessed: d.imagesProcessed || 0,
          createdAt: d.createdAt?.toDate() || new Date(),
          updatedAt: d.updatedAt?.toDate() || new Date()
        });
      }
    } catch (err) {
      console.error("Erro ao sincronizar perfil do usuário: ", err);
    }
  };

  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    router.push('/');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      if (authUser) {
        setUser(authUser);
        const uid = authUser.uid;
        try {
          const docRef = doc(db, 'users', uid);
          const snapshot = await getDoc(docRef);

          if (snapshot.exists()) {
            const d = snapshot.data();
            setProfile({
              uid,
              email: d.email || authUser.email || '',
              displayName: d.displayName || authUser.displayName || 'Usuário',
              role: d.role || 'user',
              credits: d.credits ?? 5,
              subscriptionTier: d.subscriptionTier || 'free',
              imagesProcessed: d.imagesProcessed || 0,
              createdAt: d.createdAt?.toDate() || new Date(),
              updatedAt: d.updatedAt?.toDate() || new Date()
            });
          } else {
            const isAdmin = authUser.email === 'santwomusic@gmail.com' || authUser.email === 'brisasofc@gmail.com' || authUser.email === 'admin@pixelflow.ai';
            const initialProfile = {
              uid,
              email: authUser.email || '',
              displayName: authUser.displayName || 'Usuário',
              role: isAdmin ? 'admin' : 'user',
              credits: isAdmin ? 1000 : 5,
              subscriptionTier: 'free' as SubscriptionTier,
              imagesProcessed: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(docRef, initialProfile);
            setProfile({
              ...initialProfile,
              role: isAdmin ? 'admin' : 'user',
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        } catch (err) {
          console.error("Erro ao carregar dados do usuário:", err);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      authOpen,
      setAuthOpen,
      showCheckout,
      setShowCheckout,
      loginGoogle,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
