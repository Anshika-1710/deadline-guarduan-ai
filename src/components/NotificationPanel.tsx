import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  BellOff, 
  Clock, 
  Check, 
  Trash2, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Save, 
  AlertTriangle,
  Info
} from "lucide-react";
import { UserSettings } from "../types";

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  type: "deadline-tomorrow" | "deadline-today" | "highrisk" | "completed" | "ai-suggestion";
  timestamp: string;
  read: boolean;
}

interface NotificationPanelProps {
  notifications: SystemNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
  settings?: UserSettings;
  onSaveSettings?: (newSettings: UserSettings) => void;
}

export default function NotificationPanel({
  notifications,
  onMarkRead,
  onClearAll,
  onDeleteNotification,
  settings,
  onSaveSettings
}: NotificationPanelProps) {
  // Local state for reminder dispatch settings
  const [phone, setPhone] = useState(settings?.phoneNumber || "");
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (settings?.phoneNumber) {
      setPhone(settings.phoneNumber);
    }
  }, [settings?.phoneNumber]);

  const handleSaveSettings = () => {
    if (!onSaveSettings || !settings) return;
    setIsSaving(true);
    onSaveSettings({
      ...settings,
      phoneNumber: phone.trim()
    });
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  const getColors = (type: string, read: boolean) => {
    if (read) {
      return {
        bg: "bg-zinc-950/20 border-zinc-900/50",
        text: "text-zinc-400",
        icon: "text-zinc-600",
        iconBg: "bg-zinc-900/40 border-zinc-900/60"
      };
    }

    switch (type) {
      case "deadline-today":
        return {
          bg: "bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.03)]",
          text: "text-white",
          icon: "text-red-400",
          iconBg: "bg-red-500/10 border-red-500/20"
        };
      case "deadline-tomorrow":
        return {
          bg: "bg-amber-500/5 border-amber-500/15 shadow-[0_0_15px_rgba(245,158,11,0.03)]",
          text: "text-white",
          icon: "text-amber-400",
          iconBg: "bg-amber-500/10 border-amber-500/20"
        };
      case "highrisk":
        return {
          bg: "bg-orange-500/5 border-orange-500/15 shadow-[0_0_15px_rgba(249,115,22,0.03)]",
          text: "text-white",
          icon: "text-orange-400",
          iconBg: "bg-orange-500/10 border-orange-500/20"
        };
      case "completed":
        return {
          bg: "bg-emerald-500/5 border-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.03)]",
          text: "text-white",
          icon: "text-emerald-400",
          iconBg: "bg-emerald-500/10 border-emerald-500/20"
        };
      default:
        return {
          bg: "bg-[#128C7E]/5 border-[#128C7E]/20",
          text: "text-white",
          icon: "text-[#128C7E]",
          iconBg: "bg-[#128C7E]/10 border-[#128C7E]/20"
        };
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "deadline-today":
        return AlertTriangle;
      case "deadline-tomorrow":
        return Clock;
      case "completed":
        return Check;
      default:
        return Bell;
    }
  };

  const formatDistance = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return d.toLocaleDateString();
    } catch (e) {
      return "recently";
    }
  };

  return (
    <div className="space-y-6" id="notifications-panel-container">
      {/* Header section with purge controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
            🔔 Reminders & Notifications
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Stay on track with customizable automatic reminder alerts for high-priority tasks.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={onClearAll}
            className="px-3.5 py-1.5 rounded-xl border border-rose-500/20 text-rose-400 hover:text-white bg-rose-500/5 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Alerts Log
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Notifications list */}
        <div className="lg:col-span-8 space-y-3 order-2 lg:order-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#128C7E]" /> Alerts Log
          </h3>

          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-8 text-center"
              >
                <BellOff className="w-12 h-12 text-zinc-600 mx-auto opacity-40 mb-3" />
                <h3 className="font-display font-semibold text-zinc-400 text-sm">All Quiet</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  No notifications currently listed. Tasks requiring attention will fire alerts as scheduled.
                </p>
              </motion.div>
            ) : (
              notifications.map((notif) => {
                const colors = getColors(notif.type, notif.read);
                const Icon = getIcon(notif.type);
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className={`rounded-2xl border p-4 flex gap-4 transition-all relative group ${colors.bg}`}
                  >
                    {/* Unread indicator */}
                    {!notif.read && (
                      <span className="absolute top-4 right-12 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-[#0c0c0e] animate-pulse" />
                    )}

                    {/* Action buttons on hover */}
                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      {!notif.read && (
                        <button
                          onClick={() => onMarkRead(notif.id)}
                          className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                          title="Mark as Read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteNotification(notif.id)}
                        className="p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-rose-400 cursor-pointer"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Left Icon */}
                    <div className={`p-2.5 rounded-xl border shrink-0 w-fit h-fit ${colors.iconBg} ${colors.icon}`}>
                      <Icon className="w-4.5 h-4.5 stroke-[2]" />
                    </div>

                    {/* Message Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className={`text-xs font-bold leading-normal truncate ${colors.text}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed pr-10">
                        {notif.body}
                      </p>
                      <span className="text-[9px] font-mono tracking-wider font-semibold text-zinc-500 uppercase flex items-center gap-1.5 mt-2">
                        <Clock className="w-3 h-3" /> {formatDistance(notif.timestamp)}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Right column: Dynamic settings & simple logic guidelines */}
        <div className="lg:col-span-4 space-y-5 order-1 lg:order-2">
          {/* Dispatch rules overview card */}
          <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#128C7E] flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5" /> Reminder System Rules
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Our automated system fires reminders before deadlines based on task priority levels:
            </p>
            
            <div className="space-y-3.5 mt-2">
              <div className="p-3 rounded-xl border border-rose-500/10 bg-rose-500/[0.01] space-y-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">High Priority Tasks</span>
                <p className="text-xs text-zinc-300">
                  Sends automated alerts via <strong className="text-white font-semibold">SMS</strong> to your configured phone number before task deadlines. No mobile app alerts.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/10 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Medium & Low Tasks</span>
                <p className="text-xs text-zinc-400">
                  Triggers standard <strong className="text-zinc-300 font-semibold">mobile app notifications</strong> inside your dashboard workspace only. No SMS are sent.
                </p>
              </div>
            </div>
          </div>

          {/* Settings Section for SMS */}
          <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Smartphone className="w-4.5 h-4.5" /> SMS Reminder Configuration
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Configure your mobile phone number below to receive high-priority task SMS alerts automatically.
            </p>

            <div className="space-y-3.5">
              {/* Phone Number */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#128C7E]" /> Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., +1 (555) 019-2834"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 text-xs text-white placeholder:text-zinc-600 focus:border-[#128C7E]/50 focus:outline-none transition-all"
                />
              </div>

              {/* Save Settings button */}
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/10"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving contact..." : "Save SMS Settings"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
