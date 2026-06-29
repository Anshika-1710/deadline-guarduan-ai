import React, { useState } from "react";
import { Task } from "../types";
import { ChevronLeft, ChevronRight, Calendar, Circle, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onNavigateToDashboard: () => void;
}

export default function CalendarView({ tasks, onSelectTask, onNavigateToDashboard }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Generate blank spots for offset
  const blankSpots = Array.from({ length: firstDayIndex }, (_, i) => null);

  const fullGridDays = [...blankSpots, ...daysArray];

  // Helper to filter tasks due on a specific day
  const getTasksDueOnDay = (day: number) => {
    return tasks.filter((task) => {
      const d = new Date(task.deadline);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-600/20 text-rose-300 border border-rose-500/30";
      case "medium":
        return "bg-amber-600/20 text-amber-300 border border-amber-500/30";
      default:
        return "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30";
    }
  };

  // Simple Busy-ness Intensity Calculator
  const getIntensityConfig = (day: number) => {
    const dayTasks = getTasksDueOnDay(day).filter(t => !t.completed);
    if (dayTasks.length === 0) {
      return {
        bg: "bg-[#0a0a0a]",
        border: "border-white/10",
        textColor: "text-white/60",
        label: "Clear",
        indicator: ""
      };
    }
    
    const totalScore = dayTasks.reduce((sum, t) => sum + (t.riskScore || 20), 0);
    const hasHighRisk = dayTasks.some(t => t.priority === "high");

    if (totalScore >= 120 || (hasHighRisk && dayTasks.length >= 2)) {
      return {
        bg: "bg-rose-950/20 border-l-2 border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
        border: "border-rose-500/30",
        textColor: "text-rose-400 font-bold",
        label: "Very Busy",
        indicator: "bg-rose-500"
      };
    } else if (dayTasks.length >= 2 || hasHighRisk || totalScore >= 60) {
      return {
        bg: "bg-amber-950/20 border-l-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
        border: "border-amber-500/30",
        textColor: "text-amber-400 font-bold",
        label: "Busy",
        indicator: "bg-amber-500"
      };
    } else {
      return {
        bg: "bg-emerald-950/20 border-l border-emerald-500/40",
        border: "border-emerald-500/20",
        textColor: "text-emerald-400",
        label: "Few Tasks",
        indicator: "bg-emerald-500"
      };
    }
  };

  return (
    <div className="space-y-6" id="calendar-view-container">
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
            📅 Your Deadline Calendar
          </h2>
          <p className="text-xs text-white/50 mt-1">
            See all your upcoming tasks and due dates in one simple, clear view.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#050505] p-1.5 rounded-sm border border-white/10 self-start md:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-sm hover:bg-white/5 text-white/50 hover:text-white transition-all"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-white px-3 select-none">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-sm hover:bg-white/5 text-white/50 hover:text-white transition-all"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* HEATMAP LEGEND INDEX */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/[0.02] p-4 rounded-lg border border-white/5">
        <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-white/40 flex items-center">
          ⚡ Calendar Guide:
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-emerald-500/5 rounded border border-emerald-500/20">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Easy Day</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-amber-500/5 rounded border border-amber-500/20">
          <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">Busy Day</span>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-rose-500/5 rounded border border-rose-500/20">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono">Very Busy Day</span>
        </div>
      </div>

      {/* Grid Calendar Layout */}
      <div className="rounded-lg border border-white/10 bg-[#0a0a0a] overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02] text-center py-3 text-xs uppercase font-mono tracking-widest font-bold text-white/40">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 grid-flow-row divide-x divide-y divide-white/10 border-l border-t border-white/10">
          {fullGridDays.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`blank-${idx}`}
                  className="min-h-[115px] bg-white/[0.01] pointer-events-none"
                />
              );
            }

            const dayTasks = getTasksDueOnDay(day);
            const intensity = getIntensityConfig(day);

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[115px] p-2 flex flex-col justify-between transition-colors group relative ${intensity.bg}`}
              >
                {/* Day number & Intensity Badge */}
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`font-mono text-xs font-semibold ${intensity.textColor}`}>
                    {day}
                  </span>
                  {dayTasks.filter(t => !t.completed).length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${intensity.indicator}`} />
                      <span className="text-[7px] font-bold uppercase font-mono tracking-widest text-white/40">
                        {dayTasks.filter(t => !t.completed).length} Pending
                      </span>
                    </div>
                  )}
                </div>

                {/* Day deadliness list */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] py-1 scrollbar-none">
                  {dayTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        onSelectTask(task);
                        onNavigateToDashboard();
                      }}
                      className={`w-full text-left p-1 rounded-sm text-[9px] font-bold uppercase tracking-wider truncate block transition-all hover:brightness-125 active:scale-[0.98] ${
                        task.completed
                          ? "bg-emerald-950/20 text-emerald-400/50 line-through border border-emerald-500/10"
                          : getPriorityColor(task.priority)
                      }`}
                      title={`[${task.category || "Task"}] ${task.name}`}
                    >
                      {task.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
