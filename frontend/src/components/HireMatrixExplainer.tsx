// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import {
  Layers, ShieldCheck, Activity, FileText, Target, Sparkles, Play, Pause,
  ChevronRight, ChevronLeft, RotateCcw, AlertTriangle, Users, Briefcase, CheckCircle2,
  Volume2, VolumeX, Mic,
} from "lucide-react";

const SCENES = [
  { s: 0, e: 8, name: "The Challenge", tag: "Campus Friction", sub: "Every campus placement season, students and colleges face recruitment blindly — without knowing their true hiring readiness." },
  { s: 8, e: 16, name: "Introducing HireMatrix", tag: "AI Intelligence", sub: "Meet HireMatrix AI: the next-generation platform turning placement guesswork into actionable intelligence." },
  { s: 16, e: 25, name: "Readiness Assessment", tag: "TreeSHAP Explained", sub: "No black-box scores. TreeSHAP reveals the exact mathematical drivers behind your readiness — from CGPA to coding skills." },
  { s: 25, e: 34, name: "ATS & Skill Gap", tag: "Role Fit & Audit", sub: "Instant ATS resume audits, paired with three-tier skill gap analysis. We pinpoint exactly what you need to level up." },
  { s: 34, e: 42, name: "Roadmap & Job Match", tag: "8-Week Execution", sub: "Turn missing skills into structured, eight-week action roadmaps — matched semantically to real company job profiles." },
  { s: 42, e: 50, name: "Command Center", tag: "Institutional KPI", sub: "One institutional command center: track cohort readiness in real-time, flag at-risk students, and drive placement success." },
];

const TRANSITIONS = [
  "hmGlitchIn .65s cubic-bezier(0.16, 1, 0.3, 1)",
  "hmPortalBurst .75s cubic-bezier(0.16, 1, 0.3, 1)",
  "hmHoloSlide .65s cubic-bezier(0.16, 1, 0.3, 1)",
  "hmScannerDrop .65s cubic-bezier(0.16, 1, 0.3, 1)",
  "hmMilestoneSnap .65s cubic-bezier(0.16, 1, 0.3, 1)",
  "hmCommandAscend .8s cubic-bezier(0.16, 1, 0.3, 1)",
];

const TRANSITION_NAMES = [
  "Glitch & Scan",
  "3D Portal Burst",
  "Hologram Slide",
  "Scanner Drop",
  "Milestone Snap",
  "Command Ascend",
];
const TOTAL = 50;
const clamp = (x) => Math.max(0, Math.min(1, x));
const pr = (lt, a, b) => clamp((lt - a) / (b - a));
const ease = (x) => 1 - Math.pow(1 - x, 3);
const fmt = (x) => `0:${String(Math.floor(x)).padStart(2, "0")}`;
const GRAD = "bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500";
const GLASS = "bg-white/5 backdrop-blur-md border border-white/10";

const F = ({ lt, a, children, className = "" }) => {
  const p = ease(pr(lt, a, a + 0.7));
  return <div className={className} style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>{children}</div>;
};

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  l: (i * 47) % 100, t: (i * 31) % 100, d: 6 + (i % 5) * 2, z: 2 + (i % 3) * 2, dl: (i % 7) * -1.3, c: i % 3,
}));
const PCOL = ["#22d3ee", "#818cf8", "#a78bfa"];

/* ---------- Scene 1 ---------- */
function Challenge({ lt }) {
  const rej = Math.floor(68 * ease(pr(lt, 0.8, 5)));
  const resumes = [[-210, -20, -9], [-120, 30, 6], [110, 25, -5], [200, -25, 10], [0, 45, 3]];
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 px-8">
      <F lt={lt} a={0.2}><h2 className="text-3xl font-bold tracking-tight text-white text-center">The Campus Recruitment Barrier</h2></F>
      <div className="relative w-full h-28">
        {resumes.map(([x, y, r], i) => {
          const p = ease(pr(lt, 0.8 + i * 0.35, 1.8 + i * 0.35));
          return (
            <div key={i} className={`absolute left-1/2 top-2 w-16 h-20 rounded-md ${GLASS} p-1.5`}
              style={{ transform: `translate(${x * p - 32}px, ${y * p}px) rotate(${r * p}deg)`, opacity: p }}>
              <div className="h-1.5 w-8 bg-slate-500 rounded mb-1.5" />
              {[0, 1, 2, 3].map((k) => <div key={k} className="h-1 bg-slate-700 rounded mb-1" style={{ width: `${95 - k * 15}%` }} />)}
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-400/70">?</div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 items-center">
        <F lt={lt} a={2}>
          <div className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-950/30 px-4 py-2">
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle cx="27" cy="27" r="22" fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle cx="27" cy="27" r="22" fill="none" stroke="#fb7185" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={138} strokeDashoffset={138 * (1 - rej / 100)} transform="rotate(-90 27 27)" />
            </svg>
            <div><div className="text-2xl font-bold text-rose-400 tabular-nums">{rej}%</div><div className="text-xs text-rose-300/80">rejected at first screen</div></div>
          </div>
        </F>
        {["Skill gap detected", "No readiness visibility"].map((w, i) => (
          <F key={w} lt={lt} a={3.2 + i * 0.6}>
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-300 text-sm"
              style={{ boxShadow: `0 0 ${10 + Math.sin(lt * 4 + i) * 8}px rgba(244,63,94,.35)` }}>
              <AlertTriangle size={16} /> {w}
            </div>
          </F>
        ))}
      </div>
    </div>
  );
}

/* ---------- Scene 2 ---------- */
function Intro({ lt, t }) {
  const COLS = 14, ROWS = 7;
  const stats = [["96.1%", "Accuracy"], ["0.988", "ROC-AUC"], ["4,500", "Profiles Evaluated"]];
  const reveal = pr(lt, 0.2, 2.2) * (COLS + ROWS + 4);
  return (
    <div className="h-full relative flex flex-col items-center justify-center gap-3">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {Array.from({ length: COLS * ROWS }, (_, n) => {
            const c = n % COLS, r = Math.floor(n / COLS);
            const on = clamp(reveal - (c + r));
            const pulse = 0.5 + 0.5 * Math.sin(t * 3 - (c + r) * 0.6);
            return <div key={n} className="w-6 h-6 rounded-md" style={{
              background: `rgba(${r % 2 ? "34,211,238" : "139,92,246"},${on * (0.15 + pulse * 0.35)})`,
              border: `1px solid rgba(129,140,248,${on * 0.4})`, transform: `scale(${0.6 + on * 0.4})`,
            }} />;
          })}
        </div>
      </div>
      <div className="relative flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-cyan-400 to-violet-600"
          style={{ opacity: pr(lt, 1.6, 2.4), transform: `perspective(600px) rotateY(${Math.sin(t * 1.2) * 16}deg)`, boxShadow: "0 0 50px rgba(34,211,238,.55), inset 0 0 18px rgba(255,255,255,.3)" }}>
          <Layers size={42} className="text-white" />
        </div>
        <F lt={lt} a={2.2} className="text-center">
          <h2 className="text-4xl font-black text-white tracking-tight">PlacementIQ <span className="text-cyan-300">AI</span></h2>
          <p className="text-indigo-200 text-sm">Explainable AI Career Intelligence &amp; Placement Readiness Suite</p>
        </F>
        <div className="flex gap-3">
          {stats.map(([v, l], i) => (
            <F key={l} lt={lt} a={3.6 + i * 0.7}>
              <div className={`${GLASS} rounded-xl px-4 py-2 text-center`}>
                <div className="text-xl font-bold text-white">{v}</div><div className="text-xs text-cyan-200">{l}</div>
              </div>
            </F>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Scene 3 ---------- */
function Shap({ lt }) {
  const val = Math.round(92 * ease(pr(lt, 0.5, 3.5)));
  const C = Math.PI * 70;
  const rows = [["Baseline", 60, "base"], ["+ CGPA 8.9", 14, "pos"], ["+ Coding Score", 11, "pos"], ["+ Internships", 9, "pos"], ["− Backlogs (2)", -2, "neg"]];
  let run = 0;
  const laid = rows.map(([l, d, k]) => { const start = k === "base" ? 0 : d > 0 ? run : run + d; run = k === "base" ? d : run + d; return [l, d, k, start]; });
  return (
    <div className="h-full flex items-center justify-center gap-10 px-8">
      <div className="text-center">
        <svg width="190" height="115" viewBox="0 0 190 115">
          <defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#a78bfa" /></linearGradient></defs>
          <path d="M25 95 A70 70 0 0 1 165 95" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
          <path d="M25 95 A70 70 0 0 1 165 95" fill="none" stroke="url(#hg)" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - val / 100)} />
          <text x="95" y="88" textAnchor="middle" className="fill-white" style={{ fontSize: 36, fontWeight: 800 }}>{val}%</text>
        </svg>
        <div className="text-sm text-slate-300 -mt-1">Placement Readiness Assessment</div>
        <div className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-300"><ShieldCheck size={14} /> TreeSHAP explained</div>
      </div>
      <div className={`w-80 ${GLASS} rounded-xl p-4`}>
        <div className="flex items-center gap-2 text-white font-semibold mb-3"><Activity size={18} className="text-cyan-300" /> SHAP waterfall</div>
        {laid.map(([label, d, kind, start], i) => {
          const p = ease(pr(lt, 3.8 + i * 0.9, 4.7 + i * 0.9));
          const col = kind === "pos" ? "bg-emerald-400" : kind === "neg" ? "bg-rose-400" : "bg-slate-500";
          return (
            <div key={label} className="flex items-center gap-2 mb-2 text-xs">
              <div className="w-28 text-slate-300 text-right">{label}</div>
              <div className="relative h-4 flex-1 bg-slate-800/60 rounded overflow-hidden">
                <div className={`absolute h-4 rounded ${col}`} style={{ left: `${start * 0.9}%`, width: `${Math.max(Math.abs(d) * 0.9, 1.5) * p}%` }} />
              </div>
              <div className={`w-8 ${kind === "neg" ? "text-rose-300" : kind === "pos" ? "text-emerald-300" : "text-slate-400"}`} style={{ opacity: p }}>{kind === "base" ? d : d > 0 ? `+${d}` : d}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Scene 4 ---------- */
function Ats({ lt }) {
  const dims = [["Keywords", 92], ["Formatting", 86], ["Experience", 88], ["Education", 85], ["Impact", 89]];
  const axes = ["Python", "ML Theory", "SQL", "MLOps", "Statistics", "Deep Learning"];
  const stu = [90, 78, 82, 40, 70, 60], role = [90, 90, 75, 80, 85, 85];
  const scan = pr(lt, 0.5, 4);
  const pt = (v, i, k) => { const a = (Math.PI * 2 * i) / 6 - Math.PI / 2, r = (v / 100) * 70 * k; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
  const poly = (arr, k) => arr.map((v, i) => pt(v, i, k).join(",")).join(" ");
  const k = ease(pr(lt, 4.5, 7));
  const score = Math.round(88 * ease(pr(lt, 3, 6)));
  const tiers = [["Critical", "text-rose-300 border-rose-400/40", "MLOps"], ["Important", "text-amber-300 border-amber-400/40", "Deep Learning"], ["Nice to have", "text-cyan-300 border-cyan-400/40", "Statistics"]];
  return (
    <div className="h-full flex items-center justify-center gap-8 px-6">
      <div className="relative w-40 h-52 rounded-lg bg-slate-100/95 p-3 overflow-hidden shadow-[0_0_40px_rgba(34,211,238,.35)]">
        <FileText size={18} className="text-slate-500 mb-2" />
        {Array.from({ length: 11 }, (_, i) => <div key={i} className="h-1.5 rounded bg-slate-300 mb-2" style={{ width: `${100 - (i % 4) * 14}%` }} />)}
        <div className="absolute left-0 right-0 h-0.5 bg-cyan-400" style={{ top: `${scan * 100}%`, opacity: scan < 1 ? 1 : 0, boxShadow: "0 0 14px 4px rgba(34,211,238,.85)" }} />
      </div>
      <div className="w-44">
        <div className="text-center mb-2"><span className="text-4xl font-black text-white">{score}</span><span className="text-slate-400">/100 ATS</span></div>
        {dims.map(([n, v], i) => (
          <div key={n} className="mb-1.5">
            <div className="flex justify-between text-[11px] text-slate-300"><span>{n}</span><span>{v}</span></div>
            <div className="h-1.5 bg-slate-800 rounded"><div className={`h-1.5 rounded ${GRAD}`} style={{ width: `${v * ease(pr(lt, 3 + i * 0.4, 4.5 + i * 0.4))}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="text-center">
        <svg width="220" height="200" viewBox="-20 0 240 210">
          {[0.33, 0.66, 1].map((s) => <polygon key={s} points={poly([100, 100, 100, 100, 100, 100], s)} fill="none" stroke="#334155" />)}
          {axes.map((a, i) => { const [x, y] = pt(118, i, 1); return <text key={a} x={x} y={y + 3} textAnchor="middle" fontSize="9" className="fill-slate-300">{a}</text>; })}
          <polygon points={poly(role, k)} fill="rgba(167,139,250,.12)" stroke="#a78bfa" strokeDasharray="4 3" />
          <polygon points={poly(stu, k)} fill="rgba(34,211,238,.3)" stroke="#22d3ee" strokeWidth="2" />
        </svg>
        <div className="flex gap-3 justify-center text-[11px] mb-1"><span className="text-cyan-300">● Student</span><span className="text-violet-300">● ML Engineer role</span></div>
        <div className="flex gap-1.5 justify-center">
          {tiers.map(([n, c, s], i) => <F key={n} lt={lt} a={7 + i * 0.5}><div className={`text-[10px] rounded border px-1.5 py-0.5 ${c}`}>{n}: {s}</div></F>)}
        </div>
      </div>
    </div>
  );
}

/* ---------- Scene 5 ---------- */
function Roadmap({ lt }) {
  const wk = [["Python+", "Refactor 2 projects"], ["Stats", "Probability sprint"], ["ML core", "Build 1 model"], ["MLOps", "Deploy an API"], ["Projects", "Publish portfolio"], ["DSA", "40 problems"], ["Mock", "3 interviews"], ["Apply", "10 applications"]];
  const fill = pr(lt, 0.5, 5.5);
  const jobs = [["ML Engineer", "Nimbus AI", 94], ["Data Scientist", "Finlytics", 88], ["MLOps Engineer", "Orbit Labs", 81]];
  return (
    <div className="h-full flex flex-col justify-center gap-5 px-8">
      <div>
        <div className="flex items-center gap-2 text-white font-semibold mb-3"><Target size={18} className="text-cyan-300" /> 8-week roadmap</div>
        <div className="relative">
          <div className="absolute top-3 left-6 right-6 h-1 bg-slate-800 rounded" />
          <div className={`absolute top-3 left-6 h-1 rounded ${GRAD}`} style={{ width: `calc((100% - 48px) * ${fill})` }} />
          <div className="relative flex justify-between">
            {wk.map(([w, task], i) => {
              const done = fill >= i / 7 - 0.001;
              return (
                <div key={w} className="flex flex-col items-center w-[12%]">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? "bg-cyan-300 text-slate-950" : "bg-slate-800 text-slate-400"}`} style={{ boxShadow: done ? "0 0 14px rgba(34,211,238,.7)" : "none" }}>
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <div className="text-[10px] text-slate-200 mt-1">Wk {i + 1} · {w}</div>
                  <div className={`text-[9px] text-center ${done ? "text-emerald-300" : "text-slate-500"}`}>{done ? "✓ " : "☐ "}{task}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 text-white font-semibold mb-2"><Briefcase size={18} className="text-cyan-300" /> TF-IDF job match</div>
        <div className="grid grid-cols-3 gap-3">
          {jobs.map(([j, co, m], i) => (
            <F key={j} lt={lt} a={4.8 + i * 0.7}>
              <div className={`${GLASS} rounded-xl p-3`}>
                <div className="text-xs text-white">{j}</div><div className="text-[11px] text-slate-400 mb-2">{co}</div>
                <div className="h-1.5 bg-slate-800 rounded mb-1"><div className={`h-1.5 rounded ${GRAD}`} style={{ width: `${m * ease(pr(lt, 5.2 + i * 0.7, 6.8 + i * 0.7))}%` }} /></div>
                <div className="text-xs text-cyan-200">{m}% match</div>
              </div>
            </F>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Scene 6 ---------- */
function Admin({ lt, t }) {
  if (lt > 4.8) {
    const p = ease(pr(lt, 4.8, 6.2));
    return (
      <div className="h-full flex items-center justify-center" style={{ opacity: p }}>
        <div className={`${GLASS} rounded-3xl px-12 py-8 text-center`} style={{ transform: `scale(${0.94 + 0.06 * p})`, boxShadow: `0 0 ${50 + Math.sin(t * 3) * 15}px rgba(99,102,241,.5)` }}>
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center mb-3"><Sparkles size={32} className="text-white" /></div>
          <h2 className="text-3xl font-black text-white tracking-tight">PlacementIQ AI</h2>
          <p className="text-lg text-cyan-200">Engineered by Suzal Naudiyal</p>
          <p className="text-xs text-slate-400 mt-2">FastAPI · React 19 · TypeScript · MongoDB · Scikit-Learn · TreeSHAP</p>
          <p className="text-xs text-emerald-300 mt-1">100% automated test pass rate</p>
        </div>
      </div>
    );
  }
  const depts = [["CSE", 88], ["ECE", 74], ["Mech", 61], ["Civil", 55]];
  return (
    <div className="h-full flex items-center justify-center gap-6 px-8">
      <div className="grid grid-cols-2 gap-3">
        {[["Cohort ready", `${Math.round(78 * ease(pr(lt, 0.4, 2.5)))}%`, Users, "text-cyan-300"], ["At-risk students", Math.round(142 * ease(pr(lt, 0.8, 2.8))), AlertTriangle, "text-rose-300"]].map(([l, v, Ic, c], i) => (
          <F key={l} lt={lt} a={0.2 + i * 0.3}>
            <div className={`${GLASS} rounded-xl p-4 w-40`}><Ic size={18} className={c} /><div className="text-3xl font-bold text-white mt-1 tabular-nums">{v}</div><div className="text-xs text-slate-400">{l}</div></div>
          </F>
        ))}
        <F lt={lt} a={1} className="col-span-2">
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">Early risk alert: 23 students with 2+ backlogs flagged for mentoring</div>
        </F>
      </div>
      <div className={`w-64 ${GLASS} rounded-xl p-4`}>
        <div className="text-sm text-white font-semibold mb-3">Department readiness</div>
        {depts.map(([d, v], i) => (
          <div key={d} className="flex items-center gap-2 mb-2 text-xs">
            <span className="w-10 text-slate-300">{d}</span>
            <div className="flex-1 h-3 bg-slate-800 rounded"><div className={`h-3 rounded ${GRAD}`} style={{ width: `${v * ease(pr(lt, 1.2 + i * 0.4, 3 + i * 0.4))}%` }} /></div>
            <span className="w-8 text-slate-400">{v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Player ---------- */
export default function HireMatrixExplainer() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceChoice, setVoiceChoice] = useState<'daniel' | 'eddy'>('daniel');
  const tRef = useRef(0);
  const audioRef = useRef(null);
  const audioAvailableRef = useRef(false);
  const lastSpokenSceneRef = useRef(-1);

  // Initialize pre-rendered AI audio track based on selected male voice
  useEffect(() => {
    const audioSrc = voiceChoice === 'eddy' ? '/audio/full_voiceover_us.m4a' : '/audio/full_voiceover.m4a';
    try {
      const audio = new Audio(audioSrc);
      audio.preload = "auto";
      audio.addEventListener("canplaythrough", () => {
        audioAvailableRef.current = true;
      });
      audio.addEventListener("error", () => {
        audioAvailableRef.current = false;
      });
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = audio;

      if (playing && voiceEnabled) {
        audio.currentTime = tRef.current;
        audio.play().catch(() => {});
      }
    } catch {
      audioAvailableRef.current = false;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [voiceChoice]);

  // Web Speech synthesis helper (fallback to natural male voices)
  const speakScene = (sceneIndex) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const scene = SCENES[sceneIndex];
    if (!scene) return;
    const utterance = new SpeechSynthesisUtterance(scene.sub);
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // Deeper natural pitch
    const voices = window.speechSynthesis.getVoices();
    // Prioritize expressive male voices
    const naturalMaleVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Daniel") ||
          v.name.includes("Alex") ||
          v.name.includes("Rishi") ||
          v.name.includes("Eddy") ||
          v.name.includes("Fred") ||
          v.name.toLowerCase().includes("male"))
    ) || voices.find(v => v.lang.startsWith("en"));

    if (naturalMaleVoice) utterance.voice = naturalMaleVoice;
    window.speechSynthesis.speak(utterance);
    lastSpokenSceneRef.current = sceneIndex;
  };

  // Timer tick loop
  useEffect(() => {
    if (!playing) return;
    let last = performance.now(), id;
    const tick = (now) => {
      const next = Math.min(TOTAL, tRef.current + (now - last) / 1000);
      last = now;
      tRef.current = next;
      setT(next);
      if (next >= TOTAL) {
        setPlaying(false);
        if (audioRef.current) audioRef.current.pause();
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        return;
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing]);

  // Handle audio and speech synchronization with playback time
  useEffect(() => {
    const currentIdx = Math.max(0, SCENES.findIndex((s) => t >= s.s && t < s.e));
    if (!playing || !voiceEnabled) {
      if (audioRef.current) audioRef.current.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (audioAvailableRef.current && audioRef.current) {
      if (Math.abs(audioRef.current.currentTime - t) > 0.6) {
        audioRef.current.currentTime = t;
      }
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {
          if (lastSpokenSceneRef.current !== currentIdx) {
            speakScene(currentIdx);
          }
        });
      }
    } else {
      if (lastSpokenSceneRef.current !== currentIdx) {
        speakScene(currentIdx);
      }
    }
  }, [t, playing, voiceEnabled]);

  const seek = (v) => {
    const x = Math.max(0, Math.min(TOTAL - 0.01, v));
    tRef.current = x;
    setT(x);
    const newIdx = Math.max(0, SCENES.findIndex((s) => x >= s.s && x < s.e));
    if (audioAvailableRef.current && audioRef.current) {
      audioRef.current.currentTime = x;
      if (playing && voiceEnabled) {
        audioRef.current.play().catch(() => {});
      }
    } else if (playing && voiceEnabled) {
      speakScene(newIdx);
    }
  };

  const idx = Math.max(0, SCENES.findIndex((s) => t >= s.s && t < s.e));
  const sc = SCENES[idx];
  const lt = t - sc.s;
  const Scene = [Challenge, Intro, Shap, Ats, Roadmap, Admin][idx];
  const ended = t >= TOTAL - 0.02;
  const btn = "p-2 rounded-lg text-slate-200 hover:bg-white/10 hover:text-white transition cursor-pointer";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <style>{`
        @keyframes hmFloat { 0%,100% { transform: translateY(0); opacity:.25 } 50% { transform: translateY(-24px); opacity:.9 } }
        
        /* Scene 0: Friction & Glitch Scan Wipe */
        @keyframes hmGlitchIn {
          0% { opacity: 0; transform: scale(0.92) translateY(16px); filter: blur(8px) contrast(1.2); }
          60% { filter: blur(1px) contrast(1.05); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0) contrast(1); }
        }
        
        /* Scene 1: 3D Perspective Portal Burst */
        @keyframes hmPortalBurst {
          0% { opacity: 0; transform: perspective(800px) scale(0.8) rotateX(14deg); filter: brightness(2) drop-shadow(0 0 35px #22d3ee); }
          60% { transform: perspective(800px) scale(1.04) rotateX(-2deg); filter: brightness(1.2); }
          100% { opacity: 1; transform: perspective(800px) scale(1) rotateX(0deg); filter: brightness(1); }
        }
        
        /* Scene 2: Holographic Data Slide */
        @keyframes hmHoloSlide {
          0% { opacity: 0; transform: translateX(70px) skewX(-4deg); filter: blur(10px); }
          70% { transform: translateX(-4px) skewX(0.5deg); }
          100% { opacity: 1; transform: translateX(0) skewX(0deg); filter: blur(0); }
        }
        
        /* Scene 3: Top-Down Scanner Drop */
        @keyframes hmScannerDrop {
          0% { opacity: 0; transform: translateY(-50px) scale(0.94); filter: blur(8px); }
          65% { transform: translateY(4px) scale(1.01); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        /* Scene 4: Diagonal Milestone Snap */
        @keyframes hmMilestoneSnap {
          0% { opacity: 0; transform: translate(-50px, 20px) scale(0.9); }
          65% { transform: translate(4px, -2px) scale(1.02); }
          100% { opacity: 1; transform: translate(0, 0) scale(1); }
        }
        
        /* Scene 5: Institutional Prestige Ascend */
        @keyframes hmCommandAscend {
          0% { opacity: 0; transform: scale(1.14) translateY(22px); filter: blur(14px) brightness(1.5); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0) brightness(1); }
        }
        
        /* Equalizer Voice Bounce */
        @keyframes hmEqualizer1 { 0%, 100% { height: 4px; } 50% { height: 14px; } }
        @keyframes hmEqualizer2 { 0%, 100% { height: 12px; } 50% { height: 4px; } }
        @keyframes hmEqualizer3 { 0%, 100% { height: 6px; } 50% { height: 15px; } }

        @media (prefers-reduced-motion: reduce) { .hm-p { animation: none !important } }
      `}</style>
      <div className="w-full max-w-4xl">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-[0_0_80px_rgba(34,211,238,.18)]">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 15% 10%, rgba(34,211,238,.18), transparent 50%), radial-gradient(ellipse at 90% 90%, rgba(124,58,237,.28), transparent 55%), radial-gradient(ellipse at 60% 40%, rgba(79,70,229,.12), transparent 60%)" }} />
          {PARTICLES.map((p, i) => (
            <div key={i} className="hm-p absolute rounded-full" style={{ left: `${p.l}%`, top: `${p.t}%`, width: p.z, height: p.z, background: PCOL[p.c], boxShadow: `0 0 8px ${PCOL[p.c]}`, animation: `hmFloat ${p.d}s ease-in-out ${p.dl}s infinite` }} />
          ))}
          
          {/* Top Video Header */}
          <div className="absolute top-3 left-4 flex items-center gap-2 text-xs text-slate-300 z-10 flex-wrap">
            <Layers size={14} className="text-cyan-300" />
            <span className="font-bold text-white">PlacementIQ AI</span>
            <ChevronRight size={12} className="text-slate-500" />
            <span className="text-cyan-200 font-medium">{sc.name}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {TRANSITION_NAMES[idx]}
            </span>
            {voiceEnabled && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-300 font-medium shadow-sm shadow-cyan-500/20">
                <span className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 bg-cyan-400 rounded-full" style={{ animation: playing ? "hmEqualizer1 .4s infinite ease-in-out" : "none", height: playing ? "10px" : "3px" }} />
                  <span className="w-0.5 bg-cyan-400 rounded-full" style={{ animation: playing ? "hmEqualizer2 .5s infinite ease-in-out" : "none", height: playing ? "14px" : "3px" }} />
                  <span className="w-0.5 bg-cyan-400 rounded-full" style={{ animation: playing ? "hmEqualizer3 .45s infinite ease-in-out" : "none", height: playing ? "8px" : "3px" }} />
                </span>
                <span>{voiceChoice === 'daniel' ? 'Daniel (Deep Male)' : 'Eddy (Natural US)'}</span>
              </span>
            )}
          </div>

          {/* Scene Body with Custom Dynamic Transition per scene */}
          <div key={idx} className="absolute inset-0 pt-8 pb-16" style={{ animation: TRANSITIONS[idx] }}>
            <Scene lt={lt} t={t} />
          </div>

          {/* Subtitle Teleprompter */}
          <div className="absolute bottom-0 inset-x-0 px-6 py-3 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent text-center">
            <p className="text-sm sm:text-base text-slate-100 font-medium leading-snug max-w-2xl mx-auto drop-shadow-md">
              {sc.sub}
            </p>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className={`mt-3 rounded-xl ${GLASS} px-3 py-2.5`}>
          <div className="flex gap-1 mb-1.5">
            {SCENES.map((s, i) => (
              <button key={s.name} onClick={() => seek(s.s)} aria-label={`Go to ${s.name} at ${fmt(s.s)}`} title={`${s.name} (${TRANSITION_NAMES[i]})`}
                className="relative h-2 rounded bg-slate-800 overflow-hidden cursor-pointer hover:bg-slate-700 transition" style={{ flex: `${s.e - s.s} 1 0` }}>
                <div className={`h-full ${GRAD}`} style={{ width: `${clamp((t - s.s) / (s.e - s.s)) * 100}%` }} />
              </button>
            ))}
          </div>
          <div className="flex gap-1 mb-1.5">
            {SCENES.map((s, i) => (
              <button key={s.name} onClick={() => seek(s.s)} className={`text-left text-[10px] truncate transition cursor-pointer ${i === idx ? "text-cyan-300 font-semibold" : "text-slate-500 hover:text-slate-300"}`} style={{ flex: `${s.e - s.s} 1 0` }}>
                {fmt(s.s)} {s.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button className={btn} onClick={() => seek(SCENES[Math.max(0, idx - (lt > 1.5 ? 0 : 1))].s)} aria-label="Previous scene"><ChevronLeft size={20} /></button>
            <button className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:opacity-90 transition cursor-pointer shadow-md shadow-cyan-500/20"
              onClick={() => {
                if (ended) seek(0);
                const nextPlaying = !playing || ended;
                setPlaying(nextPlaying);
                if (!nextPlaying) {
                  if (audioRef.current) audioRef.current.pause();
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                }
              }} aria-label={playing ? "Pause" : "Play"}>
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className={btn} onClick={() => seek(SCENES[Math.min(5, idx + 1)].s)} aria-label="Next scene"><ChevronRight size={20} /></button>
            <button className={btn} onClick={() => { seek(0); setPlaying(true); }} aria-label="Replay"><RotateCcw size={18} /></button>

            {/* AI Voice Toggle Button */}
            <button
              className={`${btn} flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
                voiceEnabled
                  ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "border-slate-800 bg-slate-900/60 text-slate-500"
              }`}
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (!next) {
                  if (audioRef.current) audioRef.current.pause();
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                }
              }}
              title={voiceEnabled ? "AI Voice: Active" : "AI Voice: Muted"}
            >
              {voiceEnabled ? <Volume2 size={16} className="text-cyan-400" /> : <VolumeX size={16} />}
              <span>{voiceEnabled ? "Voice ON" : "Muted"}</span>
            </button>

            {/* Expressive Male Voice Switcher */}
            {voiceEnabled && (
              <button
                className={`${btn} flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-medium transition cursor-pointer hover:border-indigo-400 hover:text-white`}
                onClick={() => setVoiceChoice(v => v === 'daniel' ? 'eddy' : 'daniel')}
                title="Click to toggle male narrator voice style"
              >
                <Mic size={14} className="text-indigo-400" />
                <span>{voiceChoice === 'daniel' ? 'Daniel (Deep UK)' : 'Eddy (Natural US)'}</span>
              </button>
            )}

            <div className="ml-2 text-xs text-slate-400 tabular-nums">{fmt(t)} / {fmt(TOTAL)}</div>
            <div className="ml-auto text-xs text-slate-400">Scene {idx + 1}/6</div>
          </div>
        </div>
      </div>
    </div>
  );
}
