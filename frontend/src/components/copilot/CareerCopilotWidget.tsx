import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RefreshCw,
  ChevronRight,
  Bot,
  User,
  GraduationCap,
  Target,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { sendCopilotMessage, getCopilotSuggestions } from '../../services/copilot';
import type { CopilotMessage } from '../../types/copilot';

interface CareerCopilotWidgetProps {
  studentName?: string;
  targetRole?: string;
}

export const CareerCopilotWidget: React.FC<CareerCopilotWidgetProps> = ({
  studentName,
  targetRole = 'software_engineer',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${
        studentName ? studentName.split(' ')[0] : 'there'
      }! 👋 I am your **HireMatrix Career Copilot**.\n\nI have real-time access to your academic standing, TreeSHAP placement readiness, LeetCode benchmarks, and missing skills. How can I assist your placement preparation today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'How can I boost my placement readiness past 90%?',
        'Give me a 30-day DSA roadmap for LeetCode Mediums',
        'How should I explain my backlogs to campus interviewers?',
        'Audit my resume for ATS formatting',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const loadSuggestions = async () => {
    try {
      const res = await getCopilotSuggestions();
      setSuggestions(res.suggestions || []);
    } catch {
      // Default fallbacks
    }
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: CopilotMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await sendCopilotMessage({
        message: textToSend,
        history: historyPayload,
        target_role: targetRole,
      });

      const assistantMsg: CopilotMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggested_actions,
        contextUsed: res.context_used,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Apologies**: ${
          err.response?.data?.detail || err.message || 'Unable to connect to Career Copilot service.'
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessageText = (content: string) => {
    // Quick, clean formatting for markdown bold, lists, quotes, code tags
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line;

      // Handle quotes
      if (formattedLine.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-2 border-indigo-400 pl-3 my-1.5 italic text-slate-300 text-xs bg-indigo-950/20 py-1 rounded-r"
          >
            {formattedLine.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      // Handle list items
      const isBullet = formattedLine.match(/^(\*|-|\d+\.)\s+(.*)/);
      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-1 text-xs">
            <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
            <span>{renderInline(isBullet[2])}</span>
          </div>
        );
      }

      if (!formattedLine.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="text-xs my-0.5">
          {renderInline(formattedLine)}
        </p>
      );
    });
  };

  const renderInline = (str: string) => {
    // Basic bold **text** and inline code `code`
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-white font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 bg-slate-800 text-teal-300 rounded text-[11px] font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold text-sm shadow-2xl shadow-indigo-500/40 transition-all duration-300 transform hover:scale-105"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
          <span className="tracking-wide">AI Career Copilot</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 uppercase font-semibold text-white/90">
            Live
          </span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          className={`flex flex-col bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl shadow-slate-950/80 transition-all duration-300 overflow-hidden ${
            isExpanded
              ? 'w-[90vw] md:w-[650px] h-[85vh]'
              : 'w-[92vw] sm:w-[420px] h-[580px]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  PlacementIQ Career Copilot
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Live Academic & ML Context Injected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick context strip */}
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campus Role: <strong className="text-slate-200">Software Engineer</strong></span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Target className="w-3.5 h-3.5" />
              <span>SHAP Model Synced</span>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-slate-200 ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none'
                        : 'bg-slate-950/80 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className="leading-relaxed">
                      {isUser ? m.text : formatMessageText(m.text)}
                    </div>

                    {/* Suggested Action Chips */}
                    {!isUser && m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Recommended Follow-ups:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.suggestedActions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(action)}
                              className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/20 text-indigo-300 hover:text-white transition flex items-center gap-1 group"
                            >
                              <span>{action}</span>
                              <ChevronRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-[10px] text-right mt-1.5 text-slate-400 opacity-60">
                      {m.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs py-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                </div>
                <span className="italic">Career Copilot is evaluating your profile...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Carousel if few messages */}
          {messages.length <= 2 && suggestions.length > 0 && (
            <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/60 overflow-x-auto whitespace-nowrap flex gap-2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-900/40 border border-slate-700/60 text-[11px] text-slate-300 hover:text-indigo-200 transition shrink-0"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about readiness, backlogs, DSA, or ATS..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white disabled:opacity-40 transition shadow-md shadow-indigo-500/20"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
