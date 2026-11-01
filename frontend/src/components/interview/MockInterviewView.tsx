import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  History,
  Send,
  Loader2,
  Target,
} from 'lucide-react';
import { interviewService } from '../../services/interview';
import type {
  RoleOption,
  StartInterviewResponse,
  InterviewQuestion,
  QuestionEvaluation,
  CompleteInterviewResponse,
  InterviewHistoryItem,
} from '../../types/interview';

export const MockInterviewView: React.FC = () => {
  // Setup configuration state
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('full-stack-developer');
  const [selectedRound, setSelectedRound] = useState<string>('technical');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(3);

  // Session lifecycle state: 'setup' | 'active' | 'feedback_step' | 'completed'
  const [sessionStage, setSessionStage] = useState<'setup' | 'active' | 'feedback_step' | 'completed'>('setup');
  const [sessionData, setSessionData] = useState<StartInterviewResponse | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [, setEvaluations] = useState<QuestionEvaluation[]>([]);
  const [latestEval, setLatestEval] = useState<QuestionEvaluation | null>(null);
  const [completedDossier, setCompletedDossier] = useState<CompleteInterviewResponse | null>(null);

  // UI helpers
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<InterviewHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Timer & Speech states
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Load available roles & past history on mount
  useEffect(() => {
    async function init() {
      try {
        const rolesData = await interviewService.getRoles();
        setRoles(rolesData);
        if (rolesData.length > 0) {
          setSelectedRole(rolesData[0].role_id);
        }
      } catch (err) {
        console.warn('Failed to load interview roles:', err);
      }
    }
    init();
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await interviewService.getHistory();
      setHistoryList(history);
    } catch (err) {
      console.warn('Failed to fetch history:', err);
    }
  };

  // Timer effect for active question
  useEffect(() => {
    if (sessionStage === 'active') {
      const currentQ = sessionData?.questions[currentQIndex];
      const initialTime = currentQ?.time_limit_seconds || 120;
      setTimeLeft(initialTime);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionStage, currentQIndex, sessionData]);

  // Web Speech API: Text to Speech
  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API: Speech Recognition (Voice Dictation)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your current browser. You can type your answer directly.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsRecording(false);
    }
  };

  // Start interview session
  const handleStartSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await interviewService.startInterview({
        role_id: selectedRole,
        round_type: selectedRound,
        difficulty: selectedDifficulty,
        question_count: questionCount,
      });
      setSessionData(session);
      setCurrentQIndex(0);
      setCandidateAnswer('');
      setEvaluations([]);
      setLatestEval(null);
      setCompletedDossier(null);
      setShowHint(false);
      setSessionStage('active');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to initialize mock interview.');
    } finally {
      setLoading(false);
    }
  };

  // Submit current answer and evaluate
  const handleSubmitAnswer = async () => {
    if (!sessionData || !candidateAnswer.trim()) {
      setError('Please provide your spoken or typed answer before submitting.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }

    setLoading(true);
    setError(null);

    const currentQ: InterviewQuestion = sessionData.questions[currentQIndex];
    const timeTaken = (currentQ.time_limit_seconds || 120) - timeLeft;

    try {
      const evaluation = await interviewService.submitAnswer({
        session_id: sessionData.session_id,
        question_id: currentQ.question_id,
        candidate_answer: candidateAnswer,
        time_taken_seconds: Math.max(timeTaken, 10),
      });

      setLatestEval(evaluation);
      setEvaluations((prev) => [...prev, evaluation]);
      setSessionStage('feedback_step');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to submit response.');
    } finally {
      setLoading(false);
    }
  };

  // Move to next question or complete interview
  const handleNextQuestion = async () => {
    if (!sessionData) return;

    if (currentQIndex + 1 < sessionData.questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setCandidateAnswer('');
      setLatestEval(null);
      setShowHint(false);
      setSessionStage('active');
    } else {
      // Final question answered, complete session
      setLoading(true);
      try {
        const completed = await interviewService.completeInterview(sessionData.session_id);
        setCompletedDossier(completed);
        setSessionStage('completed');
        loadHistory();
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Failed to finalize interview.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset to setup
  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isRecording) recognitionRef.current?.stop();
    if (isSpeaking) window.speechSynthesis.cancel();
    setSessionStage('setup');
    setSessionData(null);
    setCurrentQIndex(0);
    setCandidateAnswer('');
    setEvaluations([]);
    setLatestEval(null);
    setCompletedDossier(null);
    setError(null);
  };

  const wordCount = candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0;
  const currentQ = sessionData?.questions[currentQIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 p-6 md:p-8 backdrop-blur-md shadow-xl shadow-indigo-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Phase 15: Career Intelligence
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                Live Speech & AI Feedback
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Mock Interview Simulator
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Practice timed technical, system design, and STAR behavioral interview rounds with automated speech dictation, keyword depth auditing, and model answer comparisons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-400" />
              Past Interviews ({historyList.length})
            </button>
            {sessionStage !== 'setup' && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Exit Session
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. SETUP STAGE */}
      {sessionStage === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6 backdrop-blur-sm">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Configure Interview Parameters
              </h2>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Target Job Role / Specialization</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                >
                  {roles.map((r) => (
                    <option key={r.role_id} value={r.role_id}>
                      {r.title} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Round Type & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Interview Round Type</label>
                  <select
                    value={selectedRound}
                    onChange={(e) => setSelectedRound(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  >
                    <option value="technical">Technical Round (Core Architecture & Concepts)</option>
                    <option value="system_design">System Design (Scalability & Data Stores)</option>
                    <option value="behavioral">Behavioral (STAR Method & Conflict Resolution)</option>
                    <option value="hr">HR & Executive (Culture Fit & 5-Year Vision)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Difficulty Tier</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  >
                    <option value="beginner">Entry Level (Foundational Concepts)</option>
                    <option value="intermediate">Intermediate (Standard Campus Placement)</option>
                    <option value="advanced">Advanced (Product Tier / FAANG Bar)</option>
                  </select>
                </div>
              </div>

              {/* Number of Questions */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Session Length (Questions)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[3, 5, 8].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        questionCount === count
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {count} Questions (~{count * 2} mins)
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartSession}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-900/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing Role Questions...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    Launch Interview Simulation
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Sidebar Tips */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Assessment Dimensions
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Technical Concept Depth:</strong> Evaluates accuracy of core principles and keyword presence.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Communication & Clarity:</strong> Assesses sentence flow, vocabulary richness, and articulation.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">STAR Framework Alignment:</strong> Verifies structured delivery: Situation, Task, Action, and Result.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Delivery Confidence:</strong> Analyzes filler word usage ('um', 'uh', 'like') and assertive phrasing.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-indigo-950/20 border border-indigo-500/20 p-5">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Voice Speech Supported</h4>
              <p className="text-xs text-slate-400">
                You can either type your answers or click the microphone to speak naturally. Answers are analyzed and scored in real-time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE QUESTION STAGE */}
      {sessionStage === 'active' && currentQ && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Progress and Timer Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Question {currentQIndex + 1} of {sessionData?.questions.length}
              </span>
              <span className="text-xs text-slate-400">
                Round: <span className="text-slate-200 capitalize font-medium">{currentQ.round_type}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold border ${
                  timeLeft <= 20
                    ? 'bg-rose-950/60 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-slate-950 text-slate-300 border-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <button
                onClick={() => speakQuestion(currentQ.question)}
                title="Speak question aloud"
                className={`p-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  isSpeaking
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Question Box */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-purple-950 text-purple-300 border border-purple-500/30">
                {currentQ.concept}
              </span>
              <span className="text-[11px] text-slate-500">
                Difficulty: <span className="capitalize text-slate-400">{currentQ.difficulty}</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">{currentQ.question}</h2>

            {currentQ.hint && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {showHint ? 'Hide Concept Hint' : 'View Concept Hint'}
                </button>
                {showHint && (
                  <p className="mt-2 text-xs text-amber-200/90 bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl animate-in fade-in">
                    {currentQ.hint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Answer Input Panel */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">Your Answer</label>
                <span className="text-[11px] text-slate-500">
                  ({wordCount} words {wordCount >= 40 ? '• Good depth' : '• Recommend 40+ words'})
                </span>
              </div>

              {/* Dictation Toggle Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40 animate-pulse'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    Speech to Text
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={6}
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              placeholder="Speak using the microphone button or type your detailed response here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 leading-relaxed font-sans"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-slate-400">
                {isRecording && (
                  <span className="inline-flex items-center gap-1 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Listening to microphone...
                  </span>
                )}
              </span>

              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !candidateAnswer.trim()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Auditing Answer...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Evaluate & Next
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PER-QUESTION FEEDBACK STEP */}
      {sessionStage === 'feedback_step' && latestEval && currentQ && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
                  Question {currentQIndex + 1} Assessment
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{currentQ.concept}</h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Score</div>
                  <div className="text-2xl font-black text-indigo-400">{latestEval.overall_score}%</div>
                </div>
              </div>
            </div>

            {/* Score metrics breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Technical</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">{latestEval.technical_score}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Clarity</div>
                <div className="text-sm font-bold text-indigo-400 mt-1">{latestEval.clarity_score}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Structure</div>
                <div className="text-sm font-bold text-purple-400 mt-1">{latestEval.structure_score}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Confidence</div>
                <div className="text-sm font-bold text-amber-400 mt-1">{latestEval.confidence_score}%</div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Key Strengths
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {latestEval.strengths.map((str, i) => (
                    <li key={i}>• {str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Actionable Improvements
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {latestEval.improvements.map((imp, i) => (
                    <li key={i}>• {imp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Model Ideal Answer Comparison */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Model Benchmark Answer
              </h4>
              <p className="text-slate-400 leading-relaxed font-sans">{latestEval.ideal_answer}</p>
            </div>

            {/* Advance button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                {currentQIndex + 1 < (sessionData?.questions.length || 0) ? (
                  <>
                    Proceed to Next Question ({currentQIndex + 2} of {sessionData?.questions.length})
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Complete & View Full Placement Dossier
                    <Award className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMPLETED SESSION SUMMARY DOSSIER */}
      {sessionStage === 'completed' && completedDossier && (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
          {/* Hero Grade Banner */}
          <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Simulation Dossier Completed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {completedDossier.role_title}
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">{completedDossier.summary_feedback}</p>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/30 min-w-[200px]">
              <div className="text-4xl font-black text-indigo-400">{completedDossier.average_score}%</div>
              <div className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wide">
                Grade: {completedDossier.grade}
              </div>
            </div>
          </div>

          {/* 4 Dimension Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Technical Concept</span>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                {completedDossier.technical_score}%
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Clarity & Eloquence</span>
              <div className="text-xl font-extrabold text-indigo-400 mt-1">{completedDossier.clarity_score}%</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">STAR Structure</span>
              <div className="text-xl font-extrabold text-purple-400 mt-1">
                {completedDossier.structure_score}%
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Confidence / Delivery</span>
              <div className="text-xl font-extrabold text-amber-400 mt-1">
                {completedDossier.confidence_score}%
              </div>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Question-by-Question Diagnostic Review
            </h3>

            {completedDossier.evaluations.map((ev, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-300">Question {idx + 1}</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    {ev.overall_score}% Match
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{ev.question}</h4>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                    Your Response:
                  </span>
                  <p className="text-slate-300 italic">"{ev.candidate_answer}"</p>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs">
                  <span className="text-[10px] font-semibold text-indigo-300 uppercase block mb-1">
                    Benchmark Ideal Response:
                  </span>
                  <p className="text-slate-400">{ev.ideal_answer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Practice Another Role Session
            </button>
          </div>
        </div>
      )}

      {/* History Drawer Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Mock Interview Session Archive
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-1"
              >
                Close ✕
              </button>
            </div>

            {historyList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No past interview sessions found. Complete your first practice round to see historical progress here!
              </p>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1">
                {historyList.map((h, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{h.role_title}</div>
                      <div className="text-[11px] text-slate-400 capitalize mt-0.5">
                        {h.round_type} • {h.difficulty} • {h.total_questions} questions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-indigo-400 text-sm">{h.average_score}%</div>
                      <div className="text-[10px] text-emerald-400">{h.grade}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
