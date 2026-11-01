import React, { useState } from 'react';
import { Database, Server, RefreshCw, CheckCircle2, AlertTriangle, Cpu, Terminal, Clock } from 'lucide-react';
import type { HealthResponse } from '../types/system';

interface SystemHealthBannerProps {
  healthData: HealthResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  latency: number | null;
}

export const SystemHealthBanner: React.FC<SystemHealthBannerProps> = ({
  healthData,
  loading,
  error,
  onRefresh,
  latency,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  const isDbConnected = healthData?.database?.status === 'connected';

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Phase 1 Verified
              </span>
              <span className="text-xs text-slate-400">REST API & Frontend Handshake</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-1">Live System Telemetry & Connectivity</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              {showRawJson ? 'Hide JSON' : 'Inspect JSON'}
            </button>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 rounded-lg transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Test API Latency
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          {/* FastAPI Core */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-indigo-400" />
                FastAPI Gateway
              </span>
              {healthData ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div>
              <div className="text-lg font-bold text-white">
                {healthData ? 'Operational' : loading ? 'Probing...' : 'Unavailable'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Version: {healthData?.version || '1.0.0'} ({healthData?.environment || 'dev'})
              </div>
            </div>
          </div>

          {/* MongoDB Status */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                MongoDB Driver (Motor)
              </span>
              {isDbConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Ready for Mongo
                </span>
              )}
            </div>
            <div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                {isDbConnected ? 'Connected' : 'Configured'}
                {healthData?.database?.latency_ms && (
                  <span className="text-xs font-normal text-emerald-400">
                    {healthData.database.latency_ms}ms
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 truncate" title={healthData?.database?.database || 'placement_predictor_db'}>
                Database: {healthData?.database?.database || 'placement_predictor_db'}
              </div>
            </div>
          </div>

          {/* Network Latency */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-400" />
                Roundtrip Latency
              </span>
              <span className="text-[10px] text-slate-500">HTTP GET</span>
            </div>
            <div>
              <div className="text-lg font-bold text-white">
                {latency !== null ? `${latency} ms` : loading ? 'Measuring...' : 'N/A'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Endpoint: <code className="text-indigo-300">/api/health</code>
              </div>
            </div>
          </div>

          {/* Pipeline Modules */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                ML & NLP Pipeline
              </span>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                Phase 4/6
              </span>
            </div>
            <div>
              <div className="text-lg font-bold text-white">Modules Ready</div>
              <div className="text-xs text-slate-400 mt-0.5">
                spaCy · Scikit-learn · XGBoost
              </div>
            </div>
          </div>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Connection Notice: {error}. Backend is starting or running on custom port.</span>
          </div>
        )}

        {/* Raw JSON Debug Viewer */}
        {showRawJson && healthData && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-left overflow-x-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>GET /api/health Response</span>
              <span className="text-emerald-400">200 OK</span>
            </div>
            <pre className="text-xs text-slate-300 font-mono">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
