'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Store, Mail, Phone as PhoneIcon, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';


export function FirebaseLoginModal({
  open,
  onClose,
  onLoggedIn
}) {

  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPhoneOtp,
    verifyPhoneOtp
  } = useAuth();


  const [mode, setMode] = useState('choose');

  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);

  const [confirmation, setConfirmation] = useState(null);



  useEffect(() => {

    if (!open) {

      setMode('choose');
      setMobile('');
      setOtp('');
      setEmail('');
      setPassword('');
      setName('');
      setConfirmation(null);

    }

  }, [open]);




  const doGoogle = async () => {

    setLoading(true);

    try {

      await signInWithGoogle();

      toast.success('Welcome!');

      onLoggedIn?.();

      onClose();

    } catch (e) {

      toast.error(
        e?.message || 'Google sign-in failed'
      );

    } finally {

      setLoading(false);

    }

  };




  const doSendOtp = async () => {

    if (mobile.length < 10) {

      return toast.error(
        'Enter valid 10-digit mobile'
      );

    }


    setLoading(true);

    try {

      const conf = await sendPhoneOtp(
        '+91' + mobile
      );

      setConfirmation(conf);

      setMode('phone-otp');

      toast.success('OTP sent!');


    } catch (e) {

      toast.error(
        e?.message || 'Failed to send OTP'
      );


    } finally {

      setLoading(false);

    }

  };





  const doVerifyOtp = async () => {

    if (!confirmation || otp.length !== 6) {

      return toast.error(
        'Enter 6-digit OTP'
      );

    }


    setLoading(true);


    try {

      await verifyPhoneOtp(
        confirmation,
        otp,
        name || undefined
      );


      toast.success(
        'Welcome to BharatMART!'
      );


      onLoggedIn?.();

      onClose();


    } catch (e) {

      toast.error(
        e?.message || 'OTP verification failed'
      );


    } finally {

      setLoading(false);

    }

  };





  const doEmailSignIn = async () => {

    if (!email || !password) {

      return toast.error(
        'Enter email and password'
      );

    }


    setLoading(true);


    try {

      await signInWithEmail(
        email,
        password
      );

      toast.success(
        'Welcome back!'
      );

      onLoggedIn?.();

      onClose();


    } catch (e) {

      toast.error(
        e?.message || 'Sign-in failed'
      );

    } finally {

      setLoading(false);

    }

  };





  const doEmailSignUp = async () => {

    if (!email || !password || password.length < 6) {

      return toast.error(
        'Password must be 6+ chars'
      );

    }


    setLoading(true);


    try {

      await signUpWithEmail(
        email,
        password,
        name || undefined
      );


      toast.success(
        'Account created!'
      );


      onLoggedIn?.();

      onClose();


    } catch (e) {

      toast.error(
        e?.message || 'Sign-up failed'
      );

    } finally {

      setLoading(false);

    }

  };




  return (

    <Dialog
      open={open}
      onOpenChange={(v)=> !v && onClose()}
    >

      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">

        <div className="hero-gradient p-6 text-white">

          <div className="flex items-center gap-2">

            {
              mode !== 'choose' && (

                <button
                  onClick={()=>setMode('choose')}
                  className="w-8 h-8 rounded-full bg-white/20 grid place-items-center"
                >
                  <ArrowLeft className="w-4 h-4"/>
                </button>

              )
            }


            <div className="w-12 h-12 rounded-2xl bg-white/20 grid place-items-center">
              <Store className="w-6 h-6"/>
            </div>

          </div>


          <DialogTitle className="text-2xl font-bold text-white mt-3">
            Welcome to BharatMART
          </DialogTitle>


          <p className="text-white/80 text-sm mt-1">
            Sign in to shop wholesale
          </p>


        </div>



        <div className="p-6">

          {/* आपका बाकी JSX UI same रहेगा */}
          
          <div id="recaptcha-container"/>

        </div>


      </DialogContent>

    </Dialog>

  );

}