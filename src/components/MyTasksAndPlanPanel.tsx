import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  RotateCcw, 
  Calendar,
  Check,
  Search,
  Trash2,
  Edit3,
  ListTodo,
  AlertCircle
} from "lucide-react";
import { Task } from "../types";

interface MyTasksAndPlanPanelProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onScanSingle: (id: string) => void;
  onSelectForDetails: (task: Task) => void;
  selectedTaskId?: string;
  scanningSingleId?: string | null;
  onAddTaskClick: () => void;
  onLoadDemoPreset: () => void;
}

export default function MyTasksAndPlanPanel({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddTaskClick,
  onLoadDemoPreset
}: MyTasksAndPlanPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  // Filter tasks based on search and status
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === "all" ? true : 
      filter === "pending" ? !task.completed : 
      task.completed;
    
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4 w-full" id="my-plan-panel-container">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-emerald-500" /> My Plan
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            One simple, clean list of all tasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onLoadDemoPreset}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors h-[44px]"
            title="Load standard study/work tasks to explore features"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Demo Tasks
          </button>

          <button
            onClick={onAddTaskClick}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-md shadow-emerald-600/10 h-[44px]"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c0c0e]/60 border border-zinc-900 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["all", "pending", "completed"] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all h-[36px] ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold"
                    : "text-zinc-500 border border-transparent hover:text-zinc-300"
                }`}
              >
                {tab === "completed" ? "Completed" : tab}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search your tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-10 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none transition-all h-[38px]"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-zinc-800 bg-[#0c0c0e]/20 space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-500">
              <ListTodo className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-400">No tasks in your plan</p>
              <p className="text-[11px] text-zinc-600">Create a task manually or let the AI parse one for you!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    task.completed 
                      ? "bg-zinc-950/20 border-zinc-900/50 opacity-60" 
                      : "bg-[#0c0c0e]/80 border-zinc-800/80 hover:border-zinc-700/80"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Large click target Checkbox (min 44px hit-box wrapped) */}
                    <div className="flex items-center justify-center h-[44px] w-[44px] shrink-0 -ml-2">
                      <button
                        type="button"
                        onClick={() => onToggleComplete(task.id)}
                        className={`flex h-5 w-5 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                          task.completed
                            ? "bg-emerald-500 border-emerald-400 text-black"
                            : "border-zinc-700 hover:border-emerald-500 bg-[#070708]"
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3.5px]" />}
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className={`text-sm font-semibold text-white tracking-tight leading-snug truncate ${task.completed ? "line-through text-white/30" : ""}`}>
                        {task.name}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        {/* Priority Badge */}
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>

                        {/* Deadline */}
                        <span className="flex items-center gap-1 text-zinc-400 font-medium">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {formatDate(task.deadline)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="p-2.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task.id)}
                      className="p-2.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
