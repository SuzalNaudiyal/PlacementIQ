import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-10 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <span>HireMatrix AI — Placement & Skill Gap Analyzer</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">v1.0.0</span>
          </div>
          <p className="mt-1 text-slate-500">
            Full-Stack AI Career Intelligence Platform • Final Year B.Tech Engineering Project
          </p>
          <p className="mt-2 text-slate-500 text-[11px]">
            © {new Date().getFullYear()} <span className="text-slate-300 font-medium">Suzal Naudiyal</span>. All rights reserved.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            API Docs (Swagger)
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>•</span>
          <a
            href="http://localhost:8000/redoc"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            ReDoc
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Shield className="w-3 h-3 text-indigo-400" />
            Zero Fake Metrics Policy
          </span>
        </div>
      </div>
    </footer>
  );
};
