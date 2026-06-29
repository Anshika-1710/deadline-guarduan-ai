import React from "react";
import { motion } from "motion/react";
import { 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  Flame,
  Gauge
} from "lucide-react";
import { Task } from "../types";

interface DashboardStatsProps {
  tasks: Task[];
  highRiskCount: number;
  completionPercentage: number;
}

export default function DashboardStats({ tasks, highRiskCount, completionPercentage }: DashboardStatsProps) {
  const now = new Date();

  // Calculate stats
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.filter((t) => !t.completed).length;

  const todayDeadlines = tasks.filter((t) => {
    if (t.completed) return false;
    const d = new Date(t.deadline);
    return d.toDateString() === now.toDateString();
  }).length;

  const overdue = tasks.filter((t) => {
    if (t.completed) return false;
    const d = new Date(t.deadline);
    return d.getTime() < now.getTime() && d.toDateString() !== now.toDateString();
  }).length;

  // Custom premium stats array
  const cards = [
    {
      title: "Total Tasks",
      value: total,
      desc: "All your tasks in one place",
      icon: ListTodo,
      gradient: "from-blue-600/15 via-blue-900/5 to-transparent",
      borderColor: "border-blue-500/20",
      iconColor: "text-blue-400",
      progress: 100,
      progressColor: "bg-blue-500"
    },
    {
      title: "Completed",
      value: completed,
      desc: "Tasks you have finished successfully",
      icon: CheckCircle2,
      gradient: "from-emerald-600/15 via-emerald-900/5 to-transparent",
      borderColor: "border-emerald-500/20",
      iconColor: "text-emerald-400",
      progress: total > 0 ? (completed / total) * 100 : 0,
      progressColor: "bg-emerald-500"
    },
    {
      title: "Remaining",
      value: pending,
      desc: "Tasks left to complete",
      icon: Clock,
      gradient: "from-amber-600/15 via-amber-900/5 to-transparent",
      borderColor: "border-amber-500/20",
      iconColor: "text-amber-400",
      progress: total > 0 ? (pending / total) * 100 : 0,
      progressColor: "bg-amber-500"
    },
    {
      title: "Success Rate",
      value: `${completionPercentage}%`,
      desc: "Your overall completion percentage",
      icon: Gauge,
      gradient: "from-purple-600/15 via-purple-900/5 to-transparent",
      borderColor: "border-purple-500/20",
      iconColor: "text-purple-400",
      progress: completionPercentage,
      progressColor: "bg-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4" id="dashboard-stats-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className={`rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.gradient} p-3.5 md:p-4.5 flex flex-col justify-between shadow-lg relative overflow-hidden group`}
          >
            {/* Soft decorative background pulse */}
            <div className="absolute top-0 right-0 h-16 w-16 md:h-24 md:w-24 bg-white/[0.01] rounded-full blur-2xl pointer-events-none group-hover:bg-white/[0.03] transition-all duration-300" />

            <div className="flex items-start justify-between gap-1.5">
              <div className="space-y-0.5 min-w-0">
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-zinc-400/80 truncate">{card.title}</p>
                <h3 className="font-display font-black text-lg md:text-2xl text-white tracking-tight mt-0.5">{card.value}</h3>
              </div>
              <div className={`p-1.5 md:p-2.5 rounded-xl bg-black/45 border ${card.borderColor} ${card.iconColor} shadow-md shrink-0`}>
                <Icon className="w-4 h-4 md:w-5 md:h-5 stroke-[2]" />
              </div>
            </div>

            <div className="mt-3 md:mt-4 space-y-1.5">
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, card.progress))}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${card.progressColor}`} 
                />
              </div>
              <p className="text-[9px] md:text-[10px] text-zinc-500 font-medium truncate">{card.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
