import React from "react";
import { motion } from "motion/react";
import { Sparkles, Play, Shield, Dumbbell, Star, HelpCircle } from "lucide-react";
import { ProductivityCoachAdvice, Task } from "../types";

interface CoachPanelProps {
  advice: ProductivityCoachAdvice | null;
  loading: boolean;
  onRefresh: () => void;
  tasks: Task[];
  onSelectTaskByName: (name: string) => void;
}

export default function CoachPanel({
  advice,
  loading,
  onRefresh,
  tasks,
  onSelectTaskByName,
}: CoachPanelProps) {
  // Check if recommended task exists in task list to enable linking click
  const recommendedTaskName = advice?.recommendedNextTask?.split(":")[0]?.replace(/"/g, "") || "";
  const matchingTask = tasks.find(
    (t) =>
      !t.completed &&
      (t.name.toLowerCase().includes(recommendedTaskName.toLowerCase()) ||
        recommendedTaskName.toLowerCase().includes(t.name.toLowerCase()))
  );

  return (
    <div className="space-y-6" id="coach-panel">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-white uppercase tracking-wider">
            🧠 AI Productivity Coach
          </h3>
          <p className="text-xs text-white/40 mt-1">
            Personalized psychological guidance & focus routines
          </p>
        </div>
        <button
          id="consult-coach-btn"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-sm bg-amber-600 hover:bg-amber-500 disabled:opacity-40 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all active:scale-[0.98]"
        >
          <Sparkles className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing Workload..." : "Consult Guardian Coach"}
        </button>
      </div>

      {loading ? (
        /* Loading skeleton */
        <div className="space-y-6">
          <div className="h-28 bg-white/[0.02] border border-white/10 rounded-sm p-5 animate-pulse space-y-3">
            <div className="h-4 bg-white/10 rounded-full w-2/3" />
            <div className="h-3 bg-white/10 rounded-full w-full" />
            <div className="h-3 bg-white/10 rounded-full w-5/6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-white/[0.02] border border-white/10 rounded-sm p-5 animate-pulse space-y-2">
              <div className="h-4 bg-white/10 rounded-full w-1/2" />
              <div className="h-3 bg-white/10 rounded-full w-full mt-4" />
              <div className="h-3 bg-white/10 rounded-full w-full" />
            </div>
            <div className="h-40 bg-white/[0.02] border border-white/10 rounded-sm p-5 animate-pulse space-y-2">
              <div className="h-4 bg-white/10 rounded-full w-1/2" />
              <div className="h-3 bg-white/10 rounded-full w-full mt-4" />
              <div className="h-3 bg-white/10 rounded-full w-full" />
            </div>
          </div>
        </div>
      ) : advice ? (
        <div className="space-y-6">
          {/* Workload analysis bubble */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5 shadow-lg relative overflow-hidden"
          >
            <div className="absolute right-4 bottom-4 text-amber-500/5 pointer-events-none">
              <Shield className="w-24 h-24 stroke-[1.5]" />
            </div>
            <h4 className="font-display text-xs font-semibold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-current" /> Workload Assessment
            </h4>
            <p className="text-white/80 text-sm mt-2 leading-relaxed">
              {advice.summaryOfWorkload}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Target Recommendation Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-5 rounded-lg border border-white/10 bg-[#0a0a0a] p-5 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20">
                  Recommended Next Strike
                </span>
                <h4 className="font-display text-base font-semibold text-white tracking-tight mt-3">
                  {advice.recommendedNextTask}
                </h4>
                <p className="text-xs text-white/40 mt-2 leading-relaxed">
                  Focus is the ultimate force multiplier. The coach selected this task to break inertia and maximize timeline security.
                </p>
              </div>

              {matchingTask ? (
                <button
                  id="target-recommended-task-btn"
                  onClick={() => onSelectTaskByName(matchingTask.name)}
                  className="mt-4 flex items-center justify-center gap-2 w-full rounded-sm bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 py-2.5 text-xs font-semibold text-amber-400 transition-all active:scale-[0.98]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Locate This Task
                </button>
              ) : (
                <div className="mt-4 text-[10px] text-white/30 font-mono italic">
                  * Note: Recommended task corresponds to current workload analysis.
                </div>
              )}
            </motion.div>

            {/* Coach Tactical Advice Cards */}
            <div className="md:col-span-7 space-y-4">
              <h5 className="font-display text-xs font-semibold uppercase tracking-widest text-white/40">
                🛡️ Tactical Solutions
              </h5>
              <div className="space-y-3">
                {advice.keyAdvice.map((adv, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex items-start gap-3 p-3.5 rounded-sm bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-amber-500/10 text-xs font-bold text-amber-500">
                      {index + 1}
                    </span>
                    <p className="text-[#e0e0e0] text-xs leading-relaxed font-sans">{adv}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Cognitive Exercises */}
          <div className="space-y-4">
            <h5 className="font-display text-xs font-semibold uppercase tracking-widest text-white/40 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" /> Cognitive Energy Routines
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advice.focusExercises.map((ex, index) => {
                const parts = ex.split(":");
                const exTitle = parts[0] || "Exercise";
                const exDesc = parts.slice(1).join(":") || "";

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    className="p-4 rounded-sm bg-white/[0.02] border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h6 className="text-sm font-semibold text-white font-display tracking-tight flex items-center gap-2">
                        <span className="h-2 w-2 rounded-sm bg-amber-500" />
                        {exTitle}
                      </h6>
                      <p className="text-xs text-white/40 mt-2 leading-relaxed">
                        {exDesc || "Perform this mindfulness focus routine to maximize brain productivity and prevent burnouts."}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-sm border border-white/10 bg-white/[0.01] p-8 text-center max-w-md mx-auto">
          <HelpCircle className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h4 className="font-display text-base font-semibold text-white uppercase tracking-wider">No Advice Profile Loaded</h4>
          <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
            Tap "Consult Guardian Coach" to analyze your current tasks. The AI will evaluate deadline pressure and recommend your ideal starting path.
          </p>
        </div>
      )}
    </div>
  );
}
