export interface Task {
  id: string;
  name: string;
  description: string;
  deadline: string; // ISO string
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  
  // Custom metadata
  category?: string;
  estimatedHours?: number;
  progress?: number; // 0-100
  notes?: string;
  timeSlot?: string;
  duration?: string;
  
  // Calculated or AI metrics
  riskScore?: number; // 0-100
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors?: string[];
  mitigationSteps?: string[];
  
  // Advanced predictive indicators
  probabilityOfMissing?: string; // e.g. "82%" or "Low"
  workloadEstimation?: string; // e.g. "High (12 hours)"
  recommendedPriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Autonomous AI Planning
  subtasks?: Array<{ id: string; name: string; completed: boolean; estimatedHours: number; dueDate?: string }>;
  milestones?: string[];
  roadmap?: string;
  suggestedDailyTarget?: string;
  
  // Rescue Mode
  rescueModeActive?: boolean;
  rescuePlan?: string[];
}

export interface UserSettings {
  userName: string;
  studyHoursPerDay: number;
  preferredWorkingTime: string; // fallback if needed
  theme: 'dark' | 'light' | 'high-contrast';
  fontSize?: number;
  reducedMotion?: boolean;
  customGeminiKey?: string;
  
  // Circadian rhythm & Energy-based scheduling
  circadianRhythm?: 'morning' | 'balanced' | 'night';
  todayEnergy?: 'low' | 'medium' | 'high';
  
  // Custom contact details for the new simplified reminder system
  gmailAddress?: string;
  phoneNumber?: string;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  unlockedAt?: string; // ISO string if unlocked
  iconName: string;
  requirementText: string;
}

export interface GamificationState {
  xp: number;
  points: number;
  dailyStreak: number;
  weeklyStreak: number;
  lastCompletedDate?: string;
  badges: AchievementBadge[];
}

export interface RiskAnalysis {
  taskId: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  mitigationSteps: string[];
  probabilityOfMissing?: string;
  workloadEstimation?: string;
  recommendedPriority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subtasks?: Array<{ id: string; name: string; completed: boolean; estimatedHours: number; dueDate?: string }>;
  milestones?: string[];
  roadmap?: string;
  suggestedDailyTarget?: string;
  rescueModeActive?: boolean;
  rescuePlan?: string[];
}

export interface ProductivityCoachAdvice {
  summaryOfWorkload: string;
  keyAdvice: string[];
  focusExercises: string[];
  recommendedNextTask: string;
}

export interface TimeBlock {
  time: string;
  action: string;
  taskId?: string;
  duration: string;
}

export interface DailyPlannerData {
  timeBlocks: TimeBlock[];
  efficiencyTip: string;
}

export interface MotivationData {
  message: string;
  quote: string;
  quoteAuthor: string;
}

export interface ActivityLog {
  id: string;
  type: "create" | "complete" | "update" | "delete" | "system" | "highrisk";
  message: string;
  timestamp: string;
}

