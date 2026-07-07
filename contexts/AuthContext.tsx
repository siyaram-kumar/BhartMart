'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db, googleProvider } from '@/lib/firebase';
import {
  onAuthStateChanged, signOut as fbSignOut,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  RecaptchaVerifier, signInWithPhoneNumber, updateProfile,
  type User as FirebaseUser, type ConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { AppUser, UserRole } from '@/lib/types';

interface AuthContextValue {
  user: FirebaseUser | null;
  profile: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (confirmation: ConfirmationResult, otp: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

declare global { interface Window { recaptchaVerifier?: RecaptchaVerifier; recaptchaWidgetId?: number } }

function ensureRecaptcha(): RecaptchaVerifier {
  if (typeof window === 'undefined') throw new Error('reCAPTCHA can only run in browser');
  if (!document.getElementById('recaptcha-container')) {
    const div = document.createElement('div');
    div.id = 'recaptcha-container';
    div.style.position = 'fixed';
    div.style.bottom = '0';
    div.style.right = '0';
    document.body.appendChild(div);
  }
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
  }
  return window.recaptchaVerifier;
}

async function syncUserProfile(fbUser: FirebaseUser, extra?: Partial<AppUser>): Promise<AppUser> {
  const ref = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);
  const base: Partial<AppUser> = {
    uid: fbUser.uid,
    email: fbUser.email,
    phone: fbUser.phoneNumber,
    displayName: fbUser.displayName || extra?.displayName || null,
    photoURL: fbUser.photoURL,
    lastLogin: serverTimestamp(),
  };
  if (!snap.exists()) {
    const newProfile: AppUser = {
      ...(base as AppUser),
      role: (extra?.role as UserRole) || 'buyer',
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, newProfile);
    return newProfile;
  } else {
    await setDoc(ref, base, { merge: true });
    return { ...(snap.data() as AppUser), ...(base as any) };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (snap.exists()) setProfile(snap.data() as AppUser);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          if (snap.exists()) setProfile(snap.data() as AppUser);
          else { const p = await syncUserProfile(fbUser); setProfile(p); }
        } catch (e) { console.error('profile load error', e); }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(res.user);
  };
  const signInWithEmail = async (email: string, password: string) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    await syncUserProfile(res.user);
  };
  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(res.user, { displayName: name });
    await syncUserProfile(res.user, { displayName: name });
  };
  const sendPhoneOtp = async (phone: string) => {
    const verifier = ensureRecaptcha();
    return await signInWithPhoneNumber(auth, phone, verifier);
  };
  const verifyPhoneOtp = async (confirmation: ConfirmationResult, otp: string, name?: string) => {
    const res = await confirmation.confirm(otp);
    if (name) { try { await updateProfile(res.user, { displayName: name }); } catch {} }
    await syncUserProfile(res.user, { displayName: name });
  };
  const signOut = async () => {
    await fbSignOut(auth);
    if (typeof window !== 'undefined' && window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch {}
      window.recaptchaVerifier = undefined;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, sendPhoneOtp, verifyPhoneOtp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
