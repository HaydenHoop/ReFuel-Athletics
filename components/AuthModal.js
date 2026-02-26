"use client";
import { useState } from 'react';
import { useAuth } from './AuthContext';

function Input({ label, type = 'text', value, onChange, placeholder, error, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-black transition pr-10
            ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Symbol', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div className="mt-1">
      <div className="flex gap-1 mb-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {checks.map(c => (
            <span key={c.label} className={`text-xs ${c.pass ? 'text-green-600' : 'text-gray-300'}`}>
              {c.pass ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        <span className={`text-xs font-bold ${score > 0 ? colors[score-1].replace('bg-','text-') : 'text-gray-300'}`}>
          {score > 0 ? labels[score - 1] : ''}
        </span>
      </div>
    </div>
  );
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin' }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]       = useState(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');

  const reset = (newMode) => {
    setMode(newMode);
    setError('');
    setFieldErrors({});
    setName(''); setEmail(''); setPassword(''); setConfirm('');
  };

  const validateEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});
    const fe = {};

    if (mode === 'signup') {
      if (!name.trim()) fe.name = 'Required';
      if (!validateEmail(email)) fe.email = 'Valid email required';
      if (password.length < 8) fe.password = 'Minimum 8 characters';
      if (password !== confirm) fe.confirm = 'Passwords do not match';
      if (Object.keys(fe).length) { setFieldErrors(fe); return; }

      setLoading(true);
      const result = await signUp({ name, email, password });
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      onClose();

    } else {
      if (!validateEmail(email)) fe.email = 'Valid email required';
      if (!password) fe.password = 'Required';
      if (Object.keys(fe).length) { setFieldErrors(fe); return; }

      setLoading(true);
      const result = await signIn({ email, password });
      setLoading(false);
      if (result.error) { setError(result.error); return; }
      onClose();
    }
  };

  const handleKey = e => { if (e.key === 'Enter') handleSubmit(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onKeyDown={handleKey}>

        {/* Header */}
        <div className="bg-black text-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-black text-xs font-black">RF</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">ReFuel Athletics</span>
            </div>
            <h2 className="text-xl font-extrabold">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition">
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">

          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['signin', 'signup'].map(m => (
              <button key={m} onClick={() => reset(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all
                  ${mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Global error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Fields */}
          {mode === 'signup' && (
            <Input label="Full Name" value={name} onChange={setName} placeholder="Jane Athlete"
              autoComplete="name" error={fieldErrors.name} />
          )}
          <Input label="Email" type="email" value={email} onChange={setEmail}
            placeholder="you@example.com" autoComplete="email" error={fieldErrors.email} />
          <div>
            <Input label="Password" type="password" value={password} onChange={setPassword}
              placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              error={fieldErrors.password} />
            {mode === 'signup' && <PasswordStrength password={password} />}
          </div>
          {mode === 'signup' && (
            <Input label="Confirm Password" type="password" value={confirm} onChange={setConfirm}
              placeholder="Repeat password" autoComplete="new-password" error={fieldErrors.confirm} />
          )}

          {/* Security note */}
          <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2.5">
            <span className="text-base leading-none mt-0.5">🔒</span>
            <span>Your password is hashed before storage and never transmitted in plain text.</span>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <><span className="animate-spin">⏳</span> {mode === 'signin' ? 'Signing in...' : 'Creating account...'}</>
              : mode === 'signin' ? 'Sign In →' : 'Create Account →'
            }
          </button>

          {mode === 'signin' && (
            <p className="text-center text-xs text-gray-400">
              Don't have an account?{' '}
              <button onClick={() => reset('signup')} className="text-black font-semibold underline">Sign up free</button>
            </p>
          )}
          {mode === 'signup' && (
            <p className="text-center text-xs text-gray-400">
              Already have an account?{' '}
              <button onClick={() => reset('signin')} className="text-black font-semibold underline">Sign in</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
