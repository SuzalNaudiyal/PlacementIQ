import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Sparkles,
  LogIn,
  UserPlus,
  UserCheck,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Mail,
} from 'lucide-react';
import { requestPasswordResetOTP, resetPasswordWithOTP } from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'signin',
}) => {
  const { login, register, quickDemoLogin } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register' | 'forgot'>(initialTab);
  
  // Registration & Login Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password & OTP Fields
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Feedback States
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (tab === 'signin') {
        // email field can be email OR username
        await login({ email: email.trim(), password });
        onClose();
      } else if (tab === 'register') {
        await register({
          username: username.trim(),
          email: email.trim(),
          password,
        });
        onClose();
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await requestPasswordResetOTP(forgotEmail.trim());
      setForgotStep('verify');
      setSuccessMsg(
        res.message ||
          `A 6-digit verification code has been dispatched to ${forgotEmail}.`
      );
      if (res.otp_debug) {
        // Pre-fill or inform in debug mode
        setOtpCode(res.otp_debug);
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Could not send verification OTP. Please verify email address.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !newPassword || !confirmPassword) {
      setError('Please fill in all verification and password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match. Please re-enter.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const res = await resetPasswordWithOTP({
        email: forgotEmail.trim(),
        otp: otpCode.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      // Switch back to Sign In with success message
      setSuccessMsg(res.message || 'Password successfully updated! Please sign in with your new credentials.');
      setTab('signin');
      setEmail(forgotEmail.trim());
      setPassword('');
      setForgotStep('request');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Password reset failed. Invalid or expired OTP.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async (demoRole: 'student' | 'admin') => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await quickDemoLogin(demoRole);
      onClose();
    } catch (err: any) {
      setError('Could not connect to authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">HireMatrix AI Access</h3>
            <p className="text-xs text-slate-400">Campus Placement & Assessment Portal</p>
          </div>
        </div>

        {/* Quick Demo Preview for Students */}
        {tab !== 'forgot' && (
          <div className="mb-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Quick Preview:</span> Try student view
            </div>
            <button
              type="button"
              onClick={() => handleDemoClick('student')}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Demo Student
            </button>
          </div>
        )}

        {/* Tab Switcher */}
        {tab !== 'forgot' ? (
          <div className="flex border-b border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                tab === 'signin'
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                tab === 'register'
                  ? 'text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Account
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Password Recovery & OTP Verification</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="leading-relaxed">{successMsg}</div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="leading-relaxed">
              <span>{error}</span>
              {error.includes('already exists') && tab === 'register' && (
                <div className="mt-1.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signin');
                      setError(null);
                    }}
                    className="text-xs underline text-indigo-300 hover:text-white"
                  >
                    Go to Sign In
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setForgotEmail(email);
                      setError(null);
                    }}
                    className="text-xs underline text-cyan-300 hover:text-white"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------- TAB: SIGN IN & CREATE ACCOUNT -------------------- */}
        {tab !== 'forgot' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex2026"
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {tab === 'signin' ? 'Email Address or Username' : 'Email Address'}
              </label>
              <input
                type={tab === 'signin' ? 'text' : 'email'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  tab === 'signin'
                    ? 'e.g. candidate@university.edu or username'
                    : 'e.g. candidate@university.edu'
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setForgotStep('request');
                      setForgotEmail(email.includes('@') ? email : '');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'signin' ? 'Enter your password' : 'Create a secure password (min 6 chars)'}
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : tab === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Dashboard
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account & Start Assessment
                </>
              )}
            </button>
          </form>
        )}

        {/* -------------------- TAB: FORGOT PASSWORD FLOW -------------------- */}
        {tab === 'forgot' && (
          <div className="space-y-4">
            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered account email. We will generate and dispatch a 6-digit OTP code to verify and reset your password.
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. candidate@university.edu"
                      className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Send Verification OTP
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs">
                  Enter the 6-digit OTP dispatched to <span className="font-semibold text-white">{forgotEmail}</span>.
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    6-Digit Verification OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 581923"
                    className="w-full px-3.5 py-2 text-sm font-mono tracking-widest text-center bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password for safety"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Verify OTP & Update Password
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep('request')}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Change Email Address
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    disabled={isSubmitting}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
