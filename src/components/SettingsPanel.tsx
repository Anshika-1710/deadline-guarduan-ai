import React, { useState } from "react";
import { UserSettings } from "../types";
import { Save, User, Clock, LayoutGrid, Check, Mail, Smartphone } from "lucide-react";

interface SettingsPanelProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  isAiActive: boolean;
  onRefreshHealth: () => void;
  onLoadDemoPreset: () => void;
}

export default function SettingsPanel({ settings, onSaveSettings, isAiActive, onRefreshHealth, onLoadDemoPreset }: SettingsPanelProps) {
  const [userName, setUserName] = useState(settings.userName || "Guardian Scout");
  const [studyHours, setStudyHours] = useState(settings.studyHoursPerDay || 4);
  const [workingTime, setWorkingTime] = useState(settings.preferredWorkingTime || "morning");
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>(settings.theme || 'dark');
  const [fontSize, setFontSizeState] = useState<number>(typeof settings.fontSize === "number" ? settings.fontSize : 16);
  const [gmailAddress, setGmailAddress] = useState(settings.gmailAddress || "");
  const [phoneNumber, setPhoneNumber] = useState(settings.phoneNumber || "");

  const setFontSize = (val: number) => {
    setFontSizeState(val);
    document.documentElement.style.fontSize = `${val}px`;
  };
  const [reducedMotion, setReducedMotion] = useState<boolean>(!!settings.reducedMotion);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      userName: userName.trim() || "Scout",
      studyHoursPerDay: Number(studyHours) || 4,
      preferredWorkingTime: workingTime,
      theme,
      fontSize,
      reducedMotion,
      customGeminiKey: settings.customGeminiKey || "",
      gmailAddress: gmailAddress.trim(),
      phoneNumber: phoneNumber.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="settings-panel-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Settings ⚙
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure your personal goal hours and customize the look of your focus workstation.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left column: Core profile - full width */}
        <div className="md:col-span-12 space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0e]/80 p-6 space-y-5">
            <h3 className="text-xs uppercase font-bold tracking-widest text-amber-500 flex items-center gap-2">
              <User className="w-4 h-4" /> My Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* User Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                    placeholder="e.g. Scout"
                  />
                  <User className="absolute left-3.5 top-4.5 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              {/* Email address */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={gmailAddress}
                    onChange={(e) => setGmailAddress(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                    placeholder="e.g., anshika@gmail.com"
                  />
                  <Mail className="absolute left-3.5 top-4.5 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              {/* Phone number */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                    placeholder="e.g., +1 (555) 019-2834"
                  />
                  <Smartphone className="absolute left-3.5 top-4.5 w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Goals & Focus Hours Selection */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0e]/80 p-6 space-y-5">
            <h3 className="text-xs uppercase font-bold tracking-widest text-amber-500 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Focus & Goal Hours
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Daily Goal Hours
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value) || 4)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3.5 pl-11 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                  />
                  <Clock className="absolute left-3.5 top-4.5 w-4 h-4 text-zinc-600" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  My Focus Hours
                </label>
                <select
                  value={workingTime}
                  onChange={(e) => setWorkingTime(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3.5 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-all"
                >
                  <option value="morning" className="bg-[#0c0c0e]">🌅 Morning (6 AM - 12 PM)</option>
                  <option value="afternoon" className="bg-[#0c0c0e]">☀️ Afternoon (12 PM - 5 PM)</option>
                  <option value="evening" className="bg-[#0c0c0e]">🌆 Evening (5 PM - 10 PM)</option>
                  <option value="night" className="bg-[#0c0c0e]">🌙 Night Owl (10 PM - 4 AM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Theme selection card */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0c0c0e]/80 p-6 space-y-5">
            <h3 className="text-xs uppercase font-bold tracking-widest text-amber-500 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> App Theme
            </h3>

            {/* Themes */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-amber-500/50 bg-amber-500/5 text-white font-bold'
                    : 'border-zinc-800 bg-[#070708] text-zinc-500 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span className="text-lg mb-1">🌌</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">Tactical Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-amber-500/50 bg-amber-500/5 text-stone-900 font-bold'
                    : 'border-zinc-800 bg-[#070708] text-zinc-500 hover:text-stone-900 hover:border-stone-400'
                }`}
              >
                <span className="text-lg mb-1">☀️</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">Light Theme</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('high-contrast')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  theme === 'high-contrast'
                    ? 'border-amber-500/50 bg-amber-500/5 text-white font-black'
                    : 'border-zinc-800 bg-[#070708] text-zinc-500 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span className="text-lg mb-1">👁️</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">High Contrast</span>
              </button>
            </div>

            {/* Adjustable Font Size & Reduced Motion Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2 flex justify-between items-center">
                  <span>Font Size Controller</span>
                  <span className="font-mono text-amber-500 font-bold">{fontSize}px</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-[#070708] text-white hover:border-amber-500 hover:text-amber-400 transition-colors shrink-0 font-bold text-base cursor-pointer"
                    title="Decrease Font Size"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="12"
                    max="30"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 accent-amber-500 bg-zinc-800 rounded-lg h-1"
                  />
                  <button
                    type="button"
                    onClick={() => setFontSize(Math.min(30, fontSize + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-[#070708] text-white hover:border-amber-500 hover:text-amber-400 transition-colors shrink-0 font-bold text-base cursor-pointer"
                    title="Increase Font Size"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Animations
                </label>
                <button
                  type="button"
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-xs transition-all cursor-pointer ${
                    reducedMotion
                      ? 'border-amber-500/20 bg-amber-500/5 text-amber-400'
                      : 'border-zinc-800 bg-[#070708] text-zinc-500 hover:text-white'
                  }`}
                >
                  <span className="font-bold uppercase tracking-wider">Reduced Motion</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-zinc-800 text-zinc-300">
                    {reducedMotion ? "Active" : "Disabled"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="md:col-span-12 flex items-center justify-end gap-4 border-t border-zinc-800/80 pt-5 mt-2">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1" id="settings-success-msg">
              <Check className="w-4 h-4" /> My Details & settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-black shadow-lg shadow-amber-500/10 transition-all active:scale-[0.98] cursor-pointer"
            id="settings-save-btn"
          >
            <Save className="w-4 h-4" />
            <span>Save My Details</span>
          </button>
        </div>
      </form>
    </div>
  );
}
