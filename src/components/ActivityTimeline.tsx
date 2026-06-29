import React from "react";
import { motion } from "motion/react";
import { 
  Plus, 
  CheckCircle, 
  Calendar, 
  Trash2, 
  Activity, 
  Clock, 
  Sparkles,
  AlertOctagon
} from "lucide-react";

export interface ActivityLog {
  id: string;
  type: "create" | "complete" | "update" | "delete" | "system" | "highrisk";
  message: string;
  timestamp: string;
}

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "create":
        return { icon: Plus, bg: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
      case "complete":
        return { icon: CheckCircle, bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case "update":
        return { icon: Calendar, bg: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "delete":
        return { icon: Trash2, bg: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
      case "highrisk":
        return { icon: AlertOctagon, bg: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
      default:
        return { icon: Sparkles, bg: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "00:00";
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0e]/80 p-5 space-y-4 shadow-xl" id="activity-timeline-panel">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
        <Activity className="w-4.5 h-4.5 text-purple-400" />
        <h3 className="text-xs uppercase font-bold tracking-widest text-zinc-300">Activity Timeline</h3>
      </div>

      <div className="relative pl-4 space-y-4 border-l border-zinc-800/80 mt-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-none">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto opacity-50 mb-2" />
            <p className="text-xs text-zinc-500">Nothing here yet!</p>
          </div>
        ) : (
          activities.map((act) => {
            const config = getIcon(act.type);
            const Icon = config.icon;
            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative flex items-start gap-3.5 group"
              >
                {/* Visual marker dot */}
                <div className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-zinc-700 ring-4 ring-[#050505] group-hover:bg-purple-500 transition-colors" />

                {/* Left side: Micro icon */}
                <div className={`p-1.5 rounded-lg border ${config.bg} shrink-0 shadow-sm`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs text-zinc-300 leading-normal">{act.message}</p>
                  <span className="text-[9px] font-mono tracking-wider font-semibold text-zinc-500 uppercase flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {formatTime(act.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
