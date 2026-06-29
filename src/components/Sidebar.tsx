import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home,
  ListTodo, 
  CalendarRange, 
  CalendarDays, 
  TrendingUp, 
  Timer,
  Bell, 
  SlidersHorizontal, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Info
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName: string;
  userEmail: string;
  theme: "dark" | "light" | "high-contrast";
  onThemeToggle: () => void;
  onLogout: () => void;
  highRiskCount: number;
  unreadNotificationsCount: number;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  userName,
  userEmail,
  theme,
  onThemeToggle,
  onLogout,
  highRiskCount,
  unreadNotificationsCount
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "tasks", label: "My Tasks & Plan", icon: ListTodo },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "analytics", label: "My Progress", icon: TrendingUp },
    { id: "focus", label: "Focus Timer", icon: Timer },
    { 
      id: "notifications", 
      label: "Reminders", 
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeColor: "bg-purple-500/10 text-purple-400 border border-purple-500/20"
    },
    { id: "settings", label: "Settings", icon: SlidersHorizontal }
  ];

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? "78px" : "260px" }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        className="hidden lg:flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-white/5 bg-[#070512] shadow-2xl relative z-40 p-4"
        id="desktop-sidebar-container"
      >
        {/* Collapse button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 h-6.5 w-6.5 rounded-full border border-white/10 bg-[#070512] hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer shadow-lg z-50"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        <div className="space-y-7">
          {/* Logo and title */}
          <div className={`flex items-center gap-2.5 overflow-hidden ${isCollapsed ? 'justify-center px-1' : 'px-2'}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Zap className="w-4.5 h-4.5 text-purple-400" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <span className="font-display font-extrabold text-white text-base tracking-tight">Guardian<span className="text-purple-400">AI</span></span>
                <p className="text-[9px] font-mono tracking-widest text-zinc-600 uppercase">SYS BLOCK v2</p>
              </motion.div>
            )}
          </div>

          {/* User profile segment */}
          <div className={`bg-white/[0.01] border border-white/5 rounded-xl flex items-center gap-3 overflow-hidden ${isCollapsed ? 'p-1.5 justify-center' : 'p-3'}`}>
            <div className="h-8.5 w-8.5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-display font-bold text-purple-300 shrink-0 shadow-inner">
              {userName ? userName.slice(0, 2).toUpperCase() : "G"}
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-w-0"
              >
                <h4 className="text-xs font-bold text-white truncate">{userName || "Guardian Scout"}</h4>
                <p className="text-[10px] text-zinc-500 truncate">{userEmail || "guest@sys.net"}</p>
              </motion.div>
            )}
          </div>

          {/* Main navigation list */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isCollapsed ? 'p-3 justify-center' : 'px-3 py-2.5'
                  } ${
                    isActive
                      ? "bg-purple-600/15 border-purple-500/20 text-purple-300 font-bold shadow-lg"
                      : "border-transparent text-zinc-400 hover:bg-white/[0.02] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-zinc-400'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#070512]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="space-y-2 border-t border-white/5 pt-4">
          {/* Theme switcher */}
          <button
            onClick={onThemeToggle}
            title="Switch Environment Theme"
            className={`w-full flex items-center rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.02] border border-transparent transition-all cursor-pointer ${
              isCollapsed ? 'p-3 justify-center' : 'px-3 py-2'
            }`}
          >
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-purple-400 shrink-0" />
              )}
              {!isCollapsed && <span>Theme: {theme.toUpperCase()}</span>}
            </div>
          </button>

          {/* Secure Logout */}
          <button
            onClick={onLogout}
            title="Disconnect Terminal"
            className={`w-full flex items-center rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent transition-all cursor-pointer ${
              isCollapsed ? 'p-3 justify-center' : 'px-3 py-2'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
