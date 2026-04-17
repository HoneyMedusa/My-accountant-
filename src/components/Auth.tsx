import React, { useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn, UserPlus, KeyRound, Building2, Chrome, UserCheck } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isReset) {
        await sendPasswordResetEmail(auth, email);
        setMessage('Password reset email sent! Check your inbox.');
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if profile exists
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (!profileSnap.exists()) {
          // Create user profile in Firestore
          await setDoc(profileRef, {
            uid: user.uid,
            email: user.email,
            businessName: businessName,
            createdAt: serverTimestamp(),
          });
        }

        await updateProfile(user, { displayName: businessName });
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase Console. Please use Google Sign-In or enable it.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if profile exists, if not create a default one
      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          uid: user.uid,
          email: user.email,
          businessName: user.displayName || 'My Business',
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      // Use a demo-friendly approach: try to sign up/in with a dummy email
      // or just bypass if the app allowed guest mode. 
      // For now, let's use a standard "demo@example.com" login
      // but if that fails (not created), we try to create it.
      const demoEmail = 'demo@accountant.co.za';
      const demoPass = 'demo123456';
      
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (e: any) {
        // If not found, create it
        const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email: demoEmail,
          businessName: 'Jozi Demo Store',
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      setError("Demo login currently unavailable. Please use Sign Up or Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F7F9]">
      <div className="card w-full max-w-md py-10 px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1A1A1A] text-white rounded-xl mb-4 shadow-lg">
            <Building2 size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-[#1A1A1A]">MY ACCOUNTANT</h1>
          <p className="text-[0.7rem] font-bold text-[#6B778C] mt-2 uppercase tracking-widest">
            {isReset ? 'Reset your password' : isLogin ? 'Sign in to your account' : 'Create your business account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isReset && (
            <div>
              <label className="stat-label">Business Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="E.G. JOZI COFFEE SHOP"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="stat-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="YOU@EXAMPLE.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {!isReset && (
            <div>
              <label className="stat-label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && <p className="text-[#DE350B] text-xs font-bold uppercase tracking-wider">{error}</p>}
          {message && <p className="text-[#00875A] text-xs font-bold uppercase tracking-wider">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6 py-3"
          >
            {loading ? 'PROCESSING...' : isReset ? (
              <>
                <KeyRound size={18} />
                SEND RESET LINK
              </>
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                SIGN IN
              </>
            ) : (
              <>
                <UserPlus size={18} />
                CREATE ACCOUNT
              </>
            )}
          </button>
        </form>

        {isLogin && !isReset && (
          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E0E4E8]"></div>
              </div>
              <div className="relative flex justify-center text-[0.65rem] font-black uppercase">
                <span className="bg-[#F4F7F9] px-4 text-[#6B778C]">OR CONTINUE WITH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-secondary flex items-center justify-center gap-2 py-2.5 text-[0.7rem]"
              >
                <Chrome size={16} />
                GOOGLE
              </button>
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="btn-secondary flex items-center justify-center gap-2 py-2.5 text-[0.7rem] border-[#0066FF] text-[#0066FF]"
              >
                <UserCheck size={16} />
                DEMO
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center space-y-3">
          {!isReset ? (
            <>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[0.7rem] font-bold text-[#6B778C] hover:text-[#1A1A1A] uppercase tracking-wider"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
              <br />
              <button
                onClick={() => setIsReset(true)}
                className="text-[0.7rem] font-bold text-[#6B778C] hover:text-[#1A1A1A] uppercase tracking-wider"
              >
                Forgot password?
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsReset(false)}
              className="text-[0.7rem] font-bold text-[#6B778C] hover:text-[#1A1A1A] uppercase tracking-wider"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
