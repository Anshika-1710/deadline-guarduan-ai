import React, { useState, useEffect, useRef } from "react";
import { Task } from "../types";
import { Play, Pause, RotateCcw, Zap, Target, BookOpen, Clock, AlertCircle, CheckCircle2, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FocusModePanelProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
  onAwardXP: (xp: number, reason: string) => void;
}

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export default function FocusModePanel({ tasks, onCompleteTask, onAwardXP }: FocusModePanelProps) {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [muted, setMuted] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [isImmersive, setIsImmersive] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const modeTimes = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    setTimeLeft(modeTimes[mode]);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  // Synthetic Audio Beep Alert using AudioContext
  const playAlertSound = () => {
    if (muted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.error("Audio beep failed", e);
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    playAlertSound();
    
    if (mode === "pomodoro") {
      setSessionCount((p) => p + 1);
      onAwardXP(25, "Completed a 25-minute Deep Focus Pomodoro session");
      setMode("shortBreak");
    } else {
      onAwardXP(5, "Completed a recovery/mindfulness break");
      setMode("pomodoro");
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeTimes[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const percentageRemaining = (timeLeft / modeTimes[mode]) * 100;
  const activeTask = tasks.find((t) => t.id === selectedTaskId);
  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div className="relative space-y-6" id="focus-mode-main">
      {/* Immersive distraction free Overlay */}
      <AnimatePresence>
        {isImmersive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-[100] bg-[#020202] text-[#e0e0e0] flex flex-col justify-between items-center p-8 font-sans"
            id="immersive-focus-container"
          >
            {/* Top Bar */}
            <div className="w-full max-w-4xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-white/50">Tactical Locked Focus</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all"
                  title={muted ? "Unmute Alarm" : "Mute Alarm"}
                >
                  {muted ? <VolumeX className="w-4.5 h-4.5 text-rose-400" /> : <Volume2 className="w-4.5 h-4.5 text-emerald-400" />}
                </button>
                <button
                  onClick={() => setIsImmersive(false)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm border border-white/10 hover:border-white/20 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white transition-all"
                >
                  <Minimize2 className="w-3.5 h-3.5" /> Minimize screen
                </button>
              </div>
            </div>

            {/* Central Dial and Focus State */}
            <div className="flex flex-col items-center justify-center space-y-8 my-auto">
              {activeTask ? (
                <div className="text-center max-w-xl space-y-2">
                  <span className="text-[10px] px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-mono tracking-widest font-bold">
                    Target LOCKED
                  </span>
                  <h2 className="text-2xl font-bold font-display text-white tracking-tight leading-tight pt-1">
                    {activeTask.name}
                  </h2>
                  {activeTask.description && (
                    <p className="text-xs text-white/40 leading-relaxed font-mono max-w-lg mx-auto">
                      {activeTask.description}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center max-w-lg">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 uppercase font-mono tracking-widest">
                    SOLO EXCURSION
                  </span>
                  <h2 className="text-xl font-bold text-white/60 font-display tracking-tight leading-tight mt-1">
                    Distraction-Free Deep Flow
                  </h2>
                </div>
              )}

              {/* Huge Timer Circle */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Glow ring behind dial */}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-10 transition-all duration-1000 ${
                  mode === "pomodoro" ? "bg-amber-500" : "bg-emerald-500"
                }`} />

                <svg className="absolute transform -rotate-90 w-64 h-64" viewBox="0 0 256 256">
                  <circle cx="128" cy="128" r="116" className="stroke-white/[0.02]" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="128"
                    cy="128"
                    r="116"
                    className={`transition-all duration-1000 ${
                      mode === "pomodoro" ? "stroke-amber-500" : "stroke-emerald-400"
                    }`}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 116}
                    strokeDashoffset={2 * Math.PI * 116 * (1 - percentageRemaining / 100)}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="text-center z-10">
                  <span className="block text-5xl font-mono font-semibold tracking-tight text-white select-none">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono font-bold mt-1.5 block">
                    {mode === "pomodoro" ? "Focus session" : "MIND RE-CHARGE"}
                  </span>
                </div>
              </div>

              {/* Big Buttons */}
              <div className="flex items-center gap-6">
                <button
                  onClick={toggleTimer}
                  className={`flex items-center gap-2 px-8 py-4 rounded bg-amber-600 hover:bg-amber-500 text-sm font-bold uppercase tracking-wider text-white shadow-lg active:scale-95 transition-all`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? "PAUSE TASK" : "RESUME FOCUS"}</span>
                </button>

                <button
                  onClick={resetTimer}
                  className="flex items-center justify-center h-12 w-12 rounded border border-white/10 hover:border-white/20 text-white/50 hover:text-white bg-white/5 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Bottom Actions and Status */}
            <div className="w-full max-w-4xl flex items-center justify-between border-t border-white/5 pt-6 text-[10px] font-mono uppercase tracking-widest text-white/30">
              <div>Session completions today: <strong className="text-white">{sessionCount}</strong></div>
              <div>GuardX OS v2.1</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Normal Dashboard View Layout */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
            🎯 tactical Pomodoro Dial
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Initiate deep focus cycles mapped directly to urgent deadlines with synthetic alarm triggers.
          </p>
        </div>

        <button
          onClick={() => setIsImmersive(true)}
          className="flex items-center gap-2 rounded-sm border border-white/10 hover:border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all active:scale-[0.98]"
        >
          <Maximize2 className="w-4 h-4 text-amber-500" />
          Enter Immersive Mode
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left side: The beautiful circular countdown timer */}
        <div className="lg:col-span-7 rounded-lg border border-white/10 bg-white/[0.02] p-6 flex flex-col items-center justify-center text-center min-h-[420px] relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setMuted(!muted)}
              className="p-1.5 rounded-sm hover:bg-white/5 text-white/50 hover:text-white transition-all"
              title={muted ? "Unmute Alarm" : "Mute Alarm"}
            >
              {muted ? <VolumeX className="w-4.5 h-4.5 text-rose-400" /> : <Volume2 className="w-4.5 h-4.5 text-emerald-400" />}
            </button>
          </div>

          {/* Tab Controls for Mode Selection */}
          <div className="flex bg-[#050505] p-1.5 rounded-sm border border-white/10 text-xs font-semibold uppercase tracking-wider mb-8">
            {(["pomodoro", "shortBreak", "longBreak"] as const).map((m) => {
              const labels = {
                pomodoro: "🎯 Deep Work",
                shortBreak: "☕ Quick Rest",
                longBreak: "🏖️ Recess",
              };
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-sm transition-all ${
                    mode === m
                      ? "bg-amber-600 text-white font-bold"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {labels[m]}
                </button>
              );
            })}
          </div>

          {/* Big Circular Dial */}
          <div className="relative w-52 h-52 flex items-center justify-center mb-6">
            <svg className="absolute transform -rotate-90 w-52 h-52" viewBox="0 0 208 208">
              <circle
                cx="104"
                cy="104"
                r="94"
                className="stroke-white/5"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="104"
                cy="104"
                r="94"
                className={`transition-all duration-1000 ${
                  mode === "pomodoro"
                    ? "stroke-amber-500"
                    : mode === "shortBreak"
                    ? "stroke-emerald-400"
                    : "stroke-blue-400"
                }`}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 94}
                strokeDashoffset={2 * Math.PI * 94 * (1 - percentageRemaining / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <span className="block text-4xl font-mono font-bold text-white select-none">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1 block">
                {mode === "pomodoro" ? "Focus Interval" : "Mental Re-charge"}
              </span>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all ${
                isRunning
                  ? "bg-rose-600/20 border border-rose-500/30 text-rose-400 hover:bg-rose-600/30"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? "Pause Session" : "Initiate Focus"}</span>
            </button>

            <button
              onClick={resetTimer}
              className="flex items-center justify-center h-11 w-11 rounded-sm border border-white/10 hover:border-white/20 text-white/50 hover:text-white bg-white/5 transition-all active:scale-95"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[10px] text-white/30 font-mono mt-6">
            Completed Pomodoros Today: <span className="text-amber-500 font-bold">{sessionCount}</span> (XP Rate: +25 XP/block)
          </p>
        </div>

        {/* Right side: Selected target task details and checks */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold flex items-center gap-2">
              <Target className="w-4.5 h-4.5" /> Core Target Objective
            </h3>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                Select a Task
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full rounded-sm border border-white/10 bg-[#050505] p-3 text-xs text-white focus:border-amber-500 focus:outline-none transition-all font-sans"
              >
                <option value="">-- Click here to select a task --</option>
                {pendingTasks.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0a0a0a] text-white font-sans">
                    [{t.category || "General"}] {t.name}
                  </option>
                ))}
              </select>
            </div>

            <AnimatePresence mode="wait">
              {activeTask ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded border border-amber-500/15 bg-amber-500/5 space-y-3 mt-2"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                      🎯 Active Target
                    </h4>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                      {activeTask.priority} PRIORITY
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1 leading-tight">{activeTask.name}</p>
                  {activeTask.description && (
                    <p className="text-[11px] text-white/60 leading-normal">{activeTask.description}</p>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-amber-500/10">
                    <button
                      onClick={() => {
                        onCompleteTask(activeTask.id);
                        setSelectedTaskId("");
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-amber-600 hover:bg-amber-500 text-white rounded-sm shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Complete (+50 XP)
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="p-4 rounded border border-white/5 bg-[#0a0a0a] text-center text-white/30 text-xs py-8">
                  <BookOpen className="w-8 h-8 text-white/15 mx-auto mb-2" />
                  No task selected. Pick one above to start focusing!
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-xs space-y-2 text-emerald-300">
            <h4 className="font-bold flex items-center gap-1.5 text-emerald-400">
              <Zap className="w-3.5 h-3.5" /> Quick Advice
            </h4>
            <ul className="space-y-1 text-[11px] text-emerald-300/80 list-disc list-inside">
              <li>Put your phone away in another room.</li>
              <li>Close all social media and chat tabs.</li>
              <li>Work on just one task for 25 minutes.</li>
              <li>Take a real rest when the timer rings.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
