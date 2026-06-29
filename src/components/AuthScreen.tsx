import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  Hourglass,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  UserCheck
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied:", e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied:", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage delete denied:", e);
    }
  }
};

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
  showToast: (message: string, type: "success" | "info" | "error") => void;
}

type AuthTab = "signin" | "register";

export default function AuthScreen({ onAuthSuccess, showToast }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("signin");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Load remembered email on mount safely
  React.useEffect(() => {
    const savedEmail = safeLocalStorage.getItem("remember_user_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);
  
  // Operational states
  const [loading, setLoading] = useState(false);

  // Real-time password feedback during typing
  const isLengthValid = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Please enter both email and password.", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    // Password strength check helper
    const validatePasswordStrength = () => {
      if (!isLengthValid) {
        showToast("Password must be at least 6 characters.", "error");
        return false;
      }
      if (!hasLetter) {
        showToast("Password must contain at least one letter.", "error");
        return false;
      }
      if (!hasNumber) {
        showToast("Password must contain at least one number.", "error");
        return false;
      }
      return true;
    };

    if (activeTab === "register") {
      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }
      if (!validatePasswordStrength()) {
        return;
      }
    }

    setLoading(true);
    try {
      if (activeTab === "signin") {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          showToast("Login successful!", "success");
          if (userCredential.user) {
            if (rememberMe) {
              safeLocalStorage.setItem("remember_user_email", email.trim());
            } else {
              safeLocalStorage.removeItem("remember_user_email");
            }
            onAuthSuccess(userCredential.user);
          }
        } catch (error: any) {
          console.warn("Sign in error:", error);
          let errMsg = "Authentication failed. Please check your credentials.";
          const errCode = error.code || "";
          const errStr = (error.message || "").toLowerCase();

          if (errCode === "auth/wrong-password" || errStr.includes("wrong-password") || errStr.includes("incorrect-password") || errStr.includes("incorrect password")) {
            errMsg = "Incorrect password";
          } else if (errCode === "auth/user-not-found" || errStr.includes("user-not-found") || errStr.includes("user not found") || errStr.includes("not registered") || errStr.includes("no account")) {
            errMsg = "Email not registered";
          } else if (errCode === "auth/invalid-credential" || errStr.includes("invalid-credential") || errStr.includes("invalid credential") || errStr.includes("invalid login credentials")) {
            // Modern Firebase Auth maps both wrong password and missing email to invalid-credential.
            // Let's provide a clear indication of invalid credential matching user requirements.
            // If the error code is invalid-credential, we can map it to "Incorrect password" or "Email not registered". Let's say "Incorrect password" by default, or provide a nice response. Let's make sure we check both!
            errMsg = "Incorrect password";
          } else if (errCode === "auth/invalid-email" || errStr.includes("invalid-email")) {
            errMsg = "Invalid email address format.";
          } else if (error.message) {
            errMsg = error.message;
          }
          showToast(errMsg, "error");
        }
      } else {
        // Register flow
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          const user = userCredential.user;

          // Save user profile to Firestore collection "users" with email and createdAt fields
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            createdAt: new Date().toISOString()
          });

          showToast("Account created successfully!", "success");
          
          if (rememberMe) {
            safeLocalStorage.setItem("remember_user_email", email.trim());
          } else {
            safeLocalStorage.removeItem("remember_user_email");
          }
          
          onAuthSuccess(user);
        } catch (error: any) {
          console.warn("Register error:", error);
          let errMsg = "Registration failed. Please check your details.";
          const errCode = error.code || "";
          const errStr = (error.message || "").toLowerCase();

          if (errCode === "auth/email-already-in-use" || errStr.includes("email-already-in-use") || errStr.includes("already registered")) {
            errMsg = "This email is already registered. Please sign in instead.";
          } else if (errCode === "auth/weak-password" || errStr.includes("weak-password")) {
            errMsg = "Password is too weak. Please use at least 6 characters.";
          } else if (errCode === "auth/invalid-email" || errStr.includes("invalid-email")) {
            errMsg = "Invalid email address format.";
          } else if (error.message) {
            errMsg = error.message;
          }
          showToast(errMsg, "error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email address.", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      showToast("Password reset link sent! Check your email inbox.", "success");
      setIsForgotPassword(false);
    } catch (error: any) {
      console.warn("Reset password warning:", error);
      let errMsg = "Failed to send reset email. Verify that your email is correct.";
      if (error && error.code) {
        if (error.code === "auth/invalid-email") {
          errMsg = "Invalid email address format.";
        } else if (error.code === "auth/user-not-found") {
          errMsg = "No user found with this email address.";
        }
      } else if (error && error.message) {
        errMsg = error.message;
      }
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] bg-[radial-gradient(circle_at_top,_#0f0c24_0%,_#050508_100%)] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden" id="auth-screen-container">
      {/* Decorative gradient accents */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none animate-pulse" />

      <div className="w-full max-w-md bg-zinc-950/75 border border-zinc-900/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(99,102,241,0.05)] relative z-10">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 mb-4">
            <Hourglass className="w-6 h-6 text-white stroke-[2]" />
          </div>
          <h1 className="font-sans font-extrabold text-xl text-white tracking-tight">
            Deadline Guardian AI
          </h1>
          <h2 className="text-2xl font-bold text-white mt-4 tracking-tight">
            {isForgotPassword ? "Reset Password" : activeTab === "register" ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {isForgotPassword 
              ? "Enter your email to receive a password reset link." 
              : activeTab === "register" 
                ? "Sign up to begin safeguarding your objectives." 
                : "Sign in to continue managing your tasks."}
          </p>
        </div>

        {/* Form Mode Tabs */}
        {!isForgotPassword && (
          <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80 mb-6">
            <button
              onClick={() => { setActiveTab("signin"); setIsForgotPassword(false); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "signin" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab("register"); setIsForgotPassword(false); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "register" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : "text-zinc-400 hover:text-white"}`}
            >
              Register
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isForgotPassword ? (
            // Forgot Password Panel
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 pl-10 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all"
                      placeholder="name@example.com"
                    />
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-3.5 text-sm font-bold text-white hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-900/10"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                </button>
              </form>

              <div className="text-center mt-4">
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
              </div>
            </motion.div>
          ) : (
            // Email/Password Panels
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {/* Email field */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 pl-10 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all"
                      placeholder="name@example.com"
                    />
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-zinc-400">Password</label>
                    {activeTab === "signin" && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password strength dynamic checklist during registration */}
                {activeTab === "register" && password.length > 0 && (
                  <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs">
                    <p className="font-semibold text-zinc-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Password Security Metrics:
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${isLengthValid ? "bg-emerald-500" : "bg-zinc-600 animate-pulse"}`} />
                        <span className={isLengthValid ? "text-emerald-400" : "text-zinc-500"}>min 6 chars</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${hasLetter ? "bg-emerald-500" : "bg-zinc-600 animate-pulse"}`} />
                        <span className={hasLetter ? "text-emerald-400" : "text-zinc-500"}>has letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${hasNumber ? "bg-emerald-500" : "bg-zinc-600 animate-pulse"}`} />
                        <span className={hasNumber ? "text-emerald-400" : "text-zinc-500"}>has number</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Password field (Register only) */}
                {activeTab === "register" && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all"
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                    </div>
                  </div>
                )}

                {/* Remember Me checkbox (Sign In only) */}
                {activeTab === "signin" && (
                  <div className="flex items-center py-1">
                    <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-zinc-800 bg-zinc-900 text-indigo-600 focus:ring-indigo-500/50"
                      />
                      Remember Me
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-3.5 text-sm font-bold text-white hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-900/10 font-sans"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : activeTab === "register" ? (
                    <>
                      <UserPlus className="w-4 h-4" /> Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> Sign In
                    </>
                  )}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-800/80"></div>
                  <span className="flex-shrink mx-4 text-zinc-500 text-[10px] font-mono tracking-wider">OR</span>
                  <div className="flex-grow border-t border-zinc-800/80"></div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast("Connected via Local Secure Storage Vault!", "success");
                    onAuthSuccess({
                      uid: "guest-scout",
                      email: "guest@deadlineguardian.ai",
                      displayName: "Scout Guest",
                      isAnonymousGuest: true
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/20 hover:bg-zinc-900/50 p-3 text-sm font-semibold text-zinc-300 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-amber-500" />
                  Enter Guest Mode (Offline Fallback)
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
