import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ListTodo,
  CheckCircle2,
  Plus,
  Zap,
  Check,
  Quote
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  Tooltip 
} from "recharts";
import { Task, ActivityLog } from "../types";
import DashboardStats from "./DashboardStats";

const MOTIVATIONAL_QUOTES = [
  { text: "Your limit is only your imagination.", author: "Unknown" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Your focus determines your reality.", author: "Qui-Gon Jinn" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
  { text: "You don't have to be perfect to be amazing.", author: "Unknown" },
  { text: "Step by step, day by day, you are building your future.", author: "AI Assistant" },
];

interface DashboardHomeProps {
  tasks: Task[];
  highRiskCount: number;
  completionPercentage: number;
  activities: ActivityLog[];
  onSelectTask: (task: Task) => void;
  onAddTaskClick: () => void;
  onToggleComplete: (id: string) => void;
}

export default function DashboardHome({
  tasks,
  highRiskCount,
  completionPercentage,
  activities,
  onSelectTask,
  onAddTaskClick,
  onToggleComplete
}: DashboardHomeProps) {
  const now = new Date();

  // Formatting current date nicely
  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Calculate Due Today tasks (pending and deadline is today)
  const todaysTasks = tasks.filter((t) => {
    if (t.completed) return false;
    const d = new Date(t.deadline);
    return d.toDateString() === now.toDateString();
  });

  // Generate a dynamic friendly plain-English AI suggestion based on tasks
  const getAiInsight = () => {
    const pending = tasks.filter(t => !t.completed);
    if (pending.length === 0) {
      return {
        text: "Your list is totally clear! Take some time to relax, or add a task when you're ready. 😊",
        badge: "All Caught Up"
      };
    }

    // Check overdue tasks
    const overdue = pending.filter(t => new Date(t.deadline).getTime() < now.getTime());
    if (overdue.length > 0) {
      return {
        text: `You have ${overdue.length} ${overdue.length === 1 ? "task" : "tasks"} past due. Let's start with a quick win and check off "${overdue[0].name}" first! ⏳`,
        badge: "Gently Overdue"
      };
    }

    // Check due today or tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueSoon = pending.filter(t => {
      const d = new Date(t.deadline);
      return d.toDateString() === tomorrow.toDateString() || d.toDateString() === now.toDateString();
    });

    if (dueSoon.length > 0) {
      const biggest = [...dueSoon].sort((a,b) => (b.estimatedHours || 0) - (a.estimatedHours || 0))[0];
      return {
        text: `You have ${dueSoon.length} ${dueSoon.length === 1 ? "task" : "tasks"} due tomorrow — start with "${biggest.name}" first! 💪`,
        badge: "Quick Tip"
      };
    }

    // Check high priority tasks
    const highPriority = pending.filter(t => t.priority === "high");
    if (highPriority.length > 0) {
      return {
        text: `Your high priority task "${highPriority[0].name}" is coming up. Spending just 15 minutes today will give you a great head start! 🚀`,
        badge: "Priority Tip"
      };
    }

    // Default friendly motivation
    const nextTask = pending[0];
    return {
      text: `Let's keep up the great momentum! How about tackling "${nextTask.name}" today? You've got this! ✨`,
      badge: "Focus Tip"
    };
  };

  const aiInsight = getAiInsight();

  // Weekly Completed vs Pending stats for the bar chart
  const getWeeklyStats = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const completedCounts = [0, 0, 0, 0, 0, 0, 0];
    const pendingCounts = [0, 0, 0, 0, 0, 0, 0];

    tasks.forEach(t => {
      const d = new Date(t.completed ? (t.completedAt || t.createdAt) : t.deadline);
      const dayIdx = d.getDay();
      if (t.completed) {
        completedCounts[dayIdx]++;
      } else {
        pendingCounts[dayIdx]++;
      }
    });

    return days.map((day, idx) => ({
      name: day,
      Completed: completedCounts[idx],
      Pending: pendingCounts[idx]
    }));
  };

  const weeklyData = getWeeklyStats();

  const [randomQuote] = React.useState(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[idx];
  });

  return (
    <div className="space-y-6" id="dashboard-home-container">
      
      {/* Top Header with Add Task button */}
      <div className="flex items-center justify-between border-b border-zinc-900/80 pb-4">
        <h2 className="font-sans text-xs font-bold text-zinc-500 uppercase tracking-widest">Core Workspace</h2>
        <button
          onClick={onAddTaskClick}
          id="add-task-btn-home"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Stats Cards (Exactly 4!) */}
      <DashboardStats 
        tasks={tasks} 
        highRiskCount={highRiskCount} 
        completionPercentage={completionPercentage} 
      />

      {/* Quote Row instead of removed sections */}
      <div className="w-full" id="quote-section">
        
        {/* Quote Card */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          className="relative rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-950/10 via-zinc-950/85 to-purple-900/5 p-6 flex flex-col justify-between overflow-hidden group shadow-xl"
          id="motivational-quote-card"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
                <Quote className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">Daily Inspiration</span>
            </div>
            <p className="text-sm md:text-base text-zinc-100 font-medium italic leading-relaxed font-sans">
              "{randomQuote.text}"
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-950/40 flex items-center justify-between relative z-10">
            <span className="text-xs font-bold text-purple-400">— {randomQuote.author}</span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Focus Mode Ready</span>
          </div>
        </motion.div>

      </div>

      {/* Bottom Grid: Due Today & This Week Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Due Today List */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs uppercase font-semibold tracking-widest text-zinc-300">Due Today</h3>
            </div>
            <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
              {todaysTasks.length} pending
            </span>
          </div>

          <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-sm text-zinc-500">No tasks due today! Want to add a task for later?</p>
                <button
                  onClick={onAddTaskClick}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  + Add a Task
                </button>
              </div>
            ) : (
              todaysTasks.map(t => (
                <div 
                  key={t.id}
                  className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/40 hover:border-purple-500/20 transition-all flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(t.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border border-zinc-700 hover:border-purple-500 bg-zinc-900 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-40" />
                    </button>
                    <div className="truncate cursor-pointer" onClick={() => onSelectTask(t)}>
                      <p className="text-xs font-semibold text-white truncate">{t.name}</p>
                      <span className="text-[9px] font-mono tracking-wider font-semibold uppercase text-zinc-500">{t.category || "General"}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSelectTask(t)}
                    className="text-[10px] text-purple-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* This Week Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <Clock className="w-4.5 h-4.5 text-purple-400" />
            <h3 className="text-xs uppercase font-semibold tracking-widest text-zinc-300">This Week</h3>
          </div>

          <div className="h-[220px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "rgba(139,92,246,0.1)", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="Completed" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#27272a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-x-4 text-[10px] text-zinc-500 font-semibold pt-2">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Completed Tasks
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-zinc-800" />
              Remaining Tasks
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
