import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Brain,
  History,
  Activity,
  ChevronRight,
  ShieldCheck,
  Play,
  Square,
  Lock,
  Unlock,
  AlertTriangle,
  Building2,
  FileCheck2,
} from 'lucide-react';
import {
  fetchPlacementTestPackage,
  submitPlacementTestPackage,
  fetchSvarExercises,
  evaluateSvarSentence,
  evaluateSvarExtempore,
  fetchMyAssessmentHistory,
  type PlacementTestPackage,
  type PlacementTestResult,
  type SvarSentence,
  type ExtemporeTopic,
  type SvarSentenceEvaluation,
  type ExtemporeEvaluation,
} from '../../services/assessments';
import { normalizeAudioSource, getBestRecordingMimeType } from '../../utils/audio';

export const AssessmentHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'placement_test' | 'svar_voice' | 'extempore' | 'history'>('placement_test');

  // --- MULTI-SECTION PLACEMENT TEST STATE ---
  const [placementPackage, setPlacementPackage] = useState<PlacementTestPackage | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0); // 0 = Section 1, 1 = Section 2
  const [section1Answers, setSection1Answers] = useState<Record<string, number>>({});
  const [section2Answers, setSection2Answers] = useState<Record<string, number>>({});
  const [section1Completed, setSection1Completed] = useState(false); // Section 2 is locked until Section 1 is submitted
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 0 to 9 in current section
  const [sectionTimeLeft, setSectionTimeLeft] = useState(600); // 10 minutes per section
  const [placementLoading, setPlacementLoading] = useState(false);
  const [placementResult, setPlacementResult] = useState<PlacementTestResult | null>(null);
  const [lockWarning, setLockWarning] = useState<string | null>(null);

  // --- SVAR VOICE STATE ---
  const [svarSentences, setSvarSentences] = useState<SvarSentence[]>([]);
  const [extemporeTopics, setExtemporeTopics] = useState<ExtemporeTopic[]>([]);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(0);
  const [isSpeakingSentence, setIsSpeakingSentence] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [svarLoading, setSvarLoading] = useState(false);
  const [svarEvaluation, setSvarEvaluation] = useState<SvarSentenceEvaluation | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- EXTEMPORE STATE ---
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);
  const [isExtemporeRecording, setIsExtemporeRecording] = useState(false);
  const [extemporeTranscript, setExtemporeTranscript] = useState('');
  const [extemporeTimeLeft, setExtemporeTimeLeft] = useState(45);
  const [extemporeLoading, setExtemporeLoading] = useState(false);
  const [extemporeResult, setExtemporeResult] = useState<ExtemporeEvaluation | null>(null);
  const [extemporeAudioUrl, setExtemporeAudioUrl] = useState<string | null>(null);
  const [extemporeAudioBase64, setExtemporeAudioBase64] = useState<string | null>(null);

  const extemporeTimerRef = useRef<any>(null);
  const extemporeMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const extemporeAudioChunksRef = useRef<Blob[]>([]);

  // --- HISTORY STATE ---
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Initialize Speech Recognition & Preload High-Quality Voices
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        if (activeTab === 'svar_voice') {
          setSpokenTranscript(transcript.trim());
        } else if (activeTab === 'extempore') {
          setExtemporeTranscript(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setIsExtemporeRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setIsExtemporeRecording(false);
      };

      recognitionRef.current = recognition;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    loadInitialData();
  }, [activeTab]);

  // Section Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (testStarted && sectionTimeLeft > 0 && !placementResult) {
      interval = setInterval(() => {
        setSectionTimeLeft((prev) => {
          if (prev <= 1) {
            if (activeSectionIndex === 0 && !section1Completed) {
              handleLockAndSubmitSection1();
            } else if (activeSectionIndex === 1) {
              handleFinalSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, sectionTimeLeft, activeSectionIndex, section1Completed, placementResult]);

  const loadInitialData = async () => {
    try {
      const svarData = await fetchSvarExercises();
      setSvarSentences(svarData.sentences);
      setExtemporeTopics(svarData.extempore_topics);
    } catch {
      // Fallback
    }
  };

  // --- MULTI-SECTION TEST CONTROLLERS ---
  const startPlacementTest = async () => {
    try {
      setPlacementLoading(true);
      const data = await fetchPlacementTestPackage(10);
      setPlacementPackage(data);
      setSection1Answers({});
      setSection2Answers({});
      setSection1Completed(false);
      setActiveSectionIndex(0);
      setCurrentQuestionIndex(0);
      setSectionTimeLeft(600);
      setPlacementResult(null);
      setTestStarted(true);
      setLockWarning(null);
    } catch (err) {
      console.error('Error starting placement test:', err);
    } finally {
      setPlacementLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (activeSectionIndex === 0) {
      if (section1Completed) return;
      setSection1Answers((prev) => ({ ...prev, [questionId]: optionIndex }));
    } else {
      setSection2Answers((prev) => ({ ...prev, [questionId]: optionIndex }));
    }
  };

  const handleAttemptSwitchSection = (targetIndex: number) => {
    if (targetIndex === 1 && !section1Completed) {
      setLockWarning('⚠️ Section 2 is locked! Tier-1 recruitment rules require you to complete and submit Section 1 (Verbal & Grammar) first.');
      setTimeout(() => setLockWarning(null), 4000);
      return;
    }
    setActiveSectionIndex(targetIndex);
    setCurrentQuestionIndex(0);
    setLockWarning(null);
  };

  const handleLockAndSubmitSection1 = () => {
    setSection1Completed(true);
    setActiveSectionIndex(1);
    setCurrentQuestionIndex(0);
    setSectionTimeLeft(600); // 10 minutes for Section 2
    setLockWarning(null);
  };

  const handleFinalSubmit = async () => {
    if (placementResult) return;
    try {
      setPlacementLoading(true);
      const res = await submitPlacementTestPackage({
        section_1_answers: section1Answers,
        section_2_answers: section2Answers,
        total_time_taken_seconds: 1200 - sectionTimeLeft,
      });
      setPlacementResult(res);
      setTestStarted(false);
    } catch (err) {
      console.error('Error submitting placement test:', err);
    } finally {
      setPlacementLoading(false);
    }
  };

  // --- NATURAL HIGH-QUALITY TTS SYNTHESIS ---
  const handlePlaySentence = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    const naturalVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Neural') ||
            v.name.includes('Enhanced') ||
            v.name.includes('Google US English') ||
            v.name.includes('Google UK English') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Karen') ||
            v.name.includes('Moira') ||
            v.name.includes('Serena'))
      ) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (naturalVoice) {
      utterance.voice = naturalVoice;
      utterance.lang = naturalVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    setIsSpeakingSentence(true);
    utterance.onend = () => {
      setIsSpeakingSentence(false);
    };
    utterance.onerror = () => {
      setIsSpeakingSentence(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // --- STT & MEDIARECORDER RECORDING ---
  const toggleRecording = async () => {
    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // No-op
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setSpokenTranscript('');
      setSvarEvaluation(null);
      setRecordedAudioUrl(null);
      setRecordedAudioBase64(null);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // No-op
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mimeType = getBestRecordingMimeType();
        const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

        mr.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mr.onstop = () => {
          const finalMime = mr.mimeType || mimeType || 'audio/mp4';
          const blob = new Blob(audioChunksRef.current, { type: finalMime });
          const audioUrl = URL.createObjectURL(blob);
          setRecordedAudioUrl(audioUrl);

          const reader = new FileReader();
          reader.onloadend = () => {
            const raw = reader.result as string;
            setRecordedAudioBase64(normalizeAudioSource(raw));
          };
          reader.readAsDataURL(blob);

          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current = mr;
        mr.start(250);
        setIsRecording(true);
      } catch (err) {
        console.warn('Microphone stream access unavailable:', err);
        setIsRecording(true);
      }
    }
  };

  const handleEvaluateSvar = async () => {
    if (!svarSentences[selectedSentenceIndex] || !spokenTranscript.trim()) return;
    try {
      setSvarLoading(true);
      const target = svarSentences[selectedSentenceIndex];
      const res = await evaluateSvarSentence({
        sentence_id: target.id,
        spoken_transcript: spokenTranscript.trim(),
        duration_seconds: 6.0,
        audio_data: recordedAudioBase64 || undefined,
      });
      setSvarEvaluation(res);
    } catch (err) {
      console.error('Error evaluating SVAR sentence:', err);
    } finally {
      setSvarLoading(false);
    }
  };

  // --- EXTEMPORE RECORDING ---
  const toggleExtemporeRecording = async () => {
    if (isExtemporeRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // No-op
      }
      if (extemporeMediaRecorderRef.current && extemporeMediaRecorderRef.current.state !== 'inactive') {
        extemporeMediaRecorderRef.current.stop();
      }
      setIsExtemporeRecording(false);
      clearInterval(extemporeTimerRef.current);
    } else {
      setExtemporeTranscript('');
      setExtemporeResult(null);
      setExtemporeAudioUrl(null);
      setExtemporeAudioBase64(null);
      setExtemporeTimeLeft(45);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // No-op
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        extemporeAudioChunksRef.current = [];
        const mimeType = getBestRecordingMimeType();
        const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

        mr.ondataavailable = (event) => {
          if (event.data.size > 0) {
            extemporeAudioChunksRef.current.push(event.data);
          }
        };

        mr.onstop = () => {
          const finalMime = mr.mimeType || mimeType || 'audio/mp4';
          const blob = new Blob(extemporeAudioChunksRef.current, { type: finalMime });
          const audioUrl = URL.createObjectURL(blob);
          setExtemporeAudioUrl(audioUrl);

          const reader = new FileReader();
          reader.onloadend = () => {
            const raw = reader.result as string;
            setExtemporeAudioBase64(normalizeAudioSource(raw));
          };
          reader.readAsDataURL(blob);

          stream.getTracks().forEach((track) => track.stop());
        };

        extemporeMediaRecorderRef.current = mr;
        mr.start(250);
        setIsExtemporeRecording(true);
      } catch (err) {
        console.warn('Extempore microphone error:', err);
        setIsExtemporeRecording(true);
      }

      extemporeTimerRef.current = setInterval(() => {
        setExtemporeTimeLeft((prev) => {
          if (prev <= 1) {
            try {
              recognitionRef.current?.stop();
            } catch {
              // No-op
            }
            if (extemporeMediaRecorderRef.current && extemporeMediaRecorderRef.current.state !== 'inactive') {
              extemporeMediaRecorderRef.current.stop();
            }
            setIsExtemporeRecording(false);
            clearInterval(extemporeTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleEvaluateExtempore = async () => {
    if (!extemporeTopics[selectedTopicIndex] || !extemporeTranscript.trim()) return;
    try {
      setExtemporeLoading(true);
      const topic = extemporeTopics[selectedTopicIndex];
      const res = await evaluateSvarExtempore({
        topic_id: topic.id,
        spoken_transcript: extemporeTranscript.trim(),
        duration_seconds: 45 - extemporeTimeLeft,
        audio_data: extemporeAudioBase64 || undefined,
      });
      setExtemporeResult(res);
    } catch (err) {
      console.error('Error evaluating extempore:', err);
    } finally {
      setExtemporeLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetchMyAssessmentHistory();
      setHistoryList(res.submissions || []);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeSection = placementPackage?.sections[activeSectionIndex];
  const activeQuestions = activeSection?.questions || [];
  const currentQ = activeQuestions[currentQuestionIndex];
  const currentAnswers = activeSectionIndex === 0 ? section1Answers : section2Answers;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Brain className="w-3.5 h-3.5" />
            PlacementIQ AI Campus Placement & SVAR Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Campus Placement Assessment & SVAR Voice Suite
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Authentic multi-section diagnostic simulating Day-1 recruitment tests (TCS NQT, Infosys, Accenture, Cognizant, Wipro, Amazon). Section 1 tests Verbal & Grammar, followed by Section 2 testing Quant, Logic Sequences & Data Charts. All audios & telemetry are saved for institutional audits.
          </p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('placement_test')}
          className={`flex-1 min-w-[180px] px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'placement_test'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Campus Placement Test (Company PYQs)</span>
        </button>

        <button
          onClick={() => setActiveTab('svar_voice')}
          className={`flex-1 min-w-[160px] px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'svar_voice'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>SVAR Listen & Repeat (Voice)</span>
        </button>

        <button
          onClick={() => setActiveTab('extempore')}
          className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'extempore'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Technical Extempore</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            loadHistory();
          }}
          className={`flex-1 min-w-[130px] px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Report Card & Audits</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CAMPUS PLACEMENT COMPREHENSIVE TEST (2 SECTIONS: GRAMMAR -> QUANT/CHARTS) */}
      {/* ========================================================================= */}
      {activeTab === 'placement_test' && (
        <div className="space-y-6">
          {/* Welcome Screen before test starts */}
          {!testStarted && !placementResult && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-3xl mx-auto space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <Building2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Day-1 Campus Placement Assessment
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
                  Structured in <strong>2 Sequential Exam Sections</strong> based on actual corporate PYQs (TCS NQT, Infosys, Accenture, Cognizant, Wipro, Amazon).
                </p>
              </div>

              {/* Sections Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                      Section 1 (Mandatory First)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">10 Questions</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">Verbal Ability & Corporate Grammar</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Subject-verb agreement, conditionals, error spotting, collocations, and professional documentation rules.
                  </p>
                  <span className="text-[11px] text-amber-400 font-medium block pt-1">
                    🔒 Section 2 is locked until you submit Section 1.
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                      Section 2 (Unlocks After Sec 1)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">10 Questions</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">Quant, Logical Series & Data Charts</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Percentages, profit/loss, mixtures, next-word/letter progressions, and data interpretation tables & sprint charts.
                  </p>
                  <span className="text-[11px] text-emerald-400 font-medium block pt-1">
                    ✓ Unlocks automatically upon Section 1 completion.
                  </span>
                </div>
              </div>

              {/* Company Tags Pill Bar */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold">Benchmarked Companies:</span>
                {['TCS NQT', 'Infosys Springboard', 'Accenture', 'Cognizant GenC', 'Wipro Elite', 'Deloitte USI', 'Amazon'].map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-300 text-[11px] font-medium">
                    {c}
                  </span>
                ))}
              </div>

              <button
                onClick={startPlacementTest}
                disabled={placementLoading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/30 inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                {placementLoading ? 'Loading Company PYQs...' : 'Begin Section 1: Verbal & Grammar'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ACTIVE MULTI-SECTION TEST INTERFACE */}
          {testStarted && placementPackage && !placementResult && (
            <div className="space-y-6">
              {/* Section Header Navigation Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {placementPackage.sections.map((sec, sIdx) => {
                  const isActive = activeSectionIndex === sIdx;
                  const isLocked = sIdx === 1 && !section1Completed;
                  return (
                    <button
                      key={sec.section_id}
                      onClick={() => handleAttemptSwitchSection(sIdx)}
                      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        isActive
                          ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                          : isLocked
                          ? 'bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-400">
                          {sec.title.split(':')[0]}
                        </span>
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                            <Lock className="w-3 h-3" /> Locked (Submit Sec 1)
                          </span>
                        ) : sIdx === 0 && section1Completed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <FileCheck2 className="w-3 h-3" /> Submitted & Locked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <Unlock className="w-3 h-3" /> Active Section
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{sec.title.split(':')[1] || sec.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {sIdx === 0
                          ? `Answered: ${Object.keys(section1Answers).length} / 10`
                          : `Answered: ${Object.keys(section2Answers).length} / 10`}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Lock Warning Notice if candidate tries to jump */}
              {lockWarning && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{lockWarning}</span>
                </div>
              )}

              {/* Main Question & Navigation Canvas */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Area (3 cols) */}
                <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                        {currentQ?.company}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-medium">
                        {currentQ?.category}
                      </span>
                      <span className="text-xs text-slate-400">• {currentQ?.subtopic}</span>
                    </div>

                    <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Section Time: {formatTime(sectionTimeLeft)}</span>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 mb-2">
                      {activeSection?.title.split(':')[0]} — Question {currentQuestionIndex + 1} of {activeQuestions.length}
                    </h3>

                    {currentQ?.question.includes('|') || currentQ?.question.includes('---+') || currentQ?.question.includes('███') ? (
                      <div className="space-y-3">
                        <p className="text-sm sm:text-base font-semibold text-white">
                          {currentQ.question.split('\n\n')[0]}
                        </p>
                        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre leading-relaxed">
                          {currentQ.question.split('\n\n').slice(1).join('\n\n') || currentQ.question}
                        </pre>
                      </div>
                    ) : (
                      <p className="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-line">
                        {currentQ?.question}
                      </p>
                    )}
                  </div>

                  {/* Multiple Choice Options */}
                  <div className="space-y-3 pt-2">
                    {currentQ?.options.map((opt, oIdx) => {
                      const isSelected = currentAnswers[currentQ.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectOption(currentQ.id, oIdx)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-800 gap-3">
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-3">
                      {currentQuestionIndex < activeQuestions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : activeSectionIndex === 0 ? (
                        <button
                          onClick={handleLockAndSubmitSection1}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Lock & Submit Section 1 → Unlock Section 2</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleFinalSubmit}
                          disabled={placementLoading}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{placementLoading ? 'Submitting...' : 'Finalize & Submit Assessment'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Matrix Sidebar (1 col) */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {activeSection?.title.split(':')[0]} Matrix
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">10 MCQs</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {activeQuestions.map((q, idx) => {
                      const isAnswered = currentAnswers[q.id] !== undefined;
                      const isCurrent = idx === currentQuestionIndex;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white'
                              : isAnswered
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                              : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
                      <span>Answered ({Object.keys(currentAnswers).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
                      <span>Remaining ({activeQuestions.length - Object.keys(currentAnswers).length})</span>
                    </div>
                  </div>

                  {activeSectionIndex === 0 ? (
                    <button
                      onClick={handleLockAndSubmitSection1}
                      className="w-full mt-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Sec 1 & Proceed</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalSubmit}
                      disabled={placementLoading}
                      className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      {placementLoading ? 'Grading Test...' : 'Finish Placement Test'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FINAL COMPREHENSIVE SCORECARD */}
          {placementResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2">
                    <Award className="w-3.5 h-3.5" />
                    {placementResult.badge_awarded}
                  </div>
                  <h3 className="text-2xl font-bold text-white">Campus Placement Test Results</h3>
                  <p className="text-xs text-slate-400 mt-1">Status: {placementResult.readiness_status}</p>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-extrabold text-white">{placementResult.overall_percentage}%</span>
                  <span className="text-xs text-slate-400 block">Overall Placement Benchmark</span>
                </div>
              </div>

              {/* Section-Wise Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                    Section 1: {placementResult.section_1_summary.title}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white">
                      {placementResult.section_1_summary.correct} / {placementResult.section_1_summary.total}
                    </span>
                    <span className="text-sm font-bold text-indigo-400">
                      {placementResult.section_1_summary.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    CEFR Proficiency: <strong className="text-emerald-400">{placementResult.section_1_summary.cefr_band}</strong>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                    Section 2: {placementResult.section_2_summary.title}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white">
                      {placementResult.section_2_summary.correct} / {placementResult.section_2_summary.total}
                    </span>
                    <span className="text-sm font-bold text-purple-400">
                      {placementResult.section_2_summary.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Quantitative & Logical Problem Solving Competency
                  </p>
                </div>
              </div>

              {/* Company Drive Eligibility */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Estimated Company Drive Eligibility:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {placementResult.eligible_companies.map((c, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Question Review */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Detailed Solution & PYQ Analysis</h4>
                <div className="space-y-3">
                  {placementResult.detailed_review.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        item.is_correct
                          ? 'bg-emerald-950/10 border-emerald-500/30'
                          : 'bg-rose-950/10 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {item.company}
                          </span>
                          <span className="text-xs font-bold text-white">Q{idx + 1}: {item.question.split('\n\n')[0]}</span>
                        </div>

                        {item.is_correct ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded shrink-0">
                            <XCircle className="w-3 h-3" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 font-mono space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-400 font-sans">Your Answer: </span>
                          <span className={item.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {item.selected_option_index !== null ? item.options[item.selected_option_index] : 'Unattempted'}
                          </span>
                        </div>
                        {!item.is_correct && (
                          <div>
                            <span className="text-slate-400 font-sans">Correct Answer: </span>
                            <span className="text-emerald-400 font-bold">{item.options[item.correct_option_index]}</span>
                          </div>
                        )}
                        <div className="pt-2 text-slate-300 font-sans text-xs border-t border-slate-800">
                          <span className="text-indigo-400 font-semibold">Solution Explanation: </span>
                          {item.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={startPlacementTest}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Take Another Assessment (Fresh Company PYQs)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SVAR LISTEN & REPEAT (VOICE TESTING) VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'svar_voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-sm font-bold text-white">
                    Sentence {selectedSentenceIndex + 1} of {svarSentences.length}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium">
                    {svarSentences[selectedSentenceIndex]?.level}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setSelectedSentenceIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={selectedSentenceIndex === 0}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    ←
                  </button>
                  <button
                    onClick={() =>
                      setSelectedSentenceIndex((prev) => Math.min(svarSentences.length - 1, prev + 1))
                    }
                    disabled={selectedSentenceIndex === svarSentences.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-200 leading-relaxed">
                  <strong>Workflow:</strong> 1. Click <em>"Listen to AI Sentence"</em> (crisp corporate voice) and remember the phrase. 2. Click <em>"Start Speaking"</em> and speak into your mic — your spoken voice is recorded and saved. 3. Click <em>"Evaluate Spoken Audio"</em> for automated SVAR CEFR scoring.
                </div>
              </div>

              {/* Sentence Audio Player */}
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Reference English Sentence
                </span>
                <p className="text-lg sm:text-xl font-bold text-white px-4 leading-relaxed font-serif">
                  "{svarSentences[selectedSentenceIndex]?.sentence}"
                </p>

                <div className="pt-2">
                  <button
                    onClick={() =>
                      handlePlaySentence(svarSentences[selectedSentenceIndex]?.sentence || '')
                    }
                    disabled={isSpeakingSentence}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 inline-flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSpeakingSentence ? (
                      <>
                        <Square className="w-4 h-4 animate-spin text-amber-400" />
                        <span>AI Playing Crisp Audio...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Listen to AI Sentence (Natural Voice)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Microphone Recording Zone */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Your Spoken Repetition (Microphone Recording)
                </span>

                <div className="flex justify-center">
                  <button
                    onClick={toggleRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 text-white ring-4 ring-rose-500/40 animate-pulse'
                        : 'bg-slate-800 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                  </button>
                </div>
                <span className="text-xs font-medium text-slate-400 block">
                  {isRecording ? 'Listening & Recording Audio... Speak now!' : 'Click microphone to record your voice'}
                </span>

                {/* Spoken Transcript Output Box */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left min-h-[70px]">
                  <span className="text-[11px] text-slate-500 block mb-1">Live Transcribed Speech:</span>
                  <p className="text-sm text-slate-200 font-mono">
                    {spokenTranscript || <span className="text-slate-600 italic">No speech captured yet...</span>}
                  </p>
                </div>

                {/* Recorded Audio Playback Widget */}
                {recordedAudioUrl && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-left space-y-2">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" />
                      Recorded Spoken Voice (Your Saved Audio):
                    </span>
                    <audio controls src={recordedAudioUrl} className="w-full h-9 rounded-lg" />
                  </div>
                )}

                <button
                  onClick={handleEvaluateSvar}
                  disabled={svarLoading || !spokenTranscript.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {svarLoading ? (
                    'Evaluating Spoken Speech & Audio...'
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Evaluate Spoken Audio (AI Grading)</span>
                    </>
                  )}
                </button>
              </div>

              {/* SVAR Evaluation Scorecard */}
              {svarEvaluation && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                        SVAR Voice Evaluation
                      </span>
                      <h4 className="text-lg font-bold text-white">{svarEvaluation.cefr_band}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-white">{svarEvaluation.svar_score} / 100</span>
                      <span className="text-[11px] text-slate-400 block">Composite SVAR Index</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Accuracy</span>
                      <span className="text-base font-bold text-emerald-400">{svarEvaluation.accuracy_score}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Memory Retention</span>
                      <span className="text-base font-bold text-indigo-400">{svarEvaluation.memory_retention_score}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block">Fluency Rate</span>
                      <span className="text-base font-bold text-amber-400">{svarEvaluation.fluency_score}%</span>
                    </div>
                  </div>

                  {svarEvaluation.missed_words.length > 0 && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                      <strong>Missed / Dropped Words: </strong>
                      {svarEvaluation.missed_words.join(', ')}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800 leading-relaxed">
                    <strong>AI Examiner Feedback: </strong>
                    {svarEvaluation.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                SVAR Sentence Catalog
              </h3>

              <div className="space-y-2">
                {svarSentences.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSentenceIndex(idx);
                      setSpokenTranscript('');
                      setSvarEvaluation(null);
                      setRecordedAudioUrl(null);
                      setRecordedAudioBase64(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      selectedSentenceIndex === idx
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 font-semibold">
                      <span>Sentence {idx + 1}</span>
                      <span className="text-[10px] text-indigo-400">{s.difficulty}</span>
                    </div>
                    <p className="truncate text-slate-300 font-mono">{s.sentence}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/20 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Recruiter Speech Standards:
              </h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>No Filler Hesitation:</strong> Avoid saying "um" or "like" during pauses.</li>
                <li>• <strong>Cadence & Pace:</strong> Speak with consistent pace without rushing.</li>
                <li>• <strong>Audio Verification:</strong> Recordings are audited by hiring panels.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TECHNICAL EXTEMPORE SPEECH VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'extempore' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                Technical Extempore Round
              </span>
              <h3 className="text-xl font-bold text-white">
                {extemporeTopics[selectedTopicIndex]?.title || 'Extempore Topic'}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              {extemporeTopics.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedTopicIndex(idx);
                    setExtemporeTranscript('');
                    setExtemporeResult(null);
                    setExtemporeAudioUrl(null);
                    setExtemporeAudioBase64(null);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer ${
                    selectedTopicIndex === idx ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Your Speaking Prompt:</span>
            <p className="text-sm font-semibold text-white leading-relaxed">
              "{extemporeTopics[selectedTopicIndex]?.prompt}"
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-mono font-bold">
              <Clock className="w-4 h-4" />
              <span>Time Left: {extemporeTimeLeft}s / 45s</span>
            </div>

            <button
              onClick={toggleExtemporeRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl mx-auto cursor-pointer ${
                isExtemporeRecording
                  ? 'bg-rose-600 text-white ring-4 ring-rose-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-indigo-600 text-white'
              }`}
            >
              {isExtemporeRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <span className="text-xs text-slate-400 block">
              {isExtemporeRecording ? 'Recording your speech & audio... Speak clearly!' : 'Click to start 45s extempore recording'}
            </span>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left min-h-[90px]">
              <span className="text-[11px] text-slate-500 block mb-1">Extempore Speech Transcript:</span>
              <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed">
                {extemporeTranscript || <span className="text-slate-600 italic">No audio recorded yet...</span>}
              </p>
            </div>

            {extemporeAudioUrl && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-left space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  Your Recorded Extempore Audio:
                </span>
                <audio controls src={extemporeAudioUrl} className="w-full h-9 rounded-lg" />
              </div>
            )}

            <button
              onClick={handleEvaluateExtempore}
              disabled={extemporeLoading || !extemporeTranscript.trim()}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-40 cursor-pointer"
            >
              {extemporeLoading ? 'AI Evaluating Speech...' : 'Analyze Extempore Speech'}
            </button>
          </div>

          {extemporeResult && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-bold text-white">Extempore Speech Analytics</span>
                <span className="text-lg font-bold text-emerald-400">{extemporeResult.overall_extempore_score} / 100</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Speaking Rate</span>
                  <span className="text-sm font-bold text-white">{extemporeResult.speaking_rate_wpm} WPM</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">Vocab Diversity</span>
                  <span className="text-sm font-bold text-indigo-400">{extemporeResult.vocabulary_richness}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block">CEFR Band</span>
                  <span className="text-sm font-bold text-emerald-400">{extemporeResult.cefr_band}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                {extemporeResult.feedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MY REPORT CARD / HISTORY VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Your Assessment & Voice Test History
            </h3>
            <button
              onClick={loadHistory}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refresh History
            </button>
          </div>

          {historyLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading test records...</div>
          ) : historyList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No assessments completed yet. Take the Campus Placement Comprehensive Test or SVAR Voice test to generate your performance records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-4">Test Type</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">CEFR / Badge</th>
                    <th className="py-3 px-4">Audio Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {historyList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-950/50">
                      <td className="py-3 px-4 capitalize font-sans text-slate-200">
                        {item.test_type?.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {item.headline_score}%
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {item.rating_or_badge || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {item.summary?.has_recorded_audio || item.audio_data ? (
                          <span className="text-emerald-400 text-[11px] font-sans font-bold flex items-center gap-1">
                            <Mic className="w-3 h-3" /> Voice Saved
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-sans">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
