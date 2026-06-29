import React from "react";
import { motion } from "motion/react";
import { Flame, HeartHandshake, Brain, RefreshCw, Quote } from "lucide-react";
import { MotivationData, Task } from "../types";

interface MotivationWidgetProps {
  motivation: MotivationData | null;
  loading: boolean;
  style: "gentle" | "strict" | "stoic";
  onStyleChange: (style: "gentle" | "strict" | "stoic") => void;
  onRefresh: () => void;
  tasksCount: number;
}

export default function MotivationWidget({
  motivation,
  loading,
  style,
  onStyleChange,
  onRefresh,
  tasksCount,
}: MotivationWidgetProps) {
  const stylesConfig = {
    gentle: {
      label: "Gentle Coach",
      icon: HeartHandshake,
      color: "from-amber-500/[0.03] to-transparent border-white/10 text-amber-400",
      activeBg: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
      btnClass: "hover:bg-amber-500/5 text-white/50 hover:text-white",
    },
    strict: {
      label: "Motivator",
      icon: Flame,
      color: "from-orange-500/[0.03] to-transparent border-white/10 text-orange-400",
      activeBg: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
      btnClass: "hover:bg-orange-500/5 text-white/50 hover:text-white",
    },
    stoic: {
      label: "Stoic Philosopher",
      icon: Brain,
      color: "from-slate-500/[0.03] to-transparent border-white/10 text-white",
      activeBg: "bg-white/10 text-white border border-white/20",
      btnClass: "hover:bg-white/5 text-white/50 hover:text-white",
    },
  };

  const currentStyle = stylesConfig[style];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-lg border bg-gradient-to-br ${currentStyle.color} p-6 md:p-8 shadow-xl`}
      id="motivation-widget"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-current opacity-[0.02] blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-current opacity-[0.02] blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold bg-white/5 border border-white/10 uppercase tracking-widest mb-3">
            <currentStyle.icon className="w-3.5 h-3.5" />
            Advice from: {currentStyle.label}
          </span>
          <h2 className="font-display text-xl md:text-2xl font-semibold text-white tracking-tight leading-tight uppercase tracking-wider">
            Your Daily Boost 💪
          </h2>
        </div>

        {/* Style Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0a0a0a] p-1.5 rounded-sm border border-white/10 self-start md:self-center">
          {(["gentle", "strict", "stoic"] as const).map((s) => {
            const config = stylesConfig[s];
            const IconComp = config.icon;
            const isActive = style === s;
            return (
              <button
                key={s}
                id={`motivation-style-${s}`}
                onClick={() => !loading && onStyleChange(s)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all border ${
                  isActive ? config.activeBg : `text-white/40 border-transparent ${config.btnClass}`
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={`Switch style to ${config.label}`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Dynamic Speech Text */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {loading ? (
            <div className="space-y-3 py-4">
              <div className="h-4 bg-white/10 rounded-full w-full animate-pulse" />
              <div className="h-4 bg-white/10 rounded-full w-5/6 animate-pulse" />
              <div className="h-4 bg-white/10 rounded-full w-4/5 animate-pulse" />
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-white/80 text-base md:text-lg leading-relaxed font-sans font-medium"
            >
              {motivation?.message ||
                (tasksCount > 0
                  ? "Scan your tasks or trigger a personalized pep talk to lock in your morning rhythm. Time is the raw material of achievement."
                  : "Welcome to your command bridge! Add tasks below, and let's craft an unbreakable schedule to defeat procrastination.")}
            </motion.p>
          )}
        </div>

        {/* Historic Quote Block */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-sm bg-white/[0.02] border border-white/10 relative">
          <Quote className="absolute top-3 right-3 w-8 h-8 text-white/5 pointer-events-none" />
          
          {loading ? (
            <div className="space-y-2 py-2">
              <div className="h-3 bg-white/5 rounded-full w-3/4 animate-pulse" />
              <div className="h-3 bg-white/5 rounded-full w-1/2 animate-pulse" />
              <div className="h-2 bg-white/5 rounded-full w-1/4 animate-pulse mt-4" />
            </div>
          ) : (
            <>
              <p className="text-white/70 text-sm italic font-serif leading-relaxed relative z-10">
                "{motivation?.quote || "Delay is the enemy of progress, but focus is its master."}"
              </p>
              <p className="text-white/40 text-xs font-mono font-medium mt-3 text-right">
                — {motivation?.quoteAuthor || "GuardX Heuristic"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Manual Refresh Button */}
      <button
        id="refresh-motivation-btn"
        onClick={() => onRefresh()}
        disabled={loading}
        className="absolute bottom-3 right-3 p-2 rounded-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        title="Regenerate motivation speech"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
      </button>
    </motion.div>
  );
}
