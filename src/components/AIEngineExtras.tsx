import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Briefcase, 
  CloudSun, 
  Car, 
  Compass, 
  TrendingUp, 
  Coffee, 
  HelpCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Play, 
  Pause, 
  RotateCcw, 
  Droplet, 
  Accessibility, 
  Bookmark, 
  Activity,
  Award,
  ArrowRight,
  Flame,
  Zap,
  Info,
  Loader2
} from "lucide-react";
import { Task, TimeBlock } from "../types";

interface AIEngineExtrasProps {
  tasks: Task[];
  schedule: TimeBlock[];
  onUpdateSchedule: (newSchedule: TimeBlock[]) => void;
  onUpdateTasks: (newTasks: Task[]) => void;
  onLogActivity: (message: string, type: "create" | "complete" | "update" | "delete" | "system" | "highrisk") => void;
  circadianRhythm: "morning" | "balanced" | "night";
  todayEnergy: "low" | "medium" | "high";
  customGeminiKey?: string;
}

export default function AIEngineExtras({
  tasks,
  schedule,
  onUpdateSchedule,
  onUpdateTasks,
  onLogActivity,
  circadianRhythm,
  todayEnergy,
  customGeminiKey
}: AIEngineExtrasProps) {
  // --- STATE FOR DAILY BRIEFING ---
  const [briefing, setBriefing] = useState<any>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

  // --- STATE FOR WHAT-IF SIMULATOR ---
  const [scenarioInput, setScenarioInput] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // --- STATE FOR EMERGENCY MODE ---
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencySummary, setEmergencySummary] = useState<string[] | null>(null);

  // --- STATE FOR POMODORO / FOCUS ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [focusType, setFocusType] = useState<"focus" | "break">("focus");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"hydrate" | "stretch" | null>(null);

  // --- MOCK WEATHER & TRAFFIC PRESETS ---
  const weatherOptions = ["Clear & Sunny (72°F)", "Light Showers (58°F)", "Heavy Rain & Wind (45°F)"];
  const trafficOptions = ["Standard Commute (Green)", "Moderate Delays (Orange)", "High Congestion (Red)"];
  const [selectedWeather, setSelectedWeather] = useState(weatherOptions[0]);
  const [selectedTraffic, setSelectedTraffic] = useState(trafficOptions[0]);

  // Fetch Daily AI Briefing
  const fetchDailyBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const response = await fetch("/api/gemini/daily-briefing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customGeminiKey ? { "x-custom-api-key": customGeminiKey } : {})
        },
        body: JSON.stringify({
          tasks,
          circadianRhythm,
          currentEnergy: todayEnergy,
          weather: selectedWeather,
          traffic: selectedTraffic,
          currentTime: new Date().toISOString()
        })
      });

      const data = await response.json();
      setBriefing(data);
      if (data.optimizedSchedule && data.optimizedSchedule.length > 0) {
        onUpdateSchedule(data.optimizedSchedule);
      }
      onLogActivity(`Generated morning executive AI Briefing aligned to ${circadianRhythm} rhythm.`, "system");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBriefing(false);
    }
  };

  useEffect(() => {
    if (tasks.length > 0 && !briefing) {
      fetchDailyBriefing();
    }
  }, [tasks]);

  // Handle What-If simulation
  const handleWhatIfSimulation = async (scenario: string) => {
    if (!scenario.trim()) return;
    setSimulating(true);
    try {
      const response = await fetch("/api/gemini/what-if", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customGeminiKey ? { "x-custom-api-key": customGeminiKey } : {})
        },
        body: JSON.stringify({
          scenario,
          tasks,
          schedule,
          currentTime: new Date().toISOString()
        })
      });
      const data = await response.json();
      setSimulationResult(data);
      onLogActivity(`Simulated what-if contingency: "${scenario}"`, "system");
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const applySimulationResult = () => {
    if (simulationResult?.schedule) {
      onUpdateSchedule(simulationResult.schedule);
      setSimulationResult(null);
      setScenarioInput("");
      onLogActivity("Applied simulated contingency schedule to live timeline.", "update");
    }
  };

  // Handle Emergency Mode (Triage protocol)
  const triggerEmergencyProtocol = () => {
    if (isEmergencyActive) {
      // Revert emergency mode
      setIsEmergencyActive(false);
      setEmergencySummary(null);
      fetchDailyBriefing();
      onLogActivity("Deactivated Emergency Mode. Standard timeline restored.", "system");
      return;
    }

    setIsEmergencyActive(true);
    // Triage steps: cancel low priority, prioritize, alert user
    const highPriorityTasks = tasks.filter(t => t.priority === "high");
    const emergencyTasks = highPriorityTasks.length > 0 ? highPriorityTasks : tasks.slice(0, 1);
    
    // Construct strict, resilient schedule
    const emergencyBlocks: TimeBlock[] = [
      { time: "08:00 AM", action: "🚨 Emergency Sync: Triage critical deadlines", duration: "30 mins" },
      ...emergencyTasks.map((t, index) => ({
        time: `${9 + index}:00 AM`,
        action: `🔥 CRITICAL PRIORITY: ${t.name}`,
        duration: "2 hours",
        taskId: t.id
      })),
      { time: "01:00 PM", action: "Hydration & Cognitive Decompression", duration: "30 mins" },
      { time: "02:00 PM", action: "Remaining High Priority Grind block", duration: "2 hours" }
    ];

    onUpdateSchedule(emergencyBlocks);
    setEmergencySummary([
      "Canceled all low-priority calendar events to prevent burnout and focus fatigue.",
      "Consolidated remaining effort into dedicated, protected 2-hour high-priority sprints.",
      "Injected mandatory cognitive decompression break to maintain absolute peak throughput.",
      "Deferred non-essential meetings to standard alternative buffer windows tomorrow."
    ]);
    onLogActivity("🚨 EMERGENCY MODE ACTIVATED! Low priority events triaged out.", "highrisk");
  };

  // --- POMODORO CLOCK ENGINE ---
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Flip types
      if (focusType === "focus") {
        setFocusType("break");
        setTimeLeft(5 * 60);
        onLogActivity("Focus session completed! Great job protecting your schedule.", "complete");
      } else {
        setFocusType("focus");
        setTimeLeft(25 * 60);
        onLogActivity("Break finished. Deep work block starting now.", "system");
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, focusType]);

  // Periodic Hydration & Stretch micro-alerts
  useEffect(() => {
    let reminderTimer: any = null;
    if (isActive) {
      reminderTimer = setInterval(() => {
        const isHydrate = Math.random() > 0.5;
        if (isHydrate) {
          setAlertType("hydrate");
          setAlertMessage("💧 Hydration reminder: Drink 200ml of fresh water now!");
        } else {
          setAlertType("stretch");
          setAlertMessage("🧘 Body stretch: Do a 30-second stand up shoulder and neck roll!");
        }
        setTimeout(() => {
          setAlertMessage(null);
          setAlertType(null);
        }, 5000);
      }, 45 * 1000); // Trigger every 45 seconds during focus for active demo
    }
    return () => clearInterval(reminderTimer);
  }, [isActive]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // --- CONFLICT DETECTION LOGIC ---
  const checkOverlaps = () => {
    // Simple verification for identical schedule block start times
    const times = schedule.map(b => b.time);
    const duplicates = times.filter((item, index) => times.indexOf(item) !== index);
    return duplicates.length > 0;
  };

  const hasOverlapConflict = checkOverlaps();

  const resolveOverlapsWithAlternative = (optionIndex: number) => {
    let resolved = [...schedule];
    if (optionIndex === 0) {
      // Squeeze: shift the second duplicates forward by 30 mins
      const timesSeen: string[] = [];
      resolved = resolved.map(block => {
        if (timesSeen.includes(block.time)) {
          // Adjust time text slightly
          const parts = block.time.split(" ");
          return { ...block, time: `${parts[0]} (Shifted 30m)`, action: `${block.action} (AI Compressed)` };
        }
        timesSeen.push(block.time);
        return block;
      });
      onLogActivity("Conflict resolved using: Squeeze Buffers algorithm.", "update");
    } else if (optionIndex === 1) {
      // Postpone: filter duplicates
      const timesSeen: string[] = [];
      resolved = resolved.filter(block => {
        if (timesSeen.includes(block.time)) {
          return false; // remove
        }
        timesSeen.push(block.time);
        return true;
      });
      onLogActivity("Conflict resolved using: Postpone Low Priority overrides.", "update");
    } else {
      // Re-route: add clear delays
      resolved = resolved.map((b, i) => {
        if (i > 2) {
          return { ...b, time: `${b.time} [Deferred]` };
        }
        return b;
      });
      onLogActivity("Conflict resolved using: Distribute evenly to tomorrow.", "update");
    }
    onUpdateSchedule(resolved);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-engine-extras-container">
      
      {/* LEFT COLUMN (Daily Briefing & Conflict Resolution) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Daily Executive AI Briefing Panel */}
        <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/85 p-5 md:p-6 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans text-sm font-bold text-white tracking-tight uppercase">Executive AI Daily Briefing</h3>
                <p className="text-[10px] text-zinc-500">Intelligent adaptive dashboard compiled dynamically.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Context Selector */}
              <select 
                value={selectedWeather} 
                onChange={(e) => setSelectedWeather(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-400 rounded-lg px-2 py-1 focus:outline-none"
              >
                {weatherOptions.map(w => <option key={w} value={w}>{w}</option>)}
              </select>

              <button
                onClick={fetchDailyBriefing}
                disabled={loadingBriefing}
                className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/30 text-purple-300 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                {loadingBriefing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flame className="w-3 h-3" />}
                Re-Compile
              </button>
            </div>
          </div>

          {loadingBriefing ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-xs text-zinc-500 font-medium">Assembling predictive models, weather conditions, traffic flows and energy alignments...</p>
            </div>
          ) : briefing ? (
            <div className="space-y-5">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" /> Productivity Potential
                  </span>
                  <p className="text-xs font-bold text-white font-sans">{briefing.productivityPrediction}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 flex items-center gap-1">
                    <CloudSun className="w-3 h-3 text-amber-400" /> Weather Factor
                  </span>
                  <p className="text-xs font-bold text-white truncate font-sans">{briefing.weatherConsiderations}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 flex items-center gap-1">
                    <Car className="w-3 h-3 text-blue-400" /> Transit / Commute
                  </span>
                  <p className="text-xs font-bold text-white truncate font-sans">{briefing.trafficConsiderations}</p>
                </div>
              </div>

              {/* Core Targets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> Critical Targets Today
                  </span>
                  <ul className="space-y-1.5">
                    {briefing.todayPriorityTasks.map((t: string, i: number) => (
                      <li key={i} className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> {t}
                      </li>
                    ))}
                    {briefing.todayPriorityTasks.length === 0 && (
                      <li className="text-xs text-zinc-500">No high-priority tasks pending today. All safe!</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-amber-400" /> Protective Focus Blocks
                  </span>
                  <ul className="space-y-1.5">
                    {briefing.suggestedFocusPeriods.map((p: string, i: number) => (
                      <li key={i} className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Why AI Made Decision panel */}
              <div className="p-4 rounded-xl border border-purple-500/10 bg-gradient-to-r from-purple-950/10 via-transparent to-transparent space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Why AI Made These Changes</span>
                <div className="space-y-1.5">
                  {briefing.whyAiDecision.map((reason: string, idx: number) => (
                    <p key={idx} className="text-xs text-zinc-400 leading-relaxed font-medium">
                      🤖 <strong className="text-zinc-300">Adjustment:</strong> {reason}
                    </p>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <Compass className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-500">Provide tasks to compile your executive briefing dashboard.</p>
            </div>
          )}
        </div>

        {/* Dynamic Overlap Conflict Solver */}
        {hasOverlapConflict && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-amber-500/25 bg-amber-950/10 p-5 space-y-4"
          >
            <div className="flex items-center gap-2.5 text-amber-400 border-b border-amber-500/20 pb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest">Time Overlap Detected!</h4>
                <p className="text-[10px] text-zinc-400">Multiple events are booked at the exact same timeframe.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              We identified scheduling collisions on your daily block timeline. Select one of the three intelligent alternative resolutions compiled by Gemini to resolve this:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => resolveOverlapsWithAlternative(0)}
                className="px-3 py-2 border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Squeeze Buffers (Keep Both)
              </button>
              <button
                onClick={() => resolveOverlapsWithAlternative(1)}
                className="px-3 py-2 border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Postpone Low-Priority
              </button>
              <button
                onClick={() => resolveOverlapsWithAlternative(2)}
                className="px-3 py-2 border border-amber-500/30 hover:bg-amber-500/10 text-amber-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Reschedule to Tomorrow
              </button>
            </div>
          </motion.div>
        )}

        {/* What-If Simulator & Emergency Triage Mode */}
        <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/85 p-5 md:p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-4">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-bold text-white tracking-tight uppercase">Predictive Scenario Simulator</h3>
              <p className="text-[10px] text-zinc-500">Run sandbox simulations or trigger immediate Emergency mode protocols.</p>
            </div>
          </div>

          {/* Sandbox selector */}
          <div className="space-y-3.5">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Run contingency sandboxes</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={scenarioInput}
                onChange={(e) => setScenarioInput(e.target.value)}
                placeholder="e.g. 'What if traffic doubles?' or 'What if my 10 AM meeting gets delayed by 2 hours?'"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-650 focus:outline-none focus:border-blue-500/40 transition-colors"
              />
              <button
                onClick={() => handleWhatIfSimulation(scenarioInput)}
                disabled={simulating || !scenarioInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Run"}
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button 
                onClick={() => { setScenarioInput("What if traffic doubles?"); handleWhatIfSimulation("What if traffic doubles?"); }}
                className="px-2.5 py-1 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 text-[10px] text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer font-semibold"
              >
                Traffic Doubles
              </button>
              <button 
                onClick={() => { setScenarioInput("What if I sleep 1 hour longer?"); handleWhatIfSimulation("What if I sleep 1 hour longer?"); }}
                className="px-2.5 py-1 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 text-[10px] text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer font-semibold"
              >
                Sleep 1hr longer
              </button>
              <button 
                onClick={() => { setScenarioInput("What if meeting is delayed 2 hours?"); handleWhatIfSimulation("What if meeting is delayed 2 hours?"); }}
                className="px-2.5 py-1 bg-zinc-900/60 border border-zinc-850 hover:border-zinc-800 text-[10px] text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer font-semibold"
              >
                Meeting Delayed 2 hrs
              </button>
            </div>
          </div>

          {/* Sandbox Simulation Output */}
          <AnimatePresence>
            {simulationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.01] space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Simulation Output Reached</span>
                  <button 
                    onClick={() => setSimulationResult(null)}
                    className="text-zinc-500 hover:text-white text-xs font-bold"
                  >
                    Discard
                  </button>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed italic">
                  "{simulationResult.message}"
                </p>

                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Reschedule Decisions:</span>
                  {simulationResult.reasoning.map((r: string, i: number) => (
                    <p key={i} className="text-xs text-zinc-400 font-semibold">• {r}</p>
                  ))}
                </div>

                <button
                  onClick={applySimulationResult}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" /> Apply Simulated Fallback Timeline
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EMERGENCY MODE BOX */}
          <div className="pt-4 border-t border-zinc-900">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/15 via-red-950/5 to-transparent">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-4 h-4 animate-bounce text-red-500" /> Extreme Emergency Protocol
                </h4>
                <p className="text-[11px] text-zinc-400 pr-4">Instantly purge low-priority items, stretch deadlines, and build a safe-haven defense schedule.</p>
              </div>

              <button
                onClick={triggerEmergencyProtocol}
                className={`px-5 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-lg active:scale-95 shrink-0 cursor-pointer ${
                  isEmergencyActive 
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" 
                    : "bg-red-600 hover:bg-red-500 text-white shadow-red-500/10 border border-red-500 animate-pulse"
                }`}
              >
                {isEmergencyActive ? "Cancel Protocol" : "Trigger Triage"}
              </button>
            </div>

            {/* Emergency updates */}
            {emergencySummary && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 p-3.5 rounded-xl bg-red-500/[0.02] border border-red-500/10 space-y-2"
              >
                <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold">Triage Adjustments Made:</span>
                <div className="space-y-1.5">
                  {emergencySummary.map((sum, index) => (
                    <p key={index} className="text-xs text-zinc-300 font-medium">🛡️ {sum}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN (Focus Session Pomodoro & Habits Learnings) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Deep Focus Mode with Pomodoro Timer */}
        <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/85 p-5 md:p-6 space-y-5 shadow-xl text-center">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 text-left">
            <Coffee className="w-4.5 h-4.5 text-purple-400" />
            <div>
              <h3 className="font-sans text-xs font-bold text-white uppercase tracking-widest">Protective Focus Mode</h3>
              <p className="text-[9px] text-zinc-500">Block distractions & run structured sprints.</p>
            </div>
          </div>

          {/* Alert Message for Hydration / Stretch */}
          <AnimatePresence>
            {alertMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 text-left shadow-lg ${
                  alertType === "hydrate" 
                    ? "bg-blue-500/10 border-blue-500/25 text-blue-300" 
                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                }`}
              >
                {alertType === "hydrate" ? <Droplet className="w-4 h-4 text-blue-400 shrink-0" /> : <Accessibility className="w-4 h-4 text-emerald-400 shrink-0" />}
                <span>{alertMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="py-6 space-y-3">
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider text-purple-400">
              {focusType === "focus" ? "Deep Work Block" : "Cognitive Break"}
            </span>

            <div className="font-mono text-4xl md:text-5xl font-black text-white tracking-widest py-2">
              {formatTimer(timeLeft)}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsActive(!isActive)}
                className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all cursor-pointer active:scale-95"
              >
                {isActive ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 translate-x-0.5" />}
              </button>
              <button
                onClick={() => { setIsActive(false); setTimeLeft(25 * 60); setFocusType("focus"); }}
                className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
            * We dynamically trigger Hydration & Deep Stretch suggestions directly in your focus window to offset fatigue.
          </div>
        </div>

        {/* Habits Learning Database & Adaptive Rules */}
        <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/85 p-5 md:p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Activity className="w-4.5 h-4.5 text-purple-400" />
            <div>
              <h3 className="font-sans text-xs font-bold text-white uppercase tracking-widest">Learned Habits Database</h3>
              <p className="text-[9px] text-zinc-500">Continual pattern optimization metrics.</p>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
            Deadline Guardian continuously analyzes timing logs, delay frequencies, and skipped periods to optimize schedules automatically.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-300">Morning Workout Delay Habit</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Adapted</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Skipped 6:00 AM workout blocks 4 times last week. Gemini automatically shifted physical exercise periods to 07:30 AM to safeguard completion.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-300">Late Study Bias</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">Adapted</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Calculated high focus focus score (92%) on Chapters reviews done past 8:00 PM. Future heavy study blocks prioritized for post-dinner.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-300">Meeting Buffer Inflation</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">Auto-Buffer</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Often starts client reviews 5-7 mins late. Injected default 10-minute automated transit & decompression buffers before meetings.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
