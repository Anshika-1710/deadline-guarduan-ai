import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Mail, 
  Award, 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Calendar,
  Lock,
  Sparkles,
  Zap,
  Info,
  ChevronRight
} from "lucide-react";

interface UserProfileProps {
  userName: string;
  userEmail: string;
  xp: number;
  points: number;
  dailyStreak: number;
  badgesUnlocked: number;
  totalTasks: number;
  completedTasks: number;
  onUpdateName: (newName: string) => void;
  showToast: (message: string, type: "success" | "info" | "error") => void;
}

export default function UserProfile({
  userName,
  userEmail,
  xp,
  points,
  dailyStreak,
  badgesUnlocked,
  totalTasks,
  completedTasks,
  onUpdateName,
  showToast
}: UserProfileProps) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [loading, setLoading] = useState(false);

  const handleUpdateProfileName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName === userName) {
      setEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onUpdateName(newName.trim());
      showToast("Secured Codename updated successfully!", "success");
      setEditing(false);
    } catch (e) {
      console.warn(e);
      showToast("Failed to update profile name.", "error");
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = Math.floor(xp / 100) + 1;
  const xpToNextLevel = 100 - (xp % 100);

  return (
    <div className="space-y-6" id="user-profile-panel-container">
      {/* Page Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
          👤 My Profile
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Here's a look at how well you're doing!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Card: Core Credentials */}
        <div className="md:col-span-4 space-y-5">
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0e]/80 p-6 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
            
            {/* Avatar block */}
            <div className="h-20 w-20 rounded-full bg-purple-500/15 border-2 border-purple-500/30 flex items-center justify-center font-display font-black text-3xl text-purple-400 shadow-lg mt-2 relative group">
              {userName ? userName.slice(0, 2).toUpperCase() : "G"}
              <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-ping opacity-30 pointer-events-none" />
            </div>

            <div className="space-y-1.5 w-full">
              {editing ? (
                <form onSubmit={handleUpdateProfileName} className="flex gap-2 justify-center max-w-[220px] mx-auto mt-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs p-1.5 bg-black border border-white/10 rounded-lg text-white font-semibold text-center focus:outline-none focus:border-purple-500"
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-1 bg-purple-600 rounded-lg text-[10px] font-bold text-white cursor-pointer hover:bg-purple-500"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 group">
                  <h3 className="font-display text-lg font-bold text-white">{userName || "Guardian Scout"}</h3>
                  <button
                    onClick={() => { setNewName(userName); setEditing(true); }}
                    className="text-[10px] text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="text-[10px] text-zinc-500 font-mono">Your ID</p>
            </div>

            {/* Micro credentials block */}
            <div className="w-full border-t border-zinc-800/80 pt-4 space-y-2.5 text-left text-xs">
              <div className="flex items-center gap-2.5 text-zinc-400">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="truncate">{userEmail || "guest@sys.net"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-400">
                <ShieldAlert className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-amber-500 font-semibold uppercase font-mono text-[10px] tracking-wider">Account Active ✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Rank and Performance Details */}
        <div className="md:col-span-8 space-y-6">
          {/* Level Progress */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0e]/80 p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-purple-400 flex items-center gap-2">
              <Award className="w-4 h-4" /> Your Level
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">Current Level</p>
                <h4 className="font-display font-extrabold text-xl text-white">Level {currentLevel}</h4>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Progress to Next Rank</span>
                  <span className="font-mono font-bold text-white">{xp % 100} / 100 XP</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" 
                    style={{ width: `${xp % 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500">You need {xpToNextLevel} more XP to reach the next level!</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Current Streak 🔥</p>
              <div className="flex items-center gap-2.5">
                <span className="font-display font-black text-2xl text-white">{dailyStreak} Days</span>
                <span className="text-[10px] bg-amber-500/15 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">Keep completing daily targets sequentially to scale the multiplier.</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Badges Earned 🏅</p>
              <div className="flex items-center gap-2.5">
                <span className="font-display font-black text-2xl text-purple-400">{badgesUnlocked} Badges</span>
                <span className="text-[10px] bg-purple-500/15 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">VANGUARD</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal">Badges unlock based on task counts, streaks, and focus metrics.</p>
            </div>
          </div>

          {/* Historical Deflection Benchmarks */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0e]/80 p-6 space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-zinc-300">Your Achievements</h3>
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-zinc-800">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">Total Tasks</p>
                <h4 className="font-display font-black text-2xl text-white">{totalTasks}</h4>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">Tasks Completed</p>
                <h4 className="font-display font-black text-2xl text-emerald-400">{completedTasks}</h4>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">Success Rate</p>
                <h4 className="font-display font-black text-2xl text-purple-400">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </h4>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
