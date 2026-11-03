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
  HelpCircle,
  Layers,
  History,
  Activity,
  ChevronRight,
  ShieldCheck,
  Play,
  Square,
  BookOpen,
} from 'lucide-react';
import {
  fetchAptitudeQuestions,
  submitAptitudeAnswers,
  fetchSvarExercises,
  evaluateSvarSentence,
  evaluateSvarExtempore,
  fetchSvarGrammarQuestions,
  submitSvarGrammarAnswers,
  fetchMyAssessmentHistory,
  type AptitudeQuestion,
  type AptitudeResult,
  type SvarSentence,
  type ExtemporeTopic,
  type SvarSentenceEvaluation,
  type ExtemporeEvaluation,
  type SvarGrammarQuestion,
  type SvarGrammarResult,
} from '../../services/assessments';

export const AssessmentHubView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mcq' | 'svar_grammar' | 'svar_voice' | 'extempore' | 'history'>('mcq');

  // --- MCQ STATE ---
  const [mcqQuestions, setMcqQuestions] = useState<AptitudeQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [mcqTimeLeft, setMcqTimeLeft] = useState(600); // 10 minutes
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqResult, setMcqResult] = useState<AptitudeResult | null>(null);
  const [mcqStarted, setMcqStarted] = useState(false);

  // --- SVAR GRAMMAR STATE ---
  const [grammarQuestions, setGrammarQuestions] = useState<SvarGrammarQuestion[]>([]);
  const [currentGrammarIndex, setCurrentGrammarIndex] = useState(0);
  const [grammarAnswers, setGrammarAnswers] = useState<Record<string, number>>({});
  const [grammarTimeLeft, setGrammarTimeLeft] = useState(480); // 8 minutes
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarResult, setGrammarResult] = useState<SvarGrammarResult | null>(null);
  const [grammarStarted, setGrammarStarted] = useState(false);

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

    // Preload speech synthesis voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    loadInitialData();
  }, [activeTab]);

  // Timer for MCQ Test
  useEffect(() => {
    let interval: any = null;
    if (mcqStarted && mcqTimeLeft > 0 && !mcqResult) {
      interval = setInterval(() => {
        setMcqTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmitMcq();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mcqStarted, mcqTimeLeft, mcqResult]);

  // Timer for SVAR Grammar Test
  useEffect(() => {
    let interval: any = null;
    if (grammarStarted && grammarTimeLeft > 0 && !grammarResult) {
      interval = setInterval(() => {
        setGrammarTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmitGrammar();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [grammarStarted, grammarTimeLeft, grammarResult]);

  const loadInitialData = async () => {
    try {
      const svarData = await fetchSvarExercises();
      setSvarSentences(svarData.sentences);
      setExtemporeTopics(svarData.extempore_topics);
    } catch {
      // Fallback
    }
  };

  // --- MCQ CONTROLLERS ---
  const startMcqTest = async () => {
    try {
      setMcqLoading(true);
      const questions = await fetchAptitudeQuestions(10);
      setMcqQuestions(questions);
      setSelectedAnswers({});
      setMcqResult(null);
      setCurrentQIndex(0);
      setMcqTimeLeft(600);
      setMcqStarted(true);
    } catch (err) {
      console.error('Error starting Aptitude MCQ:', err);
    } finally {
      setMcqLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleAutoSubmitMcq = async () => {
    if (mcqResult) return;
    try {
      setMcqLoading(true);
      const res = await submitAptitudeAnswers({
        answers: selectedAnswers,
        time_taken_seconds: 600 - mcqTimeLeft,
      });
      setMcqResult(res);
      setMcqStarted(false);
    } catch (err) {
      console.error('Error submitting Aptitude MCQ:', err);
    } finally {
      setMcqLoading(false);
    }
  };

  // --- SVAR GRAMMAR CONTROLLERS ---
  const startGrammarTest = async () => {
    try {
      setGrammarLoading(true);
      const questions = await fetchSvarGrammarQuestions(10);
      setGrammarQuestions(questions);
      setGrammarAnswers({});
      setGrammarResult(null);
      setCurrentGrammarIndex(0);
      setGrammarTimeLeft(480);
      setGrammarStarted(true);
    } catch (err) {
      console.error('Error starting SVAR Grammar:', err);
    } finally {
      setGrammarLoading(false);
    }
  };

  const handleSelectGrammarOption = (questionId: string, optionIndex: number) => {
    setGrammarAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleAutoSubmitGrammar = async () => {
    if (grammarResult) return;
    try {
      setGrammarLoading(true);
      const res = await submitSvarGrammarAnswers({
        answers: grammarAnswers,
        time_taken_seconds: 480 - grammarTimeLeft,
      });
      setGrammarResult(res);
      setGrammarStarted(false);
    } catch (err) {
      console.error('Error submitting SVAR Grammar:', err);
    } finally {
      setGrammarLoading(false);
    }
  };

  // --- HIGH-QUALITY NATURAL TTS SPEECH SYNTHESIS ---
  const handlePlaySentence = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Select the most natural human-sounding English voice available
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

    // 0.88 rate creates crisp, unhurried, natural corporate articulation
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

  // --- STT & MEDIARECORDER RECORDING (Captures Real Spoken Voice Audio) ---
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop speech recognition
      try {
        recognitionRef.current?.stop();
      } catch {
        // No-op
      }

      // Stop MediaRecorder and finalize audio blob
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      setSpokenTranscript('');
      setSvarEvaluation(null);
      setRecordedAudioUrl(null);
      setRecordedAudioBase64(null);

      // Start Web Speech Recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // Already running
        }
      }

      // Start MediaRecorder stream capture
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mr = new MediaRecorder(stream);

        mr.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mr.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(blob);
          setRecordedAudioUrl(audioUrl);

          const reader = new FileReader();
          reader.onloadend = () => {
            setRecordedAudioBase64(reader.result as string);
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

  // --- EXTEMPORE SPEECH RECORDING ---
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
          // Already running
        }
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        extemporeAudioChunksRef.current = [];
        const mr = new MediaRecorder(stream);

        mr.ondataavailable = (event) => {
          if (event.data.size > 0) {
            extemporeAudioChunksRef.current.push(event.data);
          }
        };

        mr.onstop = () => {
          const blob = new Blob(extemporeAudioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(blob);
          setExtemporeAudioUrl(audioUrl);

          const reader = new FileReader();
          reader.onloadend = () => {
            setExtemporeAudioBase64(reader.result as string);
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Brain className="w-3.5 h-3.5" />
            AI Placement Assessment & SVAR Voice Suite
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Aptitude MCQs, SVAR Grammar & Spoken Voice Suite
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Multi-stage enterprise test platform configured for Tier-1 corporate drives. Practice Percentages, Ratios, Number Series, and Data Interpretation Charts, take the dedicated SVAR Grammar Diagnostic, or test spoken English pronunciation with real-time audio recording and AI grading.
          </p>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('mcq')}
          className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'mcq'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Aptitude & Data Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('svar_grammar')}
          className={`flex-1 min-w-[150px] px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'svar_grammar'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>SVAR Grammar Test</span>
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
          <span>Report Card</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. APTITUDE & DATA INTERPRETATION MCQS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'mcq' && (
        <div className="space-y-6">
          {!mcqStarted && !mcqResult && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Full-Length Aptitude & Data Interpretation Test</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Randomized questions generated per session across Percentages & Profit/Loss, Ratios & Proportions, Mixtures, Ages, Word/Letter Series ("Find Next Word"), and Data Interpretation Charts.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Questions</span>
                  <span className="text-sm font-bold text-white">10 MCQs (Dynamic)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Duration</span>
                  <span className="text-sm font-bold text-white">10 Minutes</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Marking</span>
                  <span className="text-sm font-bold text-emerald-400">+1 / 0 Marks</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Randomization</span>
                  <span className="text-sm font-bold text-indigo-400">Fresh Set Each Try</span>
                </div>
              </div>

              <button
                onClick={startMcqTest}
                disabled={mcqLoading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-indigo-500/30 inline-flex items-center gap-2 transition-all"
              >
                {mcqLoading ? 'Generating Fresh Test...' : 'Start Aptitude Assessment'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ACTIVE TEST INTERFACE */}
          {mcqStarted && mcqQuestions.length > 0 && !mcqResult && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Area (3 cols) */}
              <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                      {mcqQuestions[currentQIndex]?.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {mcqQuestions[currentQIndex]?.subtopic}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Time Remaining: {formatTime(mcqTimeLeft)}</span>
                  </div>
                </div>

                {/* Question Prompt */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-2">
                    Question {currentQIndex + 1} of {mcqQuestions.length}
                  </h3>
                  {mcqQuestions[currentQIndex]?.question.includes('|') ||
                  mcqQuestions[currentQIndex]?.question.includes('---+') ? (
                    <div className="space-y-3">
                      <p className="text-sm sm:text-base font-semibold text-white">
                        {mcqQuestions[currentQIndex]?.question.split('\n\n')[0]}
                      </p>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre leading-relaxed">
                        {mcqQuestions[currentQIndex]?.question.split('\n\n').slice(1).join('\n\n') ||
                          mcqQuestions[currentQIndex]?.question}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-line">
                      {mcqQuestions[currentQIndex]?.question}
                    </p>
                  )}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3 pt-2">
                  {mcqQuestions[currentQIndex]?.options.map((opt, oIdx) => {
                    const qId = mcqQuestions[currentQIndex].id;
                    const isSelected = selectedAnswers[qId] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(qId, oIdx)}
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

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-40"
                  >
                    Previous Question
                  </button>

                  {currentQIndex < mcqQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQIndex((prev) => prev + 1)}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleAutoSubmitMcq}
                      disabled={mcqLoading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
                    >
                      {mcqLoading ? 'Submitting...' : 'Submit Assessment'}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Question Navigation Matrix (1 col) */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Question Navigator</h4>
                <div className="grid grid-cols-5 gap-2">
                  {mcqQuestions.map((q, idx) => {
                    const isAnswered = selectedAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentQIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`h-10 rounded-xl text-xs font-bold transition-all ${
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
                    <span>Answered ({Object.keys(selectedAnswers).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
                    <span>Unanswered ({mcqQuestions.length - Object.keys(selectedAnswers).length})</span>
                  </div>
                </div>

                <button
                  onClick={handleAutoSubmitMcq}
                  disabled={mcqLoading}
                  className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {mcqLoading ? 'Evaluating...' : 'Finish & Submit Test'}
                </button>
              </div>
            </div>
          )}

          {/* MCQ RESULT / SCORECARD */}
          {mcqResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2">
                    <Award className="w-3.5 h-3.5" />
                    {mcqResult.badge_awarded}
                  </div>
                  <h3 className="text-2xl font-bold text-white">Assessment Result & Scorecard</h3>
                  <p className="text-xs text-slate-400 mt-1">Status: {mcqResult.readiness_status}</p>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-extrabold text-white">{mcqResult.overall_percentage}%</span>
                  <span className="text-xs text-slate-400 block">Overall Score</span>
                </div>
              </div>

              {/* Category Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(mcqResult.category_breakdown).map(([cat, stat]: any) => (
                  <div key={cat} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 block truncate">{cat}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">{stat.correct}/{stat.total}</span>
                      <span className="text-xs font-bold text-indigo-400">{stat.accuracy_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Question-by-Question Detailed Review */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Detailed Solution Review</h4>
                <div className="space-y-3">
                  {mcqResult.detailed_review.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        item.is_correct
                          ? 'bg-emerald-950/10 border-emerald-500/30'
                          : 'bg-rose-950/10 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-white">Q{idx + 1}: {item.question}</span>
                        {item.is_correct ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 font-mono space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-400">Your Answer: </span>
                          <span className={item.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {item.selected_option_index !== null ? item.options[item.selected_option_index] : 'Unattempted'}
                          </span>
                        </div>
                        {!item.is_correct && (
                          <div>
                            <span className="text-slate-400">Correct Answer: </span>
                            <span className="text-emerald-400 font-bold">{item.options[item.correct_option_index]}</span>
                          </div>
                        )}
                        <div className="pt-2 text-slate-300 font-sans text-xs border-t border-slate-800">
                          <span className="text-indigo-400 font-semibold">Explanation: </span>
                          {item.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={startMcqTest}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                  <RotateCcw className="w-4 h-4" />
                  Take Another Assessment (Fresh Random Questions)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SVAR GRAMMAR TEST VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'svar_grammar' && (
        <div className="space-y-6">
          {!grammarStarted && !grammarResult && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">SVAR Corporate English Grammar Diagnostic</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Evaluates Subject-Verb Agreement, Conditionals, Prepositions, Relative Clauses, Tenses, and Professional Syntax according to CEFR standard benchmarks.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Questions</span>
                  <span className="text-sm font-bold text-white">10 Grammar Items</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Duration</span>
                  <span className="text-sm font-bold text-white">8 Minutes</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Grading</span>
                  <span className="text-sm font-bold text-emerald-400">CEFR Aligned</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Institutional Audit</span>
                  <span className="text-sm font-bold text-indigo-400">Recorded for Admin</span>
                </div>
              </div>

              <button
                onClick={startGrammarTest}
                disabled={grammarLoading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/30 inline-flex items-center gap-2 transition-all"
              >
                {grammarLoading ? 'Loading Questions...' : 'Start SVAR Grammar Test'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ACTIVE GRAMMAR TEST */}
          {grammarStarted && grammarQuestions.length > 0 && !grammarResult && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                    Category: {grammarQuestions[currentGrammarIndex]?.category}
                  </span>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Time Left: {formatTime(grammarTimeLeft)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 mb-2">
                    Question {currentGrammarIndex + 1} of {grammarQuestions.length}
                  </h3>
                  <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                    {grammarQuestions[currentGrammarIndex]?.question}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {grammarQuestions[currentGrammarIndex]?.options.map((opt, oIdx) => {
                    const qId = grammarQuestions[currentGrammarIndex].id;
                    const isSelected = grammarAnswers[qId] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectGrammarOption(qId, oIdx)}
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

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setCurrentGrammarIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentGrammarIndex === 0}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {currentGrammarIndex < grammarQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentGrammarIndex((prev) => prev + 1)}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleAutoSubmitGrammar}
                      disabled={grammarLoading}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
                    >
                      {grammarLoading ? 'Submitting...' : 'Submit Grammar Test'}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Matrix */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Grammar Items</h4>
                <div className="grid grid-cols-5 gap-2">
                  {grammarQuestions.map((q, idx) => {
                    const isAnswered = grammarAnswers[q.id] !== undefined;
                    const isCurrent = idx === currentGrammarIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentGrammarIndex(idx)}
                        className={`h-10 rounded-xl text-xs font-bold transition-all ${
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
                    <span>Answered ({Object.keys(grammarAnswers).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800" />
                    <span>Unanswered ({grammarQuestions.length - Object.keys(grammarAnswers).length})</span>
                  </div>
                </div>

                <button
                  onClick={handleAutoSubmitGrammar}
                  disabled={grammarLoading}
                  className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {grammarLoading ? 'Evaluating...' : 'Submit Grammar Test'}
                </button>
              </div>
            </div>
          )}

          {/* GRAMMAR RESULT */}
          {grammarResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2">
                    <Award className="w-3.5 h-3.5" />
                    {grammarResult.badge_awarded} • CEFR {grammarResult.cefr_band}
                  </div>
                  <h3 className="text-2xl font-bold text-white">SVAR Grammar Evaluation</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {grammarResult.correct_answers} of {grammarResult.total_questions} questions correct
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-3xl font-extrabold text-white">{grammarResult.score_percentage}%</span>
                  <span className="text-xs text-slate-400 block">Grammar Proficiency</span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(grammarResult.category_breakdown).map(([cat, stat]: any) => (
                  <div key={cat} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 block truncate">{cat}</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-white">{stat.correct}/{stat.total}</span>
                      <span className="text-xs font-bold text-indigo-400">
                        {stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Solution Analysis</h4>
                <div className="space-y-3">
                  {grammarResult.detailed_review.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        item.is_correct
                          ? 'bg-emerald-950/10 border-emerald-500/30'
                          : 'bg-rose-950/10 border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-white">Q{idx + 1}: {item.question}</span>
                        {item.is_correct ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 font-mono space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-400">Your Choice: </span>
                          <span className={item.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {item.selected_option_index !== null ? item.options[item.selected_option_index] : 'Unattempted'}
                          </span>
                        </div>
                        {!item.is_correct && (
                          <div>
                            <span className="text-slate-400">Correct Choice: </span>
                            <span className="text-emerald-400 font-bold">{item.options[item.correct_option_index]}</span>
                          </div>
                        )}
                        <div className="pt-2 text-slate-300 font-sans text-xs border-t border-slate-800">
                          <span className="text-indigo-400 font-semibold">Rule Explanation: </span>
                          {item.explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={startGrammarTest}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Grammar Diagnostic
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SVAR LISTEN & REPEAT (VOICE TESTING) VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'svar_voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Voice Test Canvas (2 cols) */}
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
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    onClick={() =>
                      setSelectedSentenceIndex((prev) => Math.min(svarSentences.length - 1, prev + 1))
                    }
                    disabled={selectedSentenceIndex === svarSentences.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-3">
                <Volume2 className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-200 leading-relaxed">
                  <strong>Workflow:</strong> 1. Click <em>"Listen to AI Sentence"</em> (crisp corporate voice) and remember the phrase. 2. Click <em>"Start Speaking"</em> and speak into your mic — your spoken audio is recorded and saved. 3. Click <em>"Evaluate Spoken Audio"</em> for automated SVAR CEFR scoring.
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
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 inline-flex items-center gap-2 transition-all disabled:opacity-50"
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
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
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

          {/* Sidebar: Sentence List Selector */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
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
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
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
                What Institutional Recruiters Look For:
              </h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li>• <strong>No Filler Hesitation:</strong> Avoid saying "um" or "like" during pauses.</li>
                <li>• <strong>Rhythm & Intonation:</strong> Speak with consistent cadence, don't rush.</li>
                <li>• <strong>Keyword Retention:</strong> Ensure critical nouns & verbs are articulated completely.</li>
                <li>• <strong>Audio Verification:</strong> Recordings are audited by hiring panels.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TECHNICAL EXTEMPORE SPEECH VIEW */}
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
                  className={`w-7 h-7 rounded-lg text-xs font-bold ${
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
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl mx-auto ${
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
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-40"
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
      {/* 5. MY REPORT CARD / HISTORY VIEW */}
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
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Refresh History
            </button>
          </div>

          {historyLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading test records...</div>
          ) : historyList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No assessments completed yet. Take an Aptitude MCQ test, SVAR Grammar test, or SVAR Voice test to generate your performance records.
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
                        {item.summary?.has_recorded_audio ? (
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
