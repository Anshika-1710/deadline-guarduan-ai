import React from "react";
import { GamificationState, AchievementBadge } from "../types";
import { Award, ShieldAlert, CheckCircle2, Flame, Trophy, CalendarCheck2, Compass, Hourglass, Zap } from "lucide-react";
import { motion } from "motion/react";

interface GamificationPanelProps {
  gamification: GamificationState;
}

export default function GamificationPanel({ gamification }: GamificationPanelProps) {
  // Leveling calculation (100 XP per level)
  const currentLevel = Math.floor(gamification.xp / 100) + 1;
  const xpInCurrentLevel = gamification.xp % 100;
  const xpNeededForNextLevel = 100;

  // Badge icons dictionary mapping
  const badgeIcons = (iconName: string, active: boolean) => {
    const className = `w-8 h-8 ${active ? "text-amber-500 animate-pulse" : "text-white/20"}`;
    switch (iconName) {
      case "Trophy":
        return <Trophy className={className} />;
      case "Award":
        return <Award className={className} />;
      case "Flame":
        return <Flame className={className} />;
      case "CalendarCheck2":
        return <CalendarCheck2 className={className} />;
      case "Zap":
        return <Zap className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  return (
    <div className="space-y-6" id="gamification-panel-root">
      {/* Upper overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Core Level card */}
        <div className="md:col-span-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-6 flex flex-col justify-between h-[200px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">
                Guardian Rank Status
              </span>
              <span className="text-xs font-bold font-mono text-white">
                {gamification.xp} Total XP
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <h3 className="text-4xl font-black text-white leading-none">
                Lvl {currentLevel}
              </h3>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                {currentLevel >= 5 ? "🎖️ Elite Guardian Prime" : "🛡️ Recruit Specialist"}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-white/50">Next level progression</span>
              <span className="text-amber-500">{xpInCurrentLevel} / {xpNeededForNextLevel} XP</span>
            </div>
            {/* XP progress bar */}
            <div className="h-2.5 w-full rounded-full bg-[#050505] border border-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${(xpInCurrentLevel / xpNeededForNextLevel) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Streak & Points statistics card */}
        <div className="md:col-span-6 grid grid-cols-2 gap-4 h-[200px]">
          {/* Daily Streak */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-orange-500">
              <Flame className="w-5 h-5 fill-orange-500/20 stroke-[2.5]" />
              <span className="text-[10px] uppercase font-mono tracking-widest font-bold">Daily Streak</span>
            </div>
            <div>
              <h4 className="text-4xl font-light text-white leading-none mt-2">
                {gamification.dailyStreak} <span className="text-xs text-white/40 font-medium">days</span>
              </h4>
              <p className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wide">
                {gamification.dailyStreak >= 3 ? "🔥 Streak on Fire!" : "Keep committing daily"}
              </p>
            </div>
          </div>

          {/* Productivity Points */}
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-amber-500">
              <Trophy className="w-5 h-5 text-amber-400 stroke-[2.5]" />
              <span className="text-[10px] uppercase font-mono tracking-widest font-bold">Total Points</span>
            </div>
            <div>
              <h4 className="text-4xl font-light text-white leading-none mt-2">
                {gamification.points} <span className="text-xs text-white/40 font-medium">pts</span>
              </h4>
              <p className="text-[10px] text-white/30 font-medium mt-1 uppercase tracking-wide">
                Earned via milestones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid container */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-white tracking-tight">
            🏆 Achievement Medals & Accolades
          </h3>
          <p className="text-xs text-white/50 mt-1">
            Complete high-priority targets, maintain defensive streaks, and log Pomodoros to unlock tactical rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {gamification.badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div
                key={badge.id}
                id={`badge-card-${badge.id}`}
                className={`relative overflow-hidden rounded-lg border p-4.5 flex flex-col items-center justify-center text-center transition-all ${
                  isUnlocked
                    ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                    : "border-white/5 bg-[#050505] opacity-50"
                }`}
              >
                {/* Visual Circle container for Badge Icon */}
                <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-3.5 border ${
                  isUnlocked
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                    : "bg-white/5 border-white/5 text-white/20"
                }`}>
                  {badgeIcons(badge.iconName, isUnlocked)}
                </div>

                <h4 className={`text-xs font-bold uppercase tracking-wider ${isUnlocked ? "text-white" : "text-white/40"}`}>
                  {badge.name}
                </h4>
                <p className="text-[10px] text-white/40 mt-1 leading-tight max-w-[140px]">
                  {badge.description}
                </p>

                <div className="mt-3.5 text-[9px] font-mono uppercase tracking-widest font-bold">
                  {isUnlocked ? (
                    <span className="text-emerald-400">✅ Unlocked</span>
                  ) : (
                    <span className="text-white/20">{badge.requirementText}</span>
                  )}
                </div>

                {isUnlocked && badge.unlockedAt && (
                  <span className="absolute top-2 right-2 text-[8px] font-mono text-white/20">
                    {new Date(badge.unlockedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
