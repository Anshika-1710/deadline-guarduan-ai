import React from "react";
import { motion } from "motion/react";
import { Check, Calendar, AlertTriangle, Trash2, Edit3, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onScanSingle: (id: string) => void;
  onSelectForDetails: (task: Task) => void;
  isSelected: boolean;
  scanning: boolean;
}

export default function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onScanSingle,
  onSelectForDetails,
  isSelected,
  scanning,
}: TaskCardProps) {
  // Format Date beautifully
  const deadlineDate = new Date(task.deadline);
  const isOverdue = deadlineDate.getTime() < Date.now() && !task.completed;
  
  const formattedDate = deadlineDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate remaining time
  const timeDiffMs = deadlineDate.getTime() - Date.now();
  const hoursRemaining = timeDiffMs / (1000 * 60 * 60);
  
  let timeRemainingText = "";
  if (task.completed) {
    timeRemainingText = "Completed";
  } else if (timeDiffMs < 0) {
    timeRemainingText = "Overdue";
  } else if (hoursRemaining < 1) {
    timeRemainingText = "Less than an hour left!";
  } else if (hoursRemaining < 24) {
    timeRemainingText = `${Math.round(hoursRemaining)} hours remaining`;
  } else {
    timeRemainingText = `${Math.round(hoursRemaining / 24)} days remaining`;
  }

  // Priority indicator styles
  const priorityStyles = {
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  // AI Risk colors
  const riskConfig = {
    LOW: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", stroke: "#10b981" },
    MEDIUM: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", stroke: "#f59e0b" },
    HIGH: { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", stroke: "#f97316" },
    CRITICAL: { text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30", stroke: "#ef4444" },
  };

  const currentRisk = task.riskLevel ? riskConfig[task.riskLevel] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      id={`task-card-${task.id}`}
      onClick={() => onSelectForDetails(task)}
      className={`group relative overflow-hidden rounded-2xl border p-4.5 transition-all cursor-pointer ${
        task.completed
          ? "bg-zinc-900/20 border-zinc-900/40 opacity-50"
          : isSelected
          ? "bg-[#0f0f12] border-amber-500/30 shadow-[0_4px_25px_rgba(245,158,11,0.06)]"
          : "bg-[#0c0c0e]/80 border-zinc-800/50 hover:border-zinc-700/60 hover:bg-[#121215]/80"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Checkbox and Info Block */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <button
            type="button"
            id={`toggle-complete-btn-${task.id}`}
            onClick={(e) => {
              e.stopPropagation(); // Stop click from opening details
              onToggleComplete(task.id);
            }}
            className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all ${
              task.completed
                ? "bg-amber-500 border-amber-400 text-black"
                : "border-zinc-700 hover:border-amber-500 bg-[#070708]"
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
          </button>

          <div className="flex-1 min-w-0">
            {/* Task Name */}
            <h4
              className={`font-display text-base font-semibold text-white tracking-tight leading-tight group-hover:text-amber-400 transition-colors ${
                task.completed ? "line-through text-white/30 group-hover:text-white/30" : ""
              }`}
            >
              {task.name}
            </h4>

            {/* Description (truncated) */}
            {task.description && (
              <p
                className={`text-xs mt-1 leading-relaxed line-clamp-1 ${
                  task.completed ? "text-white/20" : "text-white/50"
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mt-3 text-xs">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  task.completed
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : new Date(task.deadline).getTime() < Date.now()
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : new Date(task.deadline).toDateString() === new Date().toDateString()
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                }`}
              >
                {task.completed
                  ? "Done"
                  : new Date(task.deadline).getTime() < Date.now()
                  ? "Overdue"
                  : new Date(task.deadline).toDateString() === new Date().toDateString()
                  ? "Today"
                  : "Upcoming"}
              </span>

              {/* Category badge */}
              {task.category && (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border bg-zinc-800/50 text-zinc-300 border-zinc-700/50"
                >
                  {task.category}
                </span>
              )}

              {/* Deadline countdown */}
              <span
                className={`inline-flex items-center gap-1 font-medium font-sans ${
                  task.completed
                    ? "text-slate-600"
                    : isOverdue
                    ? "text-rose-500 font-bold"
                    : hoursRemaining <= 24
                    ? "text-amber-400 font-semibold"
                    : "text-slate-400"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{formattedDate}</span>
              </span>

              {/* Priority badge */}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  task.completed ? "bg-slate-950/40 text-slate-600 border-transparent" : priorityStyles[task.priority]
                }`}
              >
                {task.priority}
              </span>

              {/* Est Hours */}
              {task.estimatedHours !== undefined && task.estimatedHours > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-white/50 text-[10px] font-semibold border border-white/5">
                  ⏱️ {task.estimatedHours}h
                </span>
              )}

              {/* Progress badge */}
              {task.progress !== undefined && task.progress > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/20">
                  {task.progress}% done
                </span>
              )}

              {/* Notes Indicator */}
              {task.notes && task.notes.trim() !== "" && (
                <span className="inline-flex items-center gap-1 text-white/30 text-[10px] font-semibold" title="Has additional notes">
                  📝 Notes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Risk Score Ring Meter */}
        <div className="flex items-center gap-3 shrink-0">
          {!task.completed ? (
            task.riskScore !== undefined ? (
              <div 
                className="flex flex-col items-center gap-1 hover:scale-105 transition-all"
                title={`AI predicts ${task.riskScore}% risk of missing deadline. Click for advice.`}
              >
                <div className="relative w-11 h-11 flex items-center justify-center">
                  {/* SVG Circle indicator */}
                  <svg className="absolute transform -rotate-90 w-11 h-11" viewBox="0 0 44 44">
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-zinc-800"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="transition-all duration-1000 ease-out"
                      stroke={currentRisk?.stroke || "#f59e0b"}
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={2 * Math.PI * 18 * (1 - task.riskScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-[11px] font-mono font-bold leading-none ${currentRisk?.text}`}>
                      {task.riskScore}
                      <span className="text-[7px] font-light">%</span>
                    </span>
                  </div>
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-widest ${currentRisk?.text}`}>
                  {task.riskLevel}
                </span>
              </div>
            ) : (
              <button
                type="button"
                id={`scan-single-btn-${task.id}`}
                onClick={(e) => {
                  e.stopPropagation(); // Stop click from opening details
                  onScanSingle(task.id);
                }}
                disabled={scanning}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-all disabled:opacity-50"
                title="Trigger AI Risk scan on this task"
              >
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span className="text-[8px] font-extrabold uppercase tracking-wider font-mono">Scan</span>
              </button>
            )
          ) : (
            <div className="flex flex-col items-center text-zinc-600">
              <CheckCircle2 className="w-7 h-7 text-emerald-500/50" />
              <span className="text-[8px] font-extrabold uppercase tracking-wider mt-1">Shielded</span>
            </div>
          )}

          {/* Action buttons (Visible on hover on desktop, always visible on mobile) */}
          <div className="flex items-center gap-1 border-l border-zinc-800 pl-3">
            <button
              type="button"
              id={`edit-task-btn-${task.id}`}
              onClick={(e) => {
                e.stopPropagation(); // Stop click from opening details
                onEdit(task);
              }}
              className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition-all"
              title="Edit task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              id={`delete-task-btn-${task.id}`}
              onClick={(e) => {
                e.stopPropagation(); // Stop click from opening details
                onDelete(task.id);
              }}
              className="p-2 rounded-xl text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar at the bottom of the card */}
      {!task.completed && task.progress !== undefined && task.progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
