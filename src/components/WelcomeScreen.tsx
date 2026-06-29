import React from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  ArrowRight, 
  CalendarRange, 
  ShieldAlert, 
  TrendingUp, 
  Zap, 
  BellRing,
  CheckCircle2
} from "lucide-react";

interface WelcomeScreenProps {
  userName: string;
  onGetStartedWithEnergy: (circadian: 'morning' | 'balanced' | 'night', energy: 'low' | 'medium' | 'high') => void;
}

export default function WelcomeScreen({ userName, onGetStartedWithEnergy }: WelcomeScreenProps) {
  const [circadian, setCircadian] = React.useState<'morning' | 'balanced' | 'night'>('balanced');
  const [energy, setEnergy] = React.useState<'low' | 'medium' | 'high'>('medium');

  const features = [
    {
      title: "AI Task Planner",
      desc: "Autonomously construct structured hourly execution pathways based on study hours and working peaks.",
      icon: CalendarRange,
      color: "from-blue-500/20 to-indigo-500/10",
      iconColor: "text-blue-400"
    },
    {
      title: "Smart Deadline Prediction",
      desc: "Leverage advanced cognitive scanning to compute risk factors and probability of missing deadlines.",
      icon: ShieldAlert,
      color: "from-purple-500/20 to-pink-500/10",
      iconColor: "text-purple-400"
    },
    {
      title: "Priority Detection",
      desc: "Instant dynamic scaling of key milestones to guide focused efforts toward high-impact objectives.",
      icon: Zap,
      color: "from-amber-500/20 to-orange-500/10",
      iconColor: "text-amber-400"
    },
    {
      title: "Progress Tracking",
      desc: "Analyze and plot historical study metrics, active streaks, and badge rewards via deep-data charts.",
      icon: TrendingUp,
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-400"
    },
    {
      title: "Intelligent Reminders",
      desc: "Trigger pro-active warnings and Rescue Mode protocols when deadlines emerge into risk corridors.",
      icon: BellRing,
      color: "from-rose-500/20 to-pink-500/10",
      iconColor: "text-rose-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] bg-[radial-gradient(circle_at_bottom_left,_#1c1035_0%,_#050505_100%)] text-white flex flex-col items-center justify-center p-6 md:p-12" id="welcome-screen-container">
      {/* Background blobs */}
      <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      
      <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
        
        {/* Title Block */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> Authorization Succeeded // Commander Verified
          </div>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-white tracking-tight leading-tight">
            Welcome to <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Deadline Guardian AI</span>
          </h1>
          <p className="text-sm md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Never miss another deadline. Stay organized, productive, and stress-free with AI-powered task management.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={itemVariants}
                whileHover={{ y: -6, borderColor: "rgba(139, 92, 246, 0.3)" }}
                className={`p-6 rounded-2xl border border-white/5 bg-gradient-to-br ${feat.color} text-left space-y-4 transition-all duration-300 relative overflow-hidden group`}
              >
                {/* Checkmark decoration */}
                <div className="absolute top-4 right-4 text-emerald-400 opacity-60">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                
                <div className={`p-3 rounded-xl bg-black/40 w-fit border border-white/5`}>
                  <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-base text-white">{feat.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                </div>
              </motion.div>
            );
          })}

          {/* Quick Stats Summary Box */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-900/40 to-zinc-950/20 text-left flex flex-col justify-between relative overflow-hidden group border-dashed"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Guardian Matrix</span>
              <h3 className="font-display font-bold text-base text-zinc-300">Ready to Deflect Risks?</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">Customize your preferred active study peaks and let the AI Coach generate optimal hours.</p>
            </div>
            <div className="text-xs text-purple-400 font-mono mt-4 flex items-center gap-1">
              Active Session: {userName}
            </div>
          </motion.div>
        </motion.div>

        {/* Get Started Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="pt-4 max-w-lg mx-auto bg-zinc-950/60 border border-zinc-900/80 rounded-2xl p-6 space-y-5 shadow-2xl"
        >
          <div className="space-y-4">
            <div className="text-left space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">1. Select your standard Circadian Rhythm Peak</label>
              <div className="grid grid-cols-3 gap-2">
                {(['morning', 'balanced', 'night'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setCircadian(r)}
                    type="button"
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      circadian === r 
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/10" 
                        : "bg-zinc-900/60 border-zinc-850 text-zinc-500 hover:text-white"
                    }`}
                  >
                    {r === "morning" ? "Morning Peak" : r === "night" ? "Night Owl" : "Balanced"}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-left space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">2. Select today's starting Energy Capacity</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((e) => (
                  <button
                    key={e}
                    onClick={() => setEnergy(e)}
                    type="button"
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      energy === e 
                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/10" 
                        : "bg-zinc-900/60 border-zinc-850 text-zinc-500 hover:text-white"
                    }`}
                  >
                    {e === "low" ? "Low (Rest)" : e === "high" ? "High (Supercharged)" : "Medium"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            onClick={() => onGetStartedWithEnergy(circadian, energy)}
            whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(139,92,246,0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-sm font-bold text-white tracking-wider flex items-center justify-center gap-3.5 cursor-pointer shadow-xl transition-all"
          >
            INITIALIZE SECURITY CORE
            <ArrowRight className="w-4 h-4 text-white animate-bounce-horizontal" />
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}
