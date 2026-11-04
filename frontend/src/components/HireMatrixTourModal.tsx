import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle, Brain, CheckCircle2, Download, FileSpreadsheet, FileText, Maximize2, Mic,
  Minimize2, Pause, Play, RotateCcw, Send, Sparkles, Volume2, VolumeX, X, type LucideIcon,
} from "lucide-react";

/* ───────── Types & timeline ───────── */
export interface HireMatrixTourModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  autoPlay?: boolean;
}
interface Scene { id: number; label: string; start: number; end: number; message: string }

const DURATION = 60;
const SCENES: Scene[] = [
  { id: 1, label: "The chaos", start: 0, end: 10, message: "Every placement season: endless Google Forms, manual TPO spreadsheets, and zero visibility into true hiring readiness." },
  { id: 2, label: "AI brain", start: 10, end: 22, message: "No black-box scores. Explainable ML shows your exact placement odds and the competencies you are missing." },
  { id: 3, label: "Practice", start: 22, end: 32, message: "Crack every assessment round with SVAR Voice AI fluency audits and live technical mock interviews." },
  { id: 4, label: "1-Click Apply", start: 32, end: 45, message: "Zero Google Forms. Automatic eligibility checks against your verified academic record, then 1-Click Apply." },
  { id: 5, label: "DCPD / TPO", start: 45, end: 55, message: "For DCPD: dynamic criteria updates, candidate skill dossiers, instant WhatsApp circulars, and 1-Click HR shortlist exports." },
  { id: 6, label: "HireMatrix AI", start: 55, end: 60, message: "Turn campus placements from stressful guesswork into confident, repeatable success. Welcome to HireMatrix AI." },
];

const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
const prog = (lt: number, from: number, to: number): number => clamp((lt - from) / (to - from), 0, 1);
const fmt = (s: number): string => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const Glass = ({ className = "", children }: { className?: string; children: ReactNode }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ${className}`}>{children}</div>
);

/* ───────── Scene 1: the chaos ───────── */
const FLYERS: { Icon: LucideIcon; label: string; x: number; y: number; r: number }[] = [
  { Icon: FileText, label: "Google Form: Infosys", x: 3, y: 6, r: -8 },
  { Icon: FileSpreadsheet, label: "Eligibility.xlsx", x: 58, y: 4, r: 6 },
  { Icon: FileText, label: "Google Form: TCS", x: 30, y: 24, r: -4 },
  { Icon: FileSpreadsheet, label: "Shortlist_v7_FINAL.xlsx", x: 68, y: 26, r: 9 },
  { Icon: FileText, label: "Form 14 of 31", x: 4, y: 60, r: 7 },
  { Icon: FileSpreadsheet, label: "Backlogs_check.xlsx", x: 56, y: 74, r: -6 },
  { Icon: FileText, label: "Google Form: Wipro", x: 24, y: 80, r: 4 },
  { Icon: FileSpreadsheet, label: "CGPA_cutoffs.xlsx", x: 74, y: 56, r: -9 },
];

function ChaosScene({ lt }: { lt: number }) {
  return (
    <div className="absolute inset-0">
      {FLYERS.map(({ Icon, label, x, y, r }, i) => (
        <div key={label} className="absolute transition-opacity duration-500" style={{ left: `${x}%`, top: `${y}%`, opacity: lt >= i * 0.5 ? 1 : 0 }}>
          <div className="hm-anim" style={{ ["--r" as string]: `${r}deg`, animation: `hm-float ${3 + (i % 3)}s ease-in-out ${i * 0.3}s infinite` }}>
            <Glass className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300">
              <Icon className={`h-4 w-4 ${i % 2 ? "text-emerald-300" : "text-violet-300"}`} />
              {label}
            </Glass>
          </div>
        </div>
      ))}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700" style={{ opacity: lt > 4 ? 1 : 0 }}>
        <Glass className="border-rose-400/40 px-10 py-6 text-center shadow-[0_0_70px_rgba(244,63,94,0.25)]">
          <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-rose-300" />
          <div className="font-mono text-6xl font-bold text-rose-300">{Math.round(68 * prog(lt, 4.5, 7.5))}%</div>
          <div className="mt-1 text-sm text-slate-300">Rejected at initial screening</div>
        </Glass>
      </div>
    </div>
  );
}

/* ───────── Scene 2: TreeSHAP waterfall ───────── */
const BASE_ODDS = 62;
const DRIVERS = [
  { name: "DSA problem solving", v: 18 },
  { name: "Full-stack projects", v: 12 },
  { name: "Low LeetCode contest rating", v: -8 },
];

function ShapScene({ lt }: { lt: number }) {
  const shown = DRIVERS.map((_, i) => prog(lt, 2.5 + i * 2.2, 4 + i * 2.2));
  const odds = Math.round(BASE_ODDS + DRIVERS.reduce((s, d, i) => s + d.v * shown[i], 0));
  let cum = BASE_ODDS;
  return (
    <div className="absolute inset-0 grid grid-cols-5 items-center gap-6">
      <div className="col-span-2 flex flex-col items-center gap-3">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full">
            {[20, 38, 56].map((r) => <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="rgba(99,102,241,0.4)" />)}
            <g className="hm-anim" style={{ transformOrigin: "60px 60px", animation: "hm-spin 3s linear infinite" }}>
              <path d="M60 60 L60 4 A56 56 0 0 1 108 32 Z" fill="rgba(34,211,238,0.18)" />
              <line x1="60" y1="60" x2="60" y2="4" stroke="#22d3ee" strokeWidth="1.5" />
            </g>
          </svg>
          <Brain className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-cyan-300" />
        </div>
        <div className="text-center text-sm text-slate-300">Aarav Sharma, CSE, 8.6 CGPA</div>
        <div className="font-mono text-5xl font-bold text-emerald-300">{odds}%</div>
        <div className="text-xs text-slate-400">placement odds</div>
      </div>
      <Glass className="col-span-3 space-y-4 p-5">
        <div className="text-sm font-medium text-slate-200">What moves your odds</div>
        <Row label={`Baseline for your batch`} value={`${BASE_ODDS}%`} lo={0} width={BASE_ODDS} color="bg-slate-500" scale={1} />
        {DRIVERS.map((d, i) => {
          const before = cum;
          cum += d.v;
          return (
            <Row key={d.name} label={d.name} value={`${d.v > 0 ? "+" : ""}${d.v}%`} lo={Math.min(before, cum)} width={Math.abs(d.v)}
              color={d.v > 0 ? "bg-emerald-400" : "bg-rose-400"} scale={shown[i]} origin={d.v > 0 ? "left" : "right"} />
          );
        })}
      </Glass>
    </div>
  );
}

function Row(p: { label: string; value: string; lo: number; width: number; color: string; scale: number; origin?: "left" | "right" }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-300"><span>{p.label}</span><span className="font-mono">{p.value}</span></div>
      <div className="relative h-3 rounded-full bg-white/5">
        <div className={`absolute top-0 h-3 rounded-full ${p.color}`}
          style={{ left: `${p.lo}%`, width: `${p.width}%`, transform: `scaleX(${p.scale})`, transformOrigin: p.origin ?? "left" }} />
      </div>
    </div>
  );
}

/* ───────── Scene 3: Voice AI + mock tests ───────── */
const SECTIONS = [{ n: "Quantitative", s: 82 }, { n: "Logical reasoning", s: 76 }, { n: "Verbal", s: 88 }, { n: "Coding", s: 71 }];

function PracticeScene({ lt }: { lt: number }) {
  return (
    <div className="absolute inset-0 grid grid-cols-2 items-center gap-6">
      <Glass className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-sm text-slate-200"><Mic className="h-4 w-4 text-cyan-300" />SVAR Voice AI is listening</div>
        <div className="flex h-24 items-center justify-center gap-1">
          {Array.from({ length: 28 }, (_, i) => {
            const h = 8 + 80 * Math.abs(Math.sin(lt * 3 + i * 0.6)) * Math.abs(Math.sin(i * 0.3 + lt));
            return <span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-300" style={{ height: `${h}%` }} />;
          })}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-slate-400">Spoken English level</div>
            <div className="font-mono text-4xl font-bold text-violet-300">{lt < 5 ? "B2" : "C1"}</div>
          </div>
          <div className="w-1/2">
            <div className="mb-1 flex justify-between text-xs text-slate-400"><span>Acoustic confidence</span><span className="font-mono">{Math.round(92 * prog(lt, 1, 6))}%</span></div>
            <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-cyan-300" style={{ width: `${92 * prog(lt, 1, 6)}%` }} /></div>
          </div>
        </div>
      </Glass>
      <Glass className="space-y-3 p-5">
        <div className="text-sm text-slate-200">Company mock test: sectional scores</div>
        {SECTIONS.map((s, i) => {
          const p = prog(lt, 2.5 + i * 1.5, 4.5 + i * 1.5);
          return (
            <div key={s.n}>
              <div className="mb-1 flex justify-between text-xs text-slate-300"><span>{s.n}</span><span className="font-mono">{Math.round(s.s * p)}</span></div>
              <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-indigo-400" style={{ width: `${s.s * p}%` }} /></div>
            </div>
          );
        })}
      </Glass>
    </div>
  );
}

/* ───────── Scene 4: 1-Click Apply ───────── */
const DRIVES = [{ n: "Google", p: "₹24.5 LPA" }, { n: "Amazon", p: "₹28 LPA" }, { n: "Microsoft", p: "₹21 LPA" }];
const CHECKS = ["CGPA ≥ 8.0 (you: 8.6)", "0 backlogs (you: 0)", "CS / IT branch (you: CSE)"];

function ApplyScene({ lt }: { lt: number }) {
  const sent = lt >= 8.2;
  const pressed = lt >= 7.6 && !sent;
  return (
    <div className="absolute inset-0 grid grid-cols-2 items-center gap-6">
      <div className="space-y-3">
        <div className="text-sm text-slate-300">Visiting your campus</div>
        {DRIVES.map((d, i) => (
          <Glass key={d.n} className={`flex items-center justify-between px-4 py-3 transition-all duration-500 ${i === 0 && lt > 2 ? "border-emerald-400/50 shadow-[0_0_30px_rgba(52,211,153,0.2)]" : ""}`}>
            <span className="text-slate-100">{d.n}</span><span className="font-mono text-sm text-emerald-300">{d.p}</span>
          </Glass>
        ))}
      </div>
      <Glass className="space-y-3 p-5">
        <div className="text-sm text-slate-200">Google eligibility, checked against your record</div>
        {CHECKS.map((c, i) => (
          <div key={c} className="flex items-center gap-2 text-sm text-slate-300 transition-opacity duration-500" style={{ opacity: lt > 3 + i ? 1 : 0.2 }}>
            <CheckCircle2 className={`h-4 w-4 ${lt > 3 + i ? "text-emerald-300" : "text-slate-600"}`} />{c}
          </div>
        ))}
        <div className={`mt-2 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all duration-300 ${
          sent ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_30px_rgba(99,102,241,0.6)]"} ${pressed ? "scale-95" : ""}`}
          style={{ opacity: lt > 6 ? 1 : 0 }}>
          {sent ? <><CheckCircle2 className="h-4 w-4" />Application submitted</> : "1-Click Apply"}
        </div>
        <div className="text-center text-xs text-emerald-300 transition-opacity duration-500" style={{ opacity: lt > 9 ? 1 : 0 }}>Shortlisted for Round 1</div>
      </Glass>
    </div>
  );
}

/* ───────── Scene 5: DCPD command center ───────── */
const SKILLS = ["React", "Python", "Docker"];

function DcpdScene({ lt }: { lt: number }) {
  const cgpa = 9 - 1.5 * prog(lt, 1.5, 4);
  const unlocked = Math.round(42 * prog(lt, 1.5, 4));
  return (
    <div className="absolute inset-0 grid grid-cols-2 items-center gap-6">
      <Glass className="space-y-4 p-5">
        <div className="text-sm text-slate-200">Google drive criteria</div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-300"><span>Minimum CGPA</span><span className="font-mono text-cyan-300">{cgpa.toFixed(1)}</span></div>
          <div className="relative h-2 rounded-full bg-white/10">
            <div className="absolute left-0 h-2 rounded-full bg-cyan-400" style={{ width: `${((10 - cgpa) / 5) * 100}%`, left: 0 }} />
          </div>
        </div>
        <div className="flex items-end gap-3">
          <div className="font-mono text-5xl font-bold text-emerald-300">{38 + unlocked}</div>
          <div className="pb-1 text-xs text-slate-400">eligible students{unlocked > 0 && <span className="ml-1 text-emerald-300">+{unlocked}</span>}</div>
        </div>
        <div className="flex gap-2">{SKILLS.map((s) => <span key={s} className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-200">{s}</span>)}</div>
        <div className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all duration-500 ${lt > 8 ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-200" : "border-white/10 text-slate-400"}`}>
          <Download className="h-3.5 w-3.5" />Export HR shortlist (CSV)
        </div>
      </Glass>
      <div className="rounded-2xl bg-[#0b141a] p-3 ring-1 ring-white/10 transition-opacity duration-700" style={{ opacity: lt > 4.5 ? 1 : 0.15 }}>
        <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600"><Send className="h-4 w-4 text-white" /></div>
          <div><div className="text-sm text-slate-100">CSE 2026 Placements</div><div className="text-[11px] text-slate-400">Official circular</div></div>
        </div>
        <div className="ml-auto max-w-[88%] whitespace-pre-line rounded-lg rounded-tr-none bg-[#005c4b] p-3 text-[13px] leading-relaxed text-emerald-50"
          style={{ opacity: lt > 5.5 ? 1 : 0, transition: "opacity .6s" }}>
          {"Google Campus Drive 2026\nRole: SDE I, ₹24.5 LPA\nEligibility: CGPA ≥ 7.5, 0 backlogs\nApply on HireMatrix AI before 6 PM Friday."}
        </div>
      </div>
    </div>
  );
}

/* ───────── Scene 6: call to action ───────── */
const MODULES: { Icon: LucideIcon; label: string; tone: string }[] = [
  { Icon: Brain, label: "Placement odds", tone: "text-indigo-300" },
  { Icon: Mic, label: "Voice AI", tone: "text-cyan-300" },
  { Icon: FileText, label: "Resume score", tone: "text-violet-300" },
  { Icon: CheckCircle2, label: "1-Click Apply", tone: "text-emerald-300" },
  { Icon: Send, label: "WhatsApp circulars", tone: "text-emerald-300" },
  { Icon: Download, label: "HR shortlists", tone: "text-cyan-300" },
];
const STACK = ["FastAPI", "TreeSHAP ML", "React 19", "MongoDB", "Enterprise Ready"];

function FinaleScene({ lt }: { lt: number }) {
  const p = prog(lt, 0.4, 2);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
      <div className="relative flex h-44 w-full max-w-md items-center justify-center">
        <div className="absolute grid w-full grid-cols-3 gap-3">
          {MODULES.map(({ Icon, label, tone }, i) => (
            <Glass key={label} className="flex flex-col items-center gap-1 py-3 text-[11px] text-slate-300"
              ><div style={{ transform: `translate(${-((i % 3) - 1) * 100 * p}%, ${-(Math.floor(i / 3) - 0.5) * 100 * p}%) scale(${1 - 0.8 * p})`, opacity: 1 - p }} className="flex flex-col items-center gap-1">
                <Icon className={`h-5 w-5 ${tone}`} />{label}
              </div>
            </Glass>
          ))}
        </div>
        <div className="flex items-center gap-3" style={{ opacity: p, transform: `scale(${0.7 + 0.3 * p})` }}>
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_60px_rgba(99,102,241,0.7)]">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="text-4xl font-bold tracking-tight text-white">HireMatrix AI</div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 transition-opacity duration-700" style={{ opacity: lt > 2.2 ? 1 : 0 }}>
        {STACK.map((s) => <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">{s}</span>)}
      </div>
    </div>
  );
}

/* ───────── Player ───────── */
export default function HireMatrixTourModal({ isOpen = true, onClose, autoPlay = true }: HireMatrixTourModalProps) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [narrate, setNarrate] = useState(false);
  const [fs, setFs] = useState(false);
  const tRef = useRef(0);
  const box = useRef<HTMLDivElement>(null);

  const idx = t >= DURATION ? SCENES.length - 1 : SCENES.findIndex((s) => t < s.end);
  const scene = SCENES[idx];
  const lt = t - scene.start;

  const seek = useCallback((v: number) => { tRef.current = clamp(v, 0, DURATION); setT(tRef.current); }, []);

  useEffect(() => {
    if (!isOpen || !playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      seek(tRef.current + dt);
      if (tRef.current >= DURATION) { setPlaying(false); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isOpen, playing, seek]);

  useEffect(() => {
    if (!narrate || !playing || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(scene.message);
    u.rate = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return () => window.speechSynthesis.cancel();
  }, [idx, narrate, playing, scene.message]);

  useEffect(() => {
    const onFs = () => setFs(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) onClose?.();
      if (e.key === "ArrowRight") seek(SCENES[Math.min(idx + 1, SCENES.length - 1)].start);
      if (e.key === "ArrowLeft") seek(SCENES[Math.max(idx - 1, 0)].start);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, idx, onClose, seek]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (t >= DURATION) seek(0);
    setPlaying((p) => (t >= DURATION ? true : !p));
  };
  const toggleFs = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void box.current?.requestFullscreen();
  };
  const Scene = [ChaosScene, ShapScene, PracticeScene, ApplyScene, DcpdScene, FinaleScene][idx];
  const btn = "grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="HireMatrix AI product tour">
      <style>{`
        @keyframes hm-float{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-12px) rotate(calc(var(--r,0deg) + 4deg))}}
        @keyframes hm-spin{to{transform:rotate(360deg)}}
        @keyframes hm-wave{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
        @media (prefers-reduced-motion:reduce){.hm-anim{animation:none!important}}
      `}</style>
      <div ref={box} className={`flex flex-col overflow-hidden border border-white/10 bg-slate-950 text-slate-100 shadow-2xl ${fs ? "h-screen w-screen" : "w-full max-w-5xl rounded-3xl"}`}>
        <div className={`relative overflow-hidden ${fs ? "min-h-0 flex-1" : "aspect-video"}`}>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:36px_36px]" />
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute inset-x-6 bottom-20 top-6"><Scene lt={lt} /></div>
          <Glass className="absolute inset-x-6 bottom-4 px-4 py-3 text-center text-sm text-slate-200">{scene.message}</Glass>
        </div>

        <div className="space-y-3 border-t border-white/10 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <button type="button" className={btn} onClick={togglePlay} aria-label={t >= DURATION ? "Replay" : playing ? "Pause" : "Play"}>
              {t >= DURATION ? <RotateCcw className="h-4 w-4" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <span className="w-24 font-mono text-xs text-slate-400">{fmt(t)} / {fmt(DURATION)}</span>
            <input type="range" min={0} max={DURATION} step={0.1} value={t} onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek" className="h-1.5 flex-1 cursor-pointer accent-cyan-300" />
            <div className="flex h-4 items-center gap-0.5" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="hm-anim h-4 w-0.5 rounded bg-cyan-300"
                  style={{ animation: narrate && playing ? `hm-wave .9s ease-in-out ${i * 0.15}s infinite` : "none", transform: narrate && playing ? undefined : "scaleY(.3)" }} />
              ))}
            </div>
            <button type="button" className={btn} onClick={() => setNarrate((n) => !n)} aria-pressed={narrate} aria-label="Toggle narration">
              {narrate ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button type="button" className={btn} onClick={toggleFs} aria-label="Toggle fullscreen">
              {fs ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            {onClose && <button type="button" className={btn} onClick={onClose} aria-label="Close tour"><X className="h-4 w-4" /></button>}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SCENES.map((s, i) => (
              <button key={s.id} type="button" onClick={() => { seek(s.start); setPlaying(true); }} aria-current={i === idx}
                className={`rounded-lg border px-2 py-1.5 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                  i === idx ? "border-cyan-300/60 bg-cyan-400/10 text-cyan-100" : "border-white/10 text-slate-400 hover:bg-white/5"}`}>
                {s.id}. {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
