import React from "react";
import { Task } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { AlertCircle, PieChart as PieIcon, BarChart3 } from "lucide-react";

interface AnalyticsPanelProps {
  tasks: Task[];
}

export default function AnalyticsPanel({ tasks }: AnalyticsPanelProps) {
  const totalCount = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  
  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;

  const overdueCount = tasks.filter(
    (t) => !t.completed && new Date(t.deadline).getTime() < Date.now()
  ).length;

  const highRiskCount = tasks.filter(
    (t) => !t.completed && ((t.riskScore && t.riskScore >= 75) || t.riskLevel === "HIGH" || t.riskLevel === "CRITICAL")
  ).length;

  // --- 1. Completion Rate (Pie Chart Data) ---
  const completionData = [
    { name: "Done", value: completedCount, color: "#10b981" },
    { name: "Pending", value: pendingCount, color: "#f59e0b" },
    { name: "Late", value: overdueCount, color: "#f43f5e" }
  ].filter((item) => item.value > 0);

  if (completionData.length === 0) {
    completionData.push({ name: "No Tasks", value: 1, color: "#334155" });
  }

  // --- 2. Category Distribution & Analytics ---
  const categoryCounts: Record<string, { total: number; completed: number }> = {};
  tasks.forEach((t) => {
    const cat = t.category || "General";
    if (!categoryCounts[cat]) {
      categoryCounts[cat] = { total: 0, completed: 0 };
    }
    categoryCounts[cat].total += 1;
    if (t.completed) {
      categoryCounts[cat].completed += 1;
    }
  });

  const categoryData = Object.entries(categoryCounts).map(([cat, counts]) => ({
    name: cat,
    "Completed Tasks": counts.completed,
    "Pending Tasks": counts.total - counts.completed
  }));

  let mostProductiveCategory = "None Yet";
  let maxCompleted = 0;
  Object.entries(categoryCounts).forEach(([cat, counts]) => {
    if (counts.completed > maxCompleted) {
      maxCompleted = counts.completed;
      mostProductiveCategory = cat;
    }
  });

  // Calculate speed of completion (average time to complete tasks)
  let speedText = "No completed tasks yet";
  const completedWithTime = completedTasks.filter(t => t.completedAt && t.createdAt);
  if (completedWithTime.length > 0) {
    const totalTimes = completedWithTime.reduce((sum, t) => {
      const elapsed = new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime();
      return sum + elapsed;
    }, 0);
    const avgHrs = Math.max(0.5, totalTimes / (1000 * 60 * 60 * completedWithTime.length));
    speedText = avgHrs < 24 ? `${Math.round(avgHrs * 10) / 10} hours` : `${Math.round((avgHrs / 24) * 10) / 10} days`;
  }

  // Simple Score Evaluation: Percent of completed tasks (0 to 100)
  const finalProductivityScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getRatingLabel = (score: number) => {
    if (score >= 90) return { label: "Super Productive", color: "text-amber-400" };
    if (score >= 75) return { label: "Highly Active", color: "text-emerald-400" };
    if (score >= 50) return { label: "On Track", color: "text-blue-400" };
    return { label: "Getting Started", color: "text-rose-400" };
  };

  const rating = getRatingLabel(finalProductivityScore);

  return (
    <div className="space-y-6" id="analytics-panel-root">
      {/* Top Header Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Productivity Score */}
        <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">
              Your Productivity Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h4 className="text-3xl font-light text-white font-mono leading-none">
                {finalProductivityScore}%
              </h4>
              <span className={`text-xs font-bold ${rating.color}`}>{rating.label}</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-amber-500" style={{ width: `${finalProductivityScore}%` }} />
          </div>
        </div>

        {/* Most Active Category */}
        <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">
            Most Active Category
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="text-2xl font-semibold text-white font-mono leading-none truncate max-w-[150px]">
              {mostProductiveCategory}
            </h4>
          </div>
          <p className="text-[9px] text-white/30 font-medium uppercase tracking-wide mt-4">
            Done: {maxCompleted} tasks
          </p>
        </div>

        {/* Completion Speed */}
        <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">
            Focus Speed
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className="text-2xl font-semibold text-white font-mono leading-none">
              {speedText}
            </h4>
          </div>
          <p className="text-[9px] text-white/30 font-medium uppercase tracking-wide mt-4">
            Average time to complete a task
          </p>
        </div>

        {/* Late Tasks */}
        <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">
            Late Tasks
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h4 className={`text-3xl font-mono leading-none font-bold ${overdueCount > 0 ? "text-rose-500" : "text-slate-400"}`}>
              {overdueCount}
            </h4>
            <span className="text-xs text-rose-400 font-bold ml-1">Past deadline</span>
          </div>
          <p className="text-[9px] text-white/30 font-medium uppercase tracking-wide mt-4">
            Important tasks left: {highRiskCount}
          </p>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="rounded-lg border border-white/5 bg-[#0a0a0a] p-12 text-center py-20">
          <AlertCircle className="w-12 h-12 text-white/15 mx-auto mb-3" />
          <h4 className="font-display text-base font-bold text-white uppercase tracking-wider">No Tasks Yet</h4>
          <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
            Add tasks on your Tasks page to see your beautiful progress charts and results here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pie distribution - Completion Balance Ratio */}
          <div className="lg:col-span-5 rounded-lg border border-white/10 bg-white/[0.02] p-5">
            <h3 className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold flex items-center gap-1.5 mb-4">
              <PieIcon className="w-4 h-4 text-amber-400" /> Completion Balance Ratio
            </h3>
            <div className="h-64 flex flex-col justify-between">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#333", color: "#e0e0e0" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold border-t border-white/5 pt-3">
                {completionData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="block font-medium uppercase tracking-widest text-white/40">{item.name}</span>
                    <span className="block font-mono text-xs font-bold" style={{ color: item.color }}>
                      {item.value} tasks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks by Category bar chart */}
          <div className="lg:col-span-7 rounded-lg border border-white/10 bg-white/[0.02] p-5">
            <h3 className="text-xs uppercase font-mono tracking-widest text-amber-500 font-bold flex items-center gap-1.5 mb-1">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Tasks by Category
            </h3>
            <p className="text-[11px] text-white/40 mb-3">
              This chart shows how many tasks are done and how many are still left in each of your categories.
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#333", color: "#e0e0e0" }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Completed Tasks" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Pending Tasks" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
