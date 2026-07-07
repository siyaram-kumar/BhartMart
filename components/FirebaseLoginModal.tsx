'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, Mail, Phone as PhoneIcon, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { ConfirmationResult } from 'firebase/auth';

type Mode = 'choose' | 'phone-input' | 'phone-otp' | 'email-signin' | 'email-signup';

export function FirebaseLoginModal({ open, onClose, onLoggedIn }: { open: boolean; onClose: () => void; onLoggedIn?: () => void }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const [mode, setMode] = useState<Mode>('choose');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  useEffect(() => { if (!open) { setMode('choose'); setMobile(''); setOtp(''); setEmail(''); setPassword(''); setName(''); setConfirmation(null); } }, [open]);

  const doGoogle = async () => {
    setLoading(true);
    try { await signInWithGoogle(); toast.success('Welcome!'); onLoggedIn?.(); onClose(); }
    catch (e: any) { toast.error(e?.message || 'Google sign-in failed'); }
    finally { setLoading(false); }
  };

  const doSendOtp = async () => {
    if (mobile.length < 10) return toast.error('Enter valid 10-digit mobile');
    setLoading(true);
    try {
      const conf = await sendPhoneOtp('+91' + mobile);
      setConfirmation(conf); setMode('phone-otp');
      toast.success('OTP sent!');
    } catch (e: any) { toast.error(e?.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const doVerifyOtp = async () => {
    if (!confirmation || otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      await verifyPhoneOtp(confirmation, otp, name || undefined);
      toast.success('Welcome to BharatMART!');
      onLoggedIn?.(); onClose();
    } catch (e: any) { toast.error(e?.message || 'OTP verification failed'); }
    finally { setLoading(false); }
  };

  const doEmailSignIn = async () => {
    if (!email || !password) return toast.error('Enter email and password');
    setLoading(true);
    try { await signInWithEmail(email, password); toast.success('Welcome back!'); onLoggedIn?.(); onClose(); }
    catch (e: any) { toast.error(e?.message || 'Sign-in failed'); }
    finally { setLoading(false); }
  };

  const doEmailSignUp = async () => {
    if (!email || !password || password.length < 6) return toast.error('Password must be 6+ chars');
    setLoading(true);
    try { await signUpWithEmail(email, password, name || undefined); toast.success('Account created!'); onLoggedIn?.(); onClose(); }
    catch (e: any) { toast.error(e?.message || 'Sign-up failed'); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
        <div className="hero-gradient p-6 text-white">
          <div className="flex items-center gap-2">
            {mode !== 'choose' && (
              <button onClick={() => setMode('choose')} className="w-8 h-8 rounded-full bg-white/20 grid place-items-center hover:bg-white/30">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur grid place-items-center"><Store className="w-6 h-6" /></div>
          </div>
          <DialogTitle className="text-2xl font-bold text-white mt-3">Welcome to BharatMART</DialogTitle>
          <p className="text-white/80 text-sm mt-1">Sign in to shop wholesale</p>
        </div>
        <div className="p-6">
          {mode === 'choose' && (
            <div className="space-y-3">
              <Button onClick={doGoogle} disabled={loading} variant="outline" className="w-full h-12 rounded-full font-semibold border-slate-200">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>
              <Button onClick={() => setMode('phone-input')} className="w-full h-12 rounded-full bg-teal-700 hover:bg-teal-800 font-semibold">
                <PhoneIcon className="w-4 h-4 mr-2" /> Continue with Mobile OTP
              </Button>
              <div className="relative py-1"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-400">or</span></div></div>
              <Button onClick={() => setMode('email-signin')} variant="outline" className="w-full h-11 rounded-full font-medium">
                <Mail className="w-4 h-4 mr-2" /> Sign in with Email
              </Button>
              <button onClick={() => setMode('email-signup')} className="w-full text-sm text-teal-700 hover:underline">New here? Create account</button>
            </div>
          )}
          {mode === 'phone-input' && (
            <>
              <label className="text-xs font-medium text-slate-600">Mobile Number</label>
              <div className="mt-1 flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <span className="px-3 text-sm text-slate-600 bg-slate-50 h-11 grid place-items-center">🇮🇳 +91</span>
                <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" className="flex-1 h-11 px-3 outline-none" />
              </div>
              <label className="text-xs font-medium text-slate-600 mt-3 block">Your Name (optional)</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Kumar" className="mt-1 rounded-xl h-11" />
              <Button disabled={loading} onClick={doSendOtp} className="w-full mt-4 h-12 rounded-full bg-teal-700 hover:bg-teal-800 font-semibold">{loading ? 'Sending...' : 'Send OTP'}</Button>
            </>
          )}
          {mode === 'phone-otp' && (
            <>
              <div className="text-sm text-slate-600 mb-2">Enter OTP sent to <b>+91 {mobile}</b></div>
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="••••••" className="w-full h-14 text-center text-2xl tracking-[0.5em] border-2 border-slate-200 rounded-xl focus:border-teal-600 outline-none font-bold" />
              <Button disabled={loading} onClick={doVerifyOtp} className="w-full mt-4 h-12 rounded-full bg-teal-700 hover:bg-teal-800 font-semibold">{loading ? 'Verifying...' : 'Verify & Continue'}</Button>
            </>
          )}
          {mode === 'email-signin' && (
            <>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 h-11 rounded-xl" />
              <label className="text-xs font-medium text-slate-600 mt-3 block">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 h-11 rounded-xl" />
              <Button disabled={loading} onClick={doEmailSignIn} className="w-full mt-4 h-12 rounded-full bg-teal-700 hover:bg-teal-800 font-semibold">{loading ? 'Signing in...' : 'Sign In'}</Button>
              <button onClick={() => setMode('email-signup')} className="w-full mt-2 text-sm text-teal-700 hover:underline">New here? Create account</button>
            </>
          )}
          {mode === 'email-signup' && (
            <>
              <label className="text-xs font-medium text-slate-600">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Kumar" className="mt-1 h-11 rounded-xl" />
              <label className="text-xs font-medium text-slate-600 mt-3 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1 h-11 rounded-xl" />
              <label className="text-xs font-medium text-slate-600 mt-3 block">Password (6+ chars)</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 h-11 rounded-xl" />
              <Button disabled={loading} onClick={doEmailSignUp} className="w-full mt-4 h-12 rounded-full bg-teal-700 hover:bg-teal-800 font-semibold">{loading ? 'Creating...' : 'Create Account'}</Button>
              <button onClick={() => setMode('email-signin')} className="w-full mt-2 text-sm text-teal-700 hover:underline">Have an account? Sign in</button>
            </>
          )}
          <div id="recaptcha-container" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
