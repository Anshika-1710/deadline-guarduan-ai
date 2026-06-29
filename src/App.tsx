import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Plus,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  CalendarDays,
  Menu,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Info,
  CalendarRange,
  Zap,
  CheckCircle2,
  AlertOctagon,
  Brain,
  ListTodo,
  LogOut,
  User,
  Bell,
  Home,
  Timer,
  MoreVertical,
  Sun,
  Moon,
  X
} from "lucide-react";
import { Task, RiskAnalysis, ProductivityCoachAdvice, DailyPlannerData, MotivationData, UserSettings, GamificationState, AchievementBadge, ActivityLog } from "./types";
import MotivationWidget from "./components/MotivationWidget";
import TaskForm from "./components/TaskForm";
import TaskCard from "./components/TaskCard";
import CoachPanel from "./components/CoachPanel";
import AnalyticsPanel from "./components/AnalyticsPanel";
import CalendarView from "./components/CalendarView";
import FocusModePanel from "./components/FocusModePanel";
import GamificationPanel from "./components/GamificationPanel";
import SettingsPanel from "./components/SettingsPanel";

// Premium modular components
import AuthScreen from "./components/AuthScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import Sidebar from "./components/Sidebar";
import DashboardHome from "./components/DashboardHome";
import NotificationPanel, { SystemNotification } from "./components/NotificationPanel";
import UserProfile from "./components/UserProfile";
import MyTasksAndPlanPanel from "./components/MyTasksAndPlanPanel";
import UniversalSmartInput from "./components/UniversalSmartInput";
import AnimeCharacter from "./components/AnimeCharacter";

// Firebase
import { db, auth } from "./lib/firebase";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDoc,
  updateDoc
} from "firebase/firestore";

const localStorage = {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied:", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage delete denied:", e);
    }
  }
};

export default function App() {
  // --- Auth & Onboarding States ---
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem("onboarding_complete") === "true";
  });

  // --- Core States ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [motivationStyle, setMotivationStyle] = useState<"gentle" | "strict" | "stoic">("gentle");

  // Custom Settings
  const [settings, setSettings] = useState<UserSettings>({
    userName: "Guardian Scout",
    studyHoursPerDay: 4,
    preferredWorkingTime: "morning",
    theme: "dark",
    fontSize: 16,
    customGeminiKey: ""
  });

  // Notifications & Activities
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Gamification & Badges State
  const defaultBadges: AchievementBadge[] = [
    { id: "badge-first", name: "Initiation Safe", description: "Log your first deadline guardian target", iconName: "Award", requirementText: "Log 1 task" },
    { id: "badge-three", name: "Triple Guard", description: "Archive 3 completed targets successfully", iconName: "Trophy", requirementText: "Complete 3 tasks" },
    { id: "badge-streak-3", name: "Vanguard Fire", description: "Keep a 3-day active planning streak", iconName: "Flame", requirementText: "3-day streak" },
    { id: "badge-pomodoro", name: "Deep Flow Initiate", description: "Complete a full 25-minute Pomodoro sprint", iconName: "Zap", requirementText: "Complete 1 focus block" },
    { id: "badge-high-priority", name: "Apex Deflector", description: "Slay a High Priority task before deadline", iconName: "CalendarCheck2", requirementText: "1 high-priority task" },
  ];

  const [gamification, setGamification] = useState<GamificationState>({
    xp: 0,
    points: 0,
    dailyStreak: 1,
    weeklyStreak: 0,
    badges: defaultBadges,
  });

  // Toast indicator
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "info") => {
    let friendlyMessage = message;
    if (type === "error") {
      friendlyMessage = "Oops! Something went wrong, try again 😊";
    } else if (type === "success") {
      if (message.toLowerCase().includes("saved") || message.toLowerCase().includes("created") || message.toLowerCase().includes("updated") || message.toLowerCase().includes("success")) {
        friendlyMessage = "Great job! Task saved successfully! 🎉";
      } else {
        friendlyMessage = `Great job! ${message} 🎉`;
      }
    }
    setToast({ message: friendlyMessage, type });
  };

  const seedDefaultTasks = async (userId: string): Promise<Task[]> => {
    const defaults: Task[] = [
      {
        id: "task-welcome-1",
        name: "Explore the Guardian Threat Console",
        description: "Get acclimated with the timeline shield, predictive risk score alerts, and gamification ranks.",
        deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        priority: "medium",
        completed: false,
        category: "Onboarding",
        estimatedHours: 1,
        progress: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: "task-welcome-2",
        name: "Initialize Predictive AI Shield",
        description: "Configure your custom Gemini API key or proceed to scan tasks with secure cloud intelligence.",
        deadline: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
        priority: "high",
        completed: false,
        category: "Setup",
        estimatedHours: 2,
        progress: 0,
        createdAt: new Date().toISOString()
      }
    ];

    for (const t of defaults) {
      try {
        await setDoc(doc(db, "users", userId, "tasks", t.id), t);
      } catch (e) {
        console.warn("Failed seeding task:", t.id, e);
      }
    }
    return defaults;
  };

  const triggerNotification = async (id: string, type: "deadline-tomorrow" | "deadline-today" | "highrisk" | "completed" | "ai-suggestion", title: string, body: string) => {
    if (!user) return;
    const newNotif = {
      id,
      type,
      title,
      body,
      timestamp: new Date().toISOString(),
      read: false
    };

    if (user.isAnonymousGuest) {
      setNotifications(prev => {
        if (prev.some(n => n.id === id)) return prev;
        const updated = [newNotif, ...prev];
        localStorage.setItem("deadline_notifications", JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const notifRef = doc(db, "users", user.uid, "notifications", id);
    const snap = await getDoc(notifRef).catch(() => null);
    if (!snap || !snap.exists()) {
      await setDoc(notifRef, newNotif).catch(err => console.warn("Failed saving notification:", err));
    }
  };

  const checkDeadlineAlerts = async (taskList: Task[]) => {
    if (!user) return;
    const now = new Date();
    for (const t of taskList) {
      if (t.completed) continue;
      const deadlineDate = new Date(t.deadline);
      const diffMs = deadlineDate.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 0) {
        await triggerNotification(
          `alert-overdue-${t.id}`,
          "highrisk",
          "CRITICAL ACCIDENT",
          `Task "${t.name}" is OVERDUE!`
        );
      } else if (diffHours < 24) {
        await triggerNotification(
          `alert-urgent-${t.id}`,
          "highrisk",
          "URGENT IMMINENT THREAT",
          `Task "${t.name}" deadline is under 24 hours!`
        );
      }
    }
  };

  const logActivity = async (type: "create" | "complete" | "update" | "delete" | "system" | "highrisk", message: string) => {
    if (!user || user.isAnonymousGuest) {
      const logItem: ActivityLog = {
        id: `act-${Date.now()}`,
        type,
        message,
        timestamp: new Date().toISOString()
      };
      setActivities(prev => {
        const updated = [logItem, ...prev].slice(0, 50);
        localStorage.setItem("deadline_activities", JSON.stringify(updated));
        return updated;
      });
      return;
    }
    const logId = `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const logItem: ActivityLog = {
      id: logId,
      type,
      message,
      timestamp: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, "users", user.uid, "activities", logId), logItem);
    } catch (e) {
      console.warn("Error logging activity to Firestore:", e);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem("deadline_settings", JSON.stringify(newSettings));
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "settings", "doc"), newSettings);
      } catch (e) {
        console.warn("Firestore settings sync failed:", e);
      }
    }
    checkHealthWithKey(newSettings.customGeminiKey || "");
    showToast("Profile & API settings secure", "success");
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  
  // Modals & Filters
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");
  const [sortBy, setSortBy] = useState<"default" | "risk">("default");

  // AI Loaders
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [isAiAvailable, setIsAiAvailable] = useState(false);
  const [scanningAll, setScanningAll] = useState(false);
  const [scanningSingleId, setScanningSingleId] = useState<string | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [loadingPlanner, setLoadingPlanner] = useState(false);
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  // Cached AI Content
  const [motivation, setMotivation] = useState<MotivationData | null>(null);
  const [coachAdvice, setCoachAdvice] = useState<ProductivityCoachAdvice | null>(null);
  const [dailyPlanner, setDailyPlanner] = useState<DailyPlannerData | null>(null);

  // --- Onboarding Initial Data & Firebase Observers ---
  useEffect(() => {
    // Check Health Endpoint & AI status
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setIsAiAvailable(data.ai_available);
        setLoadingHealth(false);
      })
      .catch((err) => {
        console.warn("Health check status (offline/offline fallback):", err);
        setLoadingHealth(false);
      });

    let activeUnsubscribes: (() => void)[] = [];

    const setupUserListeners = async (currentUser: any) => {
      // Clear previous unsubscribes if any
      activeUnsubscribes.forEach(unsub => unsub());
      activeUnsubscribes = [];

      const normalizedUser = {
        ...currentUser,
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Guardian Scout"
      };
      setUser(normalizedUser);
      setAuthLoading(false);

      if (normalizedUser.uid === "guest-scout" || normalizedUser.isAnonymousGuest) {
        // Guest mode setup
        // 1. Settings
        const savedSettings = localStorage.getItem("deadline_settings");
        if (savedSettings) {
          try {
            setSettings(JSON.parse(savedSettings));
          } catch (e) {
            console.warn(e);
          }
        }
        
        // 2. Gamification
        const savedGamification = localStorage.getItem("deadline_gamification");
        if (savedGamification) {
          try {
            setGamification(JSON.parse(savedGamification));
          } catch (e) {
            console.warn(e);
          }
        }

        // 3. Tasks
        const savedTasks = localStorage.getItem("deadline_tasks");
        if (savedTasks) {
          try {
            const parsed = JSON.parse(savedTasks);
            setTasks(parsed);
            if (parsed.length > 0) {
              const pending = parsed.find((t: any) => !t.completed);
              setSelectedTask(pending || parsed[0]);
            }
          } catch (e) {
            console.warn(e);
          }
        } else {
          const defaults: Task[] = [
            {
              id: "task-welcome-1",
              name: "Explore the Guardian Threat Console",
              description: "Get acclimated with the timeline shield, predictive risk score alerts, and gamification ranks.",
              deadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
              priority: "medium",
              completed: false,
              category: "Onboarding",
              estimatedHours: 1,
              progress: 0,
              createdAt: new Date().toISOString()
            },
            {
              id: "task-welcome-2",
              name: "Initialize Predictive AI Shield",
              description: "Configure your custom Gemini API key or proceed to scan tasks with secure cloud intelligence.",
              deadline: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
              priority: "high",
              completed: false,
              category: "Setup",
              estimatedHours: 2,
              progress: 0,
              createdAt: new Date().toISOString()
            }
          ];
          setTasks(defaults);
          setSelectedTask(defaults[0]);
          localStorage.setItem("deadline_tasks", JSON.stringify(defaults));
        }

        // 4. Notifications
        const savedNotifs = localStorage.getItem("deadline_notifications");
        if (savedNotifs) {
          try {
            setNotifications(JSON.parse(savedNotifs));
          } catch (e) {
            console.warn(e);
          }
        } else {
          const initialNotifs: SystemNotification[] = [
            {
              id: "notif-welcome-1",
              title: "Console Online",
              body: "Secure Threat Console has been successfully established.",
              type: "completed" as const,
              timestamp: new Date().toISOString(),
              read: false
            }
          ];
          setNotifications(initialNotifs);
          localStorage.setItem("deadline_notifications", JSON.stringify(initialNotifs));
        }

        // 5. Activities
        const savedActs = localStorage.getItem("deadline_activities");
        if (savedActs) {
          try {
            setActivities(JSON.parse(savedActs));
          } catch (e) {
            console.warn(e);
          }
        }

        // 6. Planner
        const savedPlanner = localStorage.getItem("deadline_planner");
        if (savedPlanner) {
          try {
            setDailyPlanner(JSON.parse(savedPlanner));
          } catch (e) {
            console.warn(e);
          }
        }

        // 7. Motivation
        const savedMotivation = localStorage.getItem("deadline_motivation");
        if (savedMotivation) {
          try {
            setMotivation(JSON.parse(savedMotivation));
          } catch (e) {
            console.warn(e);
          }
        }

        return;
      }

      // Update settings userName with display name if available
      if (normalizedUser.displayName) {
        setSettings(prev => ({ ...prev, userName: normalizedUser.displayName }));
      }

      // 1. Settings Realtime Listener
      const settingsRef = doc(db, "users", currentUser.uid, "settings", "doc");
      const settingsSnap = await getDoc(settingsRef).catch(() => null);
      if (settingsSnap && !settingsSnap.exists()) {
        const initSettings: UserSettings = {
          userName: normalizedUser.displayName,
          studyHoursPerDay: 4,
          preferredWorkingTime: "morning",
          theme: "dark" as const,
          fontSize: 16,
          customGeminiKey: ""
        };
        await setDoc(settingsRef, initSettings).catch(err => console.warn(err));
        setSettings(initSettings);
      }

      const unsubSettings = onSnapshot(settingsRef, (snap) => {
        if (snap.exists()) {
          setSettings(snap.data() as UserSettings);
        }
      }, err => console.warn(err));
      activeUnsubscribes.push(unsubSettings);

      // 2. Gamification Realtime Listener
      const gamificationRef = doc(db, "users", currentUser.uid, "gamification", "doc");
      const gamificationSnap = await getDoc(gamificationRef).catch(() => null);
      if (gamificationSnap && !gamificationSnap.exists()) {
        await setDoc(gamificationRef, gamification).catch(err => console.warn(err));
      }

      const unsubGamification = onSnapshot(gamificationRef, (snap) => {
        if (snap.exists()) {
          setGamification(snap.data() as GamificationState);
        }
      }, err => console.warn(err));
      activeUnsubscribes.push(unsubGamification);

      // 3. Tasks Realtime Listener
      const tasksCol = collection(db, "users", currentUser.uid, "tasks");
      const unsubTasks = onSnapshot(tasksCol, async (snap) => {
        const list: Task[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as Task);
        });
        
        setTasks(list);
        if (list.length > 0 && !selectedTask) {
          const pending = list.find((t) => !t.completed);
          setSelectedTask(pending || list[0]);
        } else if (list.length === 0) {
          setSelectedTask(null);
        }
        checkDeadlineAlerts(list);
      }, err => console.warn(err));
      activeUnsubscribes.push(unsubTasks);

      // 4. Notifications Realtime Listener
      const notifCol = collection(db, "users", currentUser.uid, "notifications");
      const unsubNotifs = onSnapshot(notifCol, (snap) => {
        const list: SystemNotification[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as SystemNotification);
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(list);
      }, err => console.warn(err));
      activeUnsubscribes.push(unsubNotifs);

      // 5. Activities Realtime Listener
      const actCol = collection(db, "users", currentUser.uid, "activities");
      const unsubActs = onSnapshot(actCol, (snap) => {
        const list: ActivityLog[] = [];
        snap.forEach((doc) => {
          list.push(doc.data() as ActivityLog);
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(list);
      }, err => console.warn(err));
      activeUnsubscribes.push(unsubActs);

      // 6. Daily Planner Realtime Listener
      const plannerRef = doc(db, "users", currentUser.uid, "planner", "doc");
      const unsubPlanner = onSnapshot(plannerRef, (snap) => {
        if (snap.exists()) {
          setDailyPlanner(snap.data() as DailyPlannerData);
        }
      }, err => console.warn(err));
      activeUnsubscribes.push(unsubPlanner);

      // 7. Motivation Realtime Listener
      const motivationRef = doc(db, "users", currentUser.uid, "motivation", "doc");
      const unsubMotivation = onSnapshot(motivationRef, (snap) => {
        if (snap.exists()) {
          setMotivation(snap.data() as MotivationData);
        }
      }, err => console.warn(err));
      activeUnsubscribes.push(unsubMotivation);
    };

    // Listen to Firebase Authentication state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setupUserListeners(currentUser);
      } else {
        activeUnsubscribes.forEach(unsub => unsub());
        activeUnsubscribes = [];
        setUser(null);
        setAuthLoading(false);
        const savedTasks = localStorage.getItem("deadline_tasks");
        if (savedTasks) {
          try {
            const parsed = JSON.parse(savedTasks);
            setTasks(parsed);
          } catch (e) {
            console.warn(e);
          }
        }
      }
    });

    return () => {
      unsubscribeAuth();
      activeUnsubscribes.forEach(unsub => unsub());
    };
  }, []);

  // Sync cached content
  useEffect(() => {
    const cachedMotivation = localStorage.getItem("cached_motivation");
    if (cachedMotivation && !user) setMotivation(JSON.parse(cachedMotivation));
    
    const cachedAdvice = localStorage.getItem("cached_advice");
    if (cachedAdvice && !user) setCoachAdvice(JSON.parse(cachedAdvice));

    const cachedPlanner = localStorage.getItem("cached_planner");
    if (cachedPlanner && !user) setDailyPlanner(JSON.parse(cachedPlanner));

    const savedStyle = localStorage.getItem("motivation_style");
    if (savedStyle) setMotivationStyle(savedStyle as any);
  }, [user]);

  // Apply Theme & Font styles
  useEffect(() => {
    const root = document.documentElement;
    
    // Theme
    root.classList.remove("theme-light", "theme-dark", "theme-high-contrast");
    if (settings.theme === "light") {
      root.classList.add("theme-light");
    } else if (settings.theme === "high-contrast") {
      root.classList.add("theme-high-contrast");
    } else {
      root.classList.add("theme-dark");
    }
    
    // Font Size
    root.style.fontSize = `${settings.fontSize}px`;
    
    // Reduced Motion
    if (settings.reducedMotion) {
      root.classList.add("reduced-motion");
    } else {
      root.classList.remove("reduced-motion");
    }
  }, [settings.theme, settings.fontSize, settings.reducedMotion]);

  // --- Gamification Helpers ---
  const checkAndUnlockBadges = (state: GamificationState, currentTasks: Task[]) => {
    let changed = false;
    const nowStr = new Date().toISOString();
    const unlockedBadges = state.badges.map(badge => {
      if (badge.unlockedAt) return badge; // Already unlocked

      let shouldUnlock = false;
      if (badge.id === "badge-first" && currentTasks.length >= 1) {
        shouldUnlock = true;
      } else if (badge.id === "badge-three" && currentTasks.filter(t => t.completed).length >= 3) {
        shouldUnlock = true;
      } else if (badge.id === "badge-streak-3" && state.dailyStreak >= 3) {
        shouldUnlock = true;
      } else if (badge.id === "badge-high-priority" && currentTasks.some(t => t.completed && t.priority === "high")) {
        shouldUnlock = true;
      }

      if (shouldUnlock) {
        changed = true;
        showToast(`🏆 Medal Unlocked: ${badge.name}!`, "success");
        return { ...badge, unlockedAt: nowStr };
      }
      return badge;
    });

    if (changed) {
      return { ...state, badges: unlockedBadges };
    }
    return state;
  };

  const awardXP = (amount: number, reason: string) => {
    setGamification((prev) => {
      const updatedXp = prev.xp + amount;
      const updatedPoints = prev.points + amount;

      // Level check
      const oldLevel = Math.floor(prev.xp / 100) + 1;
      const newLevel = Math.floor(updatedXp / 100) + 1;

      if (newLevel > oldLevel) {
        showToast(`🎉 Level Up! You attained Rank Level ${newLevel}!`, "success");
      } else {
        showToast(`+${amount} XP: ${reason}`, "info");
      }

      let updatedState = {
        ...prev,
        xp: updatedXp,
        points: updatedPoints,
      };

      // Handle Pomodoro badge explicitly if triggered from timer
      if (reason.toLowerCase().includes("pomodoro")) {
        updatedState.badges = updatedState.badges.map(b => {
          if (b.id === "badge-pomodoro" && !b.unlockedAt) {
            showToast(`🏆 Medal Unlocked: Deep Flow Initiate!`, "success");
            return { ...b, unlockedAt: new Date().toISOString() };
          }
          return b;
        });
      }

      updatedState = checkAndUnlockBadges(updatedState, tasks);
      localStorage.setItem("deadline_gamification", JSON.stringify(updatedState));
      return updatedState;
    });
  };

  // Save tasks helper
  const saveTasksToStateAndStorage = async (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("deadline_tasks", JSON.stringify(newTasks));
    if (user) {
      try {
        // Find deleted tasks
        const deletedIds = tasks.filter(t => !newTasks.some(nt => nt.id === t.id)).map(t => t.id);
        for (const id of deletedIds) {
          await deleteDoc(doc(db, "users", user.uid, "tasks", id));
        }
        // Save new/edited tasks
        for (const t of newTasks) {
          await setDoc(doc(db, "users", user.uid, "tasks", t.id), t);
        }
      } catch (e) {
        console.warn("Firestore tasks sync failed:", e);
      }
    }
  };

  // --- Header & Connectivity Helper ---
  const getHeaders = () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (settings.customGeminiKey) {
      headers["x-custom-api-key"] = settings.customGeminiKey;
    }
    return headers;
  };

  const checkHealthWithKey = (key: string) => {
    const headers: Record<string, string> = {};
    if (key) {
      headers["x-custom-api-key"] = key;
    }
    fetch("/api/health", { headers })
      .then((res) => res.json())
      .then((data) => {
        setIsAiAvailable(data.ai_available);
      })
      .catch((err) => {
        console.warn("Health check with key warning:", err);
      });
  };

  // --- AI Actions triggers ---

  // Trigger Motivation speech
  const fetchMotivationSpeech = (targetStyle?: string | any) => {
    setLoadingMotivation(true);
    const activeStyle = typeof targetStyle === "string" ? targetStyle : motivationStyle;
    fetch("/api/gemini/motivation", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ tasks: tasks.filter((t) => !t.completed), style: activeStyle }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.motivation) {
          setMotivation(data.motivation);
          localStorage.setItem("cached_motivation", JSON.stringify(data.motivation));
        }
        setLoadingMotivation(false);
      })
      .catch((err) => {
        console.warn("Motivation API completed with fallback:", err);
        setLoadingMotivation(false);
      });
  };

  // Fetch motivation speech if tasks count or style changes
  useEffect(() => {
    if (tasks.length > 0) {
      // Lazy generate on load if cache empty
      const cached = localStorage.getItem("cached_motivation");
      if (!cached) {
        fetchMotivationSpeech();
      }
    }
  }, [tasks.length]);

  const handleStyleChange = (newStyle: "gentle" | "strict" | "stoic") => {
    setMotivationStyle(newStyle);
    localStorage.setItem("motivation_style", newStyle);
    fetchMotivationSpeech(newStyle);
  };

  // Trigger Overall Workload Risk Scan
  const handleDeepScanWorkload = () => {
    if (tasks.length === 0) return;
    setScanningAll(true);
    
    const pendingTasks = tasks.filter((t) => !t.completed);
    if (pendingTasks.length === 0) {
      setScanningAll(false);
      return;
    }

    fetch("/api/gemini/analyze-risks", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ tasks: pendingTasks, currentTime: new Date().toISOString() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.analysis && Array.isArray(data.analysis)) {
          const analysisList: RiskAnalysis[] = data.analysis;
          
          // Map scores back to task array
          const updated = tasks.map((task) => {
            const match = analysisList.find((a: any) => a.taskId === task.id);
            if (match) {
              return {
                ...task,
                riskScore: match.riskScore,
                riskLevel: match.riskLevel,
                riskFactors: match.riskFactors,
                mitigationSteps: match.mitigationSteps,
                probabilityOfMissing: match.probabilityOfMissing,
                workloadEstimation: match.workloadEstimation,
                recommendedPriority: match.recommendedPriority,
                subtasks: match.subtasks,
                milestones: match.milestones,
                roadmap: match.roadmap,
                suggestedDailyTarget: match.suggestedDailyTarget,
                rescueModeActive: match.rescueModeActive,
                rescuePlan: match.rescuePlan,
              };
            }
            return task;
          });

          saveTasksToStateAndStorage(updated);
          awardXP(30, "Conducted dynamic multi-variable AI threat analysis");
          
          // Update selected task in sync
          if (selectedTask) {
            const updatedSelected = updated.find((t) => t.id === selectedTask.id);
            if (updatedSelected) setSelectedTask(updatedSelected);
          }
        }
        setScanningAll(false);
      })
      .catch((err) => {
        console.warn("Task scan completed with fallback:", err);
        setScanningAll(false);
      });
  };

  // Trigger Single Task Scan (Lazily triggered)
  const handleScanSingleTask = (taskId: string) => {
    setScanningSingleId(taskId);
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    fetch("/api/gemini/analyze-risks", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ tasks: [target], currentTime: new Date().toISOString() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.analysis && Array.isArray(data.analysis) && data.analysis.length > 0) {
          const resObj = data.analysis[0];
          
          const updated = tasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                riskScore: resObj.riskScore,
                riskLevel: resObj.riskLevel,
                riskFactors: resObj.riskFactors,
                mitigationSteps: resObj.mitigationSteps,
                probabilityOfMissing: resObj.probabilityOfMissing,
                workloadEstimation: resObj.workloadEstimation,
                recommendedPriority: resObj.recommendedPriority,
                subtasks: resObj.subtasks,
                milestones: resObj.milestones,
                roadmap: resObj.roadmap,
                suggestedDailyTarget: resObj.suggestedDailyTarget,
                rescueModeActive: resObj.rescueModeActive,
                rescuePlan: resObj.rescuePlan,
              };
            }
            return t;
          });

          saveTasksToStateAndStorage(updated);
          awardXP(15, `Evaluated risk vector for task: "${target.name}"`);

          // Update current selection view details
          if (selectedTask?.id === taskId) {
            const currentObj = updated.find((t) => t.id === taskId);
            if (currentObj) setSelectedTask(currentObj);
          }
        }
        setScanningSingleId(null);
      })
      .catch((err) => {
        console.warn("Single task scan completed with fallback:", err);
        setScanningSingleId(null);
      });
  };

  // Trigger Advisor Recommendations
  const handleConsultCoach = () => {
    setLoadingCoach(true);
    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);

    fetch("/api/gemini/productivity-coach", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ tasks: pending, completedTasks: completed }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.advice) {
          setCoachAdvice(data.advice);
          localStorage.setItem("cached_advice", JSON.stringify(data.advice));
          awardXP(20, "Synthesized peak focus and workload guidance");
        }
        setLoadingCoach(false);
      })
      .catch((err) => {
        console.warn("Coach consulting completed with fallback:", err);
        setLoadingCoach(false);
      });
  };

  // Trigger Daily Action Planner
  const handleGenerateDailyPlanner = () => {
    setLoadingPlanner(true);
    const pending = tasks.filter((t) => !t.completed);

    fetch("/api/gemini/daily-planner", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ tasks: pending }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.planner) {
          setDailyPlanner(data.planner);
          localStorage.setItem("cached_planner", JSON.stringify(data.planner));
          awardXP(20, "Engineered daily calendar allocation layout");
        }
        setLoadingPlanner(false);
      })
      .catch((err) => {
        console.warn("Daily planner generation completed with fallback:", err);
        setLoadingPlanner(false);
      });
  };

  const handleUpdateDailyPlanner = (updatedPlanner: DailyPlannerData) => {
    setDailyPlanner(updatedPlanner);
    localStorage.setItem("cached_planner", JSON.stringify(updatedPlanner));
    awardXP(15, "Optimized focus blocks & calendar schedule");
    showToast("Daily Focus Plan saved successfully!", "success");
  };

  // --- Task CRUD handlers ---

  const handleOpenAddTask = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  const handleSaveTask = (taskData: any) => {
    if (taskData.id) {
      // Editing Task
      const updated = tasks.map((t) => {
        if (t.id === taskData.id) {
          // Preserve risk details if name/deadline didn't change, or wipe if deadline changes
          const deadlineChanged = t.deadline !== taskData.deadline;
          return {
            ...t,
            name: taskData.name,
            description: taskData.description,
            deadline: taskData.deadline,
            priority: taskData.priority,
            category: taskData.category,
            estimatedHours: taskData.estimatedHours,
            progress: taskData.progress,
            notes: taskData.notes,
            // Wipe scores to force re-evaluation if timeline changed
            riskScore: deadlineChanged ? undefined : t.riskScore,
            riskLevel: deadlineChanged ? undefined : t.riskLevel,
            riskFactors: deadlineChanged ? undefined : t.riskFactors,
            mitigationSteps: deadlineChanged ? undefined : t.mitigationSteps,
          };
        }
        return t;
      });
      saveTasksToStateAndStorage(updated);
      logActivity("update", `Refined tactical parameters for task: "${taskData.name}"`);
      showToast(`Task details updated`, "info");
      
      const updatedSel = updated.find((t) => t.id === taskData.id);
      if (updatedSel) setSelectedTask(updatedSel);
    } else {
      // Adding new Task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        name: taskData.name,
        description: taskData.description,
        deadline: taskData.deadline,
        priority: taskData.priority,
        category: taskData.category,
        estimatedHours: taskData.estimatedHours,
        progress: taskData.progress,
        notes: taskData.notes,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const updated = [newTask, ...tasks];
      saveTasksToStateAndStorage(updated);
      setSelectedTask(newTask);
      logActivity("create", `Initialized guardian shield for task: "${newTask.name}"`);
      awardXP(10, `Activated task sentinel: "${newTask.name}"`);
    }
  };

  const handleDeleteTask = (id: string) => {
    const target = tasks.find(t => t.id === id);
    const filtered = tasks.filter((t) => t.id !== id);
    saveTasksToStateAndStorage(filtered);
    logActivity("delete", `Purged active target parameters: "${target?.name || "Task"}"`);
    showToast(`Task deleted`, "info");
    
    // Manage details selection fallback
    if (selectedTask?.id === id) {
      setSelectedTask(filtered.length > 0 ? filtered[0] : null);
    }
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId && t.subtasks) {
        const updatedSubtasks = t.subtasks.map((st) => {
          if (st.id === subtaskId) {
            return { ...st, completed: !st.completed };
          }
          return st;
        });
        
        const completedCount = updatedSubtasks.filter(st => st.completed).length;
        const totalCount = updatedSubtasks.length;
        const computedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : t.progress;

        return { 
          ...t, 
          subtasks: updatedSubtasks,
          progress: computedProgress,
          completed: totalCount > 0 && completedCount === totalCount ? true : t.completed
        };
      }
      return t;
    });
    saveTasksToStateAndStorage(updated);
    
    const matched = updated.find((t) => t.id === taskId);
    if (selectedTask?.id === taskId && matched) {
      setSelectedTask(matched);
    }
    awardXP(5, "Updated task execution objective");
  };

  const handleToggleComplete = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const compl = !t.completed;
        return {
          ...t,
          completed: compl,
          completedAt: compl ? new Date().toISOString() : undefined,
          // Reset risk score if toggled incomplete
          riskScore: compl ? 0 : undefined,
          riskLevel: compl ? undefined : t.riskLevel,
        };
      }
      return t;
    });
    saveTasksToStateAndStorage(updated);

    // Sync selected
    const matched = updated.find((t) => t.id === id);
    if (selectedTask?.id === id && matched) {
      setSelectedTask(matched);
    }

    if (matched && matched.completed) {
      logActivity("complete", `Slayed active threat: "${matched.name}"`);
      // Award completion XP and handle streak
      const todayStr = new Date().toDateString();
      setGamification(prev => {
        let streakInc = 0;
        if (prev.lastCompletedDate) {
          const lastDateStr = new Date(prev.lastCompletedDate).toDateString();
          if (lastDateStr !== todayStr) {
            const lastDate = new Date(prev.lastCompletedDate);
            const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 1) {
              streakInc = 1;
            }
          }
        } else {
          streakInc = 1;
        }

        const nextStreak = prev.dailyStreak + streakInc;
        if (streakInc > 0) {
          showToast(`🔥 Streak Extended to ${nextStreak} Days!`, "success");
        }

        const updatedState = {
          ...prev,
          xp: prev.xp + 50,
          points: prev.points + 50,
          dailyStreak: nextStreak,
          lastCompletedDate: new Date().toISOString()
        };
        const unlocked = checkAndUnlockBadges(updatedState, updated);
        localStorage.setItem("deadline_gamification", JSON.stringify(unlocked));
        if (user) {
          setDoc(doc(db, "users", user.uid, "gamification", "doc"), unlocked).catch(err => console.warn(err));
        }
        return unlocked;
      });
    } else {
      if (matched) {
        logActivity("update", `Reactivated threat: "${matched.name}"`);
      }
      showToast(`Task reactivated`, "info");
    }
  };

  const handleLoadDemoPreset = () => {
    const now = new Date();
    const demoTasks: Task[] = [
      {
        id: "demo-task-1",
        name: "Prepare Presentation for Monday Meeting",
        description: "Design slides and practice the update presentation for the weekly team sync.",
        deadline: new Date(now.getTime() + 5 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        category: "Work",
        estimatedHours: 3,
        progress: 25,
        completed: false,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        riskScore: 70,
        riskLevel: "HIGH",
        riskFactors: [
          "Meeting is coming up very soon.",
          "Need to finish designing the last 3 slides."
        ],
        mitigationSteps: [
          "Focus on completing the slides first without worrying too much about perfection.",
          "Do a quick practice run out loud to make sure of the timing."
        ],
        probabilityOfMissing: "70%",
        workloadEstimation: "Medium (3 hours needed)",
        recommendedPriority: "HIGH",
        subtasks: [
          { id: "demo-task-1-sub-1", name: "Outline main slide points", completed: true, estimatedHours: 1 },
          { id: "demo-task-1-sub-2", name: "Create slide layouts and text", completed: false, estimatedHours: 1 },
          { id: "demo-task-1-sub-3", name: "Do a quick timing practice", completed: false, estimatedHours: 1 }
        ],
        milestones: [
          "Slide outline done",
          "Practice run completed"
        ],
        roadmap: "Keep it simple. Write your points first, add a few nice pictures, and then practice saying it out loud.",
        suggestedDailyTarget: "Finish the slides and practice twice.",
        rescueModeActive: true,
        rescuePlan: [
          "🚨 Focus on slides only; skip any secondary formatting.",
          "🚨 Use a simple clean template instead of building new designs."
        ]
      },
      {
        id: "demo-task-2",
        name: "Study for Mathematics Exam",
        description: "Read chapters 3 and 4, and practice solving the questions at the end of the chapter.",
        deadline: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
        priority: "high",
        category: "Study",
        estimatedHours: 4,
        progress: 0,
        completed: false,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        riskScore: 60,
        riskLevel: "MEDIUM",
        riskFactors: [
          "Exam is tomorrow morning.",
          "Still have many practice equations left to solve."
        ],
        mitigationSteps: [
          "Go through the main formulas and solve three example questions for each.",
          "Take a 5-minute break every half hour to keep your mind fresh."
        ],
        probabilityOfMissing: "60%",
        workloadEstimation: "High (4 hours needed)",
        recommendedPriority: "HIGH",
        subtasks: [
          { id: "demo-task-2-sub-1", name: "Read chapter 3 summary", completed: false, estimatedHours: 1 },
          { id: "demo-task-2-sub-2", name: "Solve chapter 3 math problems", completed: false, estimatedHours: 1 },
          { id: "demo-task-2-sub-3", name: "Read chapter 4 summary", completed: false, estimatedHours: 1 },
          { id: "demo-task-2-sub-4", name: "Solve chapter 4 math problems", completed: false, estimatedHours: 1 }
        ],
        milestones: [
          "Chapter 3 review done",
          "Chapter 4 review done"
        ],
        roadmap: "Focus on understanding the key formulas first, then practice with simple equations before moving to harder ones.",
        suggestedDailyTarget: "Solve 10 practice problems from each chapter.",
        rescueModeActive: false,
        rescuePlan: []
      },
      {
        id: "demo-task-3",
        name: "Organize Home Desk and Files",
        description: "Sort papers, clear off clutter, and set up a neat and tidy workspace.",
        deadline: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        priority: "medium",
        category: "Personal",
        estimatedHours: 2,
        progress: 50,
        completed: false,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        riskScore: 30,
        riskLevel: "LOW",
        riskFactors: [
          "Need folders for storage."
        ],
        mitigationSteps: [
          "Throw away or recycle any old papers you do not need anymore.",
          "Wipe down the desk surface and organize pencils and notebooks."
        ],
        probabilityOfMissing: "30%",
        workloadEstimation: "Easy (2 hours needed)",
        recommendedPriority: "MEDIUM",
        subtasks: [
          { id: "demo-task-3-sub-1", name: "Sort through paper stacks", completed: true, estimatedHours: 1 },
          { id: "demo-task-3-sub-2", name: "Wipe down desk and arrange items", completed: false, estimatedHours: 1 }
        ],
        milestones: [
          "Decluttering complete",
          "Desk organized and clean"
        ],
        roadmap: "Sort papers into keep, recycle, and action. Put keep papers in a safe spot, throw away recycle, and clean the desk.",
        suggestedDailyTarget: "Wipe desk clean and put stationery in drawers.",
        rescueModeActive: false,
        rescuePlan: []
      },
      {
        id: "demo-task-4",
        name: "Practice Guitar and Songs",
        description: "Play basic chords and practice the new song melody for 30 minutes.",
        deadline: new Date(now.getTime() + 120 * 60 * 60 * 1000).toISOString(),
        priority: "low",
        category: "Hobbies",
        estimatedHours: 1,
        progress: 100,
        completed: true,
        completedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        riskScore: 0,
        riskLevel: "LOW",
        riskFactors: ["Completed!"],
        mitigationSteps: ["Great job practicing today!"],
        probabilityOfMissing: "0%",
        workloadEstimation: "Completed successfully",
        recommendedPriority: "LOW",
        subtasks: [
          { id: "demo-task-4-sub-1", name: "Warm up with scales for 5 minutes", completed: true, estimatedHours: 0.1 },
          { id: "demo-task-4-sub-2", name: "Practice transition chords", completed: true, estimatedHours: 0.2 },
          { id: "demo-task-4-sub-3", name: "Play full song without stopping", completed: true, estimatedHours: 0.5 }
        ],
        milestones: [
          "Scale practice complete",
          "Chords sounding clean and clear",
          "Full song played smoothly"
        ],
        roadmap: "Take it slow. Practice chord changes first, then add the strumming pattern, and finally play the song.",
        suggestedDailyTarget: "Completed on time.",
        rescueModeActive: false,
        rescuePlan: []
      }
    ];

    saveTasksToStateAndStorage(demoTasks);
    setSelectedTask(demoTasks[0]);
    awardXP(100, "Loaded friendly everyday sample tasks");
    showToast("Sample Tasks loaded successfully!", "success");
    setActiveTab("dashboard");
  };

  // --- Filters & Sorters ---

  const getFilteredAndSortedTasks = () => {
    let result = [...tasks];

    // 1. Filter
    if (filter === "pending") {
      result = result.filter((t) => !t.completed);
    } else if (filter === "completed") {
      result = result.filter((t) => t.completed);
    }

    // 2. Sort
    if (sortBy === "risk") {
      // Completed are pushed to bottom, higher risk scores go top
      result.sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        
        const scoreA = a.riskScore || 0;
        const scoreB = b.riskScore || 0;
        return scoreB - scoreA;
      });
    } else {
      // Default: sort by priority weight, then closeness of deadline
      const priorityWeights = { high: 3, medium: 2, low: 1 };
      result.sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        const weightDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
        if (weightDiff !== 0) return weightDiff;

        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    }

    return result;
  };

  // --- Metrics ---

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  
  // High risk are tasks with score >= 75% or high/critical risk level
  const highRiskCount = tasks.filter(
    (t) => !t.completed && ((t.riskScore && t.riskScore >= 75) || t.riskLevel === "HIGH" || t.riskLevel === "CRITICAL")
  ).length;

  const completionPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Render detail styling variables
  const getRiskColors = (level?: string) => {
    switch (level) {
      case "CRITICAL":
        return { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/5", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
      case "HIGH":
        return { text: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/5", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
      case "MEDIUM":
        return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/5", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "LOW":
        return { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      default:
        return { text: "text-slate-400", border: "border-white/10", bg: "bg-white/[0.02]", badge: "bg-white/5 text-slate-400 border-white/10" };
    }
  };

  const selectedRiskColors = getRiskColors(selectedTask?.riskLevel);

  // --- Smart Widgets Calculations ---
  const upcomingDeadlines = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 2);

  const highRiskTasks = tasks
    .filter((t) => !t.completed && (t.riskLevel === "HIGH" || t.riskLevel === "CRITICAL" || (t.riskScore && t.riskScore >= 75)))
    .slice(0, 2);

  const recommendedActionTask = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const aScore = (a.riskScore || 0) + (a.priority === "high" ? 50 : a.priority === "medium" ? 25 : 0);
      const bScore = (b.riskScore || 0) + (b.priority === "high" ? 50 : b.priority === "medium" ? 25 : 0);
      return bScore - aScore;
    })[0];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-400 font-sans">
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-amber-500/10" />
          <div className="absolute inset-0 rounded-full border-2 border-t-amber-500 animate-spin" />
          <ShieldAlert className="w-6 h-6 text-amber-500 animate-pulse" />
        </div>
        <p className="text-xs uppercase font-mono tracking-[0.2em] text-amber-500/80 animate-pulse">
          Just a moment...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={(u) => setUser(u)} showToast={showToast} />;
  }

  if (!onboardingComplete) {
    return (
      <WelcomeScreen 
        userName={settings.userName || user?.displayName || "Guardian Scout"}
        onGetStartedWithEnergy={(circadian, energy) => {
          setOnboardingComplete(true);
          localStorage.setItem("onboarding_complete", "true");
          const updatedSettings: UserSettings = {
            ...settings,
            circadianRhythm: circadian,
            todayEnergy: energy
          };
          setSettings(updatedSettings);
          if (user && user.uid !== "guest-scout") {
            const userSettingsRef = doc(db, "users", user.uid, "configs", "settings");
            setDoc(userSettingsRef, updatedSettings, { merge: true }).catch(err => console.error(err));
          } else {
            localStorage.setItem("deadline_settings", JSON.stringify(updatedSettings));
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans selection:bg-amber-600/30 selection:text-white flex overflow-hidden" id="deadline-guardian-app">
      {/* Background radial atmosphere */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-500/[0.02] blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-amber-600/[0.02] blur-[150px] pointer-events-none z-0" />

      {/* 1. Left Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userName={settings.userName || user?.displayName || "Guardian Scout"}
        userEmail={user?.email || "scout@deadlineguardian.ai"}
        theme={settings.theme}
        onThemeToggle={() => {
          const nextTheme = settings.theme === "dark" ? "light" : settings.theme === "light" ? "high-contrast" : "dark";
          saveSettings({ ...settings, theme: nextTheme });
        }}
        onLogout={async () => {
          await signOut(auth);
          setUser(null);
          showToast("Session disconnected", "info");
        }}
        highRiskCount={highRiskTasks.length}
        unreadNotificationsCount={notifications.filter(n => !n.read).length}
      />

      {/* 2. Main Viewport Stage */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto pb-20 lg:pb-0">
        
        {/* Top bar with quick metrics / greeting */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-900/80 bg-[#070708]/85 backdrop-blur-md px-4 md:px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Mobile Branding Logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-sans font-extrabold text-white text-sm tracking-tight">Guardian<span className="text-[#128C7E]">AI</span></span>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5 capitalize">
                {activeTab === "dashboard" ? "Home" : activeTab === "analytics" ? "My Progress" : activeTab === "high-risk" ? "Urgent Tasks" : activeTab} <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono">
                Welcome back, {user.email?.split("@")[0] || "friend"}!
              </p>
            </div>
          </div>

          {/* Right Action Suite */}
          <div className="flex items-center gap-2.5 md:gap-4">
            {/* API Health indicator */}
            <div className="flex items-center gap-1.5 text-[10px] bg-zinc-900/60 border border-zinc-800/80 rounded-full px-3 py-1 font-mono">
              <div className={`h-1.5 w-1.5 rounded-full ${isAiAvailable ? "bg-amber-500" : "bg-zinc-600 animate-pulse"}`} />
              <span className="text-zinc-400 uppercase tracking-wider">{isAiAvailable ? "Gemini Online" : "Gemini Offline"}</span>
            </div>

            {/* Notifications panel trigger */}
            <button 
              onClick={() => setActiveTab("notifications")} 
              className="relative p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-900/80 transition-all text-zinc-400 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-[#050505]" />
              )}
            </button>

            {/* Three dot mobile dropdown trigger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-900/80 transition-all text-zinc-400 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              title="Open Navigation Menu"
            >
              <MoreVertical className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        {/* Slide-in settings/navigation drawer for mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="lg:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm"
              />

              {/* Side sheet */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", bounce: 0.05, duration: 0.3 }}
                className="lg:hidden fixed top-0 right-0 bottom-0 w-72 z-50 bg-[#0a0a0c] border-l border-zinc-900 p-5 flex flex-col justify-between shadow-2xl"
              >
                <div className="space-y-6">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Zap className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="font-sans font-extrabold text-white text-base tracking-tight">Guardian<span className="text-emerald-400">AI</span></span>
                    </div>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Guardian Scout stats / profile section */}
                  <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-sans font-bold text-emerald-400 shrink-0">
                      {settings.userName ? settings.userName.slice(0, 2).toUpperCase() : "GS"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{settings.userName || "Guardian Scout"}</h4>
                      <p className="text-[10px] text-zinc-500 truncate">{user?.email || "scout@deadlineguardian.ai"}</p>
                    </div>
                  </div>

                  {/* Secondary navigation items inside side sheet */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-zinc-600 block pl-1">All Workspaces</span>
                    <nav className="space-y-1">
                      {[
                        { id: "dashboard", label: "Home", icon: Home },
                        { id: "tasks", label: "My Plan", icon: ListTodo },
                        { id: "calendar", label: "Calendar View", icon: CalendarDays },
                        { id: "analytics", label: "My Progress", icon: TrendingUp },
                        { id: "focus", label: "Focus Timer", icon: Timer },
                        { id: "notifications", label: "Reminders & Alerts", icon: Bell },
                        { id: "settings", label: "Settings Panel", icon: SlidersHorizontal }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              isActive
                                ? "bg-emerald-600/15 border-emerald-500/20 text-emerald-400"
                                : "border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>

                {/* Bottom Drawer Actions */}
                <div className="border-t border-zinc-900 pt-4 space-y-3">
                  {/* Theme Toggle option */}
                  <button
                    onClick={() => {
                      const nextTheme = settings.theme === "dark" ? "light" : settings.theme === "light" ? "high-contrast" : "dark";
                      saveSettings({ ...settings, theme: nextTheme });
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {settings.theme === "dark" ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-emerald-400 shrink-0" />}
                      <span>Theme: {settings.theme.toUpperCase()}</span>
                    </div>
                  </button>

                  {/* Sign Out option */}
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await signOut(auth);
                      setUser(null);
                      showToast("Session disconnected", "info");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-transparent transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#070708]/95 backdrop-blur-md border-t border-zinc-900 px-2 py-1 flex justify-around items-center lg:hidden pb-safe shadow-2xl">
          {[
            { id: "dashboard", label: "Home", icon: Home },
            { id: "tasks", label: "My Plan", icon: ListTodo },
            { id: "analytics", label: "Progress", icon: TrendingUp },
            { id: "notifications", label: "Reminders", icon: Bell },
            { id: "focus", label: "Focus Timer", icon: Timer }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center py-1 flex-1 min-h-[44px] cursor-pointer transition-all ${
                  isActive 
                    ? "text-[#128C7E] scale-105 font-bold" 
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-4.5 h-4.5 mb-1" />
                <span className="text-[9px] tracking-wider uppercase font-sans font-bold leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global offline status indicator */}
        {!loadingHealth && !isAiAvailable && (
          <div className="mx-6 mt-6 flex items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/10 bg-amber-500/[0.02] text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <p>
                <strong className="font-bold">Cognitive Scanner Offline:</strong> Paste your personal <strong className="font-bold text-white">Gemini API Key</strong> in settings to enable full-scope AI risk analysis and coached priority suggestions.
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 shrink-0">offline</span>
          </div>
        )}

        <main className="flex-1 p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Custom Greeting Header with Anime character */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-950/20 p-4 rounded-2xl border border-zinc-900/60" id="custom-home-greeting-banner">
                  <div className="flex items-center gap-4">
                    <AnimeCharacter />
                    <div>
                      <h2 className="font-sans text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        Hello, Friend! 👋
                      </h2>
                      <p className="text-xs font-semibold text-zinc-400">
                        {new Date().toLocaleDateString(undefined, {
                          weekday: "long",
                          day: "numeric",
                          month: "long"
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Universal Smart AI Input panel */}
                <UniversalSmartInput 
                  customGeminiKey={settings.customGeminiKey}
                  onTasksAndScheduleParsed={({ tasks: parsedTasks, schedule: parsedSchedule }) => {
                    // Update state with parsed tasks and schedule
                    const updatedTasks = [...tasks];
                    parsedTasks.forEach(t => {
                      if (!updatedTasks.some(existing => existing.name === t.name)) {
                        updatedTasks.push(t);
                      }
                    });
                    setTasks(updatedTasks);
                    
                    // Save to DB if authenticated
                    if (user && !user.isAnonymousGuest) {
                      parsedTasks.forEach(async (t) => {
                        const taskRef = doc(db, "users", user.uid, "tasks", t.id);
                        await setDoc(taskRef, t);
                      });
                    }
                    
                    // Update schedule
                    setDailyPlanner({
                      timeBlocks: parsedSchedule,
                      efficiencyTip: "Dynamic schedule constructed by Gemini."
                    });
                    
                    // Log
                    logActivity("system", "Parsed new schedule automatically using Universal AI Input");
                    showToast("Schedule compiled by AI!", "success");
                  }}
                />

                {/* Main Stats, Charts, and Due Today Tasks */}
                <DashboardHome 
                  tasks={tasks}
                  highRiskCount={highRiskCount}
                  completionPercentage={completionPercentage}
                  activities={activities}
                  onSelectTask={(task) => {
                    setSelectedTask(task);
                    setActiveTab("tasks");
                  }}
                  onAddTaskClick={handleOpenAddTask}
                  onToggleComplete={handleToggleComplete}
                />
              </motion.div>
            )}

            {activeTab === "tasks" && (
              <motion.div
                key="tasks-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MyTasksAndPlanPanel 
                  tasks={tasks}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleOpenEditTask}
                  onDelete={handleDeleteTask}
                  onScanSingle={handleScanSingleTask}
                  onSelectForDetails={setSelectedTask}
                  selectedTaskId={selectedTask?.id}
                  scanningSingleId={scanningSingleId}
                  onAddTaskClick={handleOpenAddTask}
                  onLoadDemoPreset={handleLoadDemoPreset}
                />
              </motion.div>
            )}

            {activeTab === "coach" && (
              <motion.div
                key="coach-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-6">
                  <CoachPanel
                    advice={coachAdvice}
                    loading={loadingCoach}
                    onRefresh={handleConsultCoach}
                    tasks={tasks}
                    onSelectTaskByName={(name) => {
                      const matched = tasks.find(t => t.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(t.name.toLowerCase()));
                      if (matched) {
                        setSelectedTask(matched);
                        setActiveTab("tasks");
                      }
                    }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "calendar" && (
              <motion.div
                key="calendar-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-6">
                  <CalendarView
                    tasks={tasks}
                    onSelectTask={(task) => {
                      setSelectedTask(task);
                      setActiveTab("dashboard");
                    }}
                    onNavigateToDashboard={() => setActiveTab("dashboard")}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-6">
                  <AnalyticsPanel tasks={tasks} />
                </div>
              </motion.div>
            )}

            {activeTab === "focus" && (
              <motion.div
                key="focus-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-6">
                  <FocusModePanel
                    tasks={tasks}
                    onCompleteTask={(id) => handleToggleComplete(id)}
                    onAwardXP={(amount, reason) => awardXP(amount, reason)}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "badges" && (
              <motion.div
                key="badges-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-6">
                  <GamificationPanel gamification={gamification} />
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-6">
                  <SettingsPanel
                    settings={settings}
                    onSaveSettings={saveSettings}
                    isAiActive={isAiAvailable}
                    onRefreshHealth={() => {
                      checkHealthWithKey(settings.customGeminiKey || "");
                      showToast("Probing secure API tunnel...", "info");
                    }}
                    onLoadDemoPreset={handleLoadDemoPreset}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <NotificationPanel 
                  notifications={notifications} 
                  onMarkRead={async (id) => {
                    if (user) {
                      await updateDoc(doc(db, "users", user.uid, "notifications", id), { read: true });
                    } else {
                      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                    }
                  }}
                  onClearAll={async () => {
                    if (user) {
                      for (const n of notifications) {
                        await deleteDoc(doc(db, "users", user.uid, "notifications", n.id));
                      }
                    } else {
                      setNotifications([]);
                    }
                    showToast("Alert panel cleared", "info");
                  }}
                  onDeleteNotification={async (id) => {
                    if (user) {
                      await deleteDoc(doc(db, "users", user.uid, "notifications", id)).catch(err => console.warn(err));
                    } else {
                      setNotifications(prev => prev.filter(n => n.id !== id));
                    }
                  }}
                  settings={settings}
                  onSaveSettings={saveSettings}
                />
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                key="profile-stage"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <UserProfile 
                  userName={settings.userName || user?.displayName || "Guardian Scout"}
                  userEmail={user?.email || ""}
                  xp={gamification.xp}
                  points={gamification.points}
                  dailyStreak={gamification.dailyStreak}
                  badgesUnlocked={gamification.badges.filter(b => b.unlockedAt).length}
                  totalTasks={tasks.length}
                  completedTasks={tasks.filter(t => t.completed).length}
                  onUpdateName={async (newName) => {
                    saveSettings({ ...settings, userName: newName });
                    if (auth.currentUser) {
                      await updateProfile(auth.currentUser, { displayName: newName }).catch(err => console.warn(err));
                    }
                  }}
                  showToast={showToast}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950/20 py-6 text-center text-zinc-600 text-xs">
          <div className="max-w-7xl mx-auto px-4">
            <p>© 2026 Deadline Guardian AI. Stay on top of your tasks, stress-free! 😊</p>
            <p className="mt-1 text-[10px] text-zinc-500">Made with love to help you stay organized and relaxed.</p>
          </div>
        </footer>
      </div>

      {/* Task Form Modal overlay */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Toast Alert Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border p-4 shadow-xl backdrop-blur-md max-w-sm ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
                : toast.type === "error"
                ? "bg-rose-950/90 border-rose-500/30 text-rose-300"
                : "bg-zinc-950/90 border-amber-500/30 text-amber-300"
            }`}
          >
            <div className="h-2 w-2 rounded-full shrink-0 bg-current animate-pulse" />
            <p className="text-xs font-semibold uppercase tracking-wide font-mono leading-tight">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}