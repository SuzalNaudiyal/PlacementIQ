import React from 'react';
import { Sparkles, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isBackendOnline: boolean;
  latency: number | null;
  onOpenAuth: () => void;
  onNavigateToTour?: () => void;
  onNavigateToMeadow?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isBackendOnline,
  latency,
  onOpenAuth,
  onNavigateToTour,
  onNavigateToMeadow,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              HireMatrix <span className="text-cyan-400 font-medium text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">AI</span>
            </span>
            <p className="text-[11px] text-slate-400 hidden sm:block">Campus Placement & Career Intelligence OS</p>
          </div>
        </div>

        {/* Status Indicator, Docs & Auth Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Flower Meadow Hero Pill (21st.dev) */}
          {onNavigateToMeadow && (
            <button
              onClick={onNavigateToMeadow}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-rose-500/20 hover:-translate-y-0.5 hover:scale-[1.02]"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
              <span>🌸 Flower Meadow</span>
            </button>
          )}

          {/* Watch Tour Marketing Pill (Public - No Login Required) */}
          {onNavigateToTour && (
            <button
              onClick={onNavigateToTour}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-white px-3.5 py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-cyan-500/20 hover:-translate-y-0.5 hover:scale-[1.02]"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Watch Tour</span>
            </button>
          )}

          {/* API Health Pill */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              {isBackendOnline && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isBackendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-slate-300 font-medium">
              API: {isBackendOnline ? 'Online' : 'Checking...'}
            </span>
            {latency !== null && (
              <span className="text-slate-500 text-[11px]">({latency}ms)</span>
            )}
          </div>

          {/* User Session Profile or Sign In Button */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                <div className="h-7 w-7 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs uppercase">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-white leading-tight truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-indigo-400 capitalize">{user.role}</div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out of your session"
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
