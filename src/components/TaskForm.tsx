import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Task } from "../types";

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, "id" | "completed" | "createdAt"> & { id?: string }) => void;
  taskToEdit?: Task | null;
}

export default function TaskForm({ isOpen, onClose, onSave, taskToEdit }: TaskFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("Study");
  const [customCategory, setCustomCategory] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<number>(2);
  const [progress, setProgress] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [duration, setDuration] = useState("1 hour");
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const presetCategories = ["Study", "Work", "Personal", "Health", "Finance", "Custom"];

  useEffect(() => {
    if (taskToEdit) {
      setName(taskToEdit.name);
      setDescription(taskToEdit.description);
      // Format ISO string to datetime-local expected format (YYYY-MM-DDThh:mm)
      const d = new Date(taskToEdit.deadline);
      const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setDeadline(localISOTime);
      setPriority(taskToEdit.priority);
      
      const cat = taskToEdit.category || "Study";
      if (presetCategories.slice(0, -1).includes(cat)) {
        setCategory(cat);
        setCustomCategory("");
      } else if (cat) {
        setCategory("Custom");
        setCustomCategory(cat);
      } else {
        setCategory("Study");
        setCustomCategory("");
      }
      
      setEstimatedHours(taskToEdit.estimatedHours ?? 2);
      setProgress(taskToEdit.progress ?? 0);
      setNotes(taskToEdit.notes ?? "");
      setTimeSlot(taskToEdit.timeSlot || "");
      setDuration(taskToEdit.duration || "1 hour");
      setShowAdvanced(true); // Always expand by default when editing an existing task
    } else {
      setName("");
      setDescription("");
      
      // Default to tomorrow same time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tzOffset = tomorrow.getTimezoneOffset() * 60000;
      const formattedDefault = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
      setDeadline(formattedDefault);
      setPriority("medium");
      setCategory("Study");
      setCustomCategory("");
      setEstimatedHours(2);
      setProgress(0);
      setNotes("");
      setTimeSlot("");
      setDuration("1 hour");
      setShowAdvanced(false); // Keep collapsed for a fresh new task
    }
    setError("");
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Task Name is required.");
      return;
    }
    if (!deadline) {
      setError("Deadline Date & Time is required.");
      return;
    }

    const selectedDate = new Date(deadline);
    if (isNaN(selectedDate.getTime())) {
      setError("Invalid deadline date.");
      return;
    }

    onSave({
      id: taskToEdit?.id,
      name: name.trim(),
      description: description.trim(),
      deadline: selectedDate.toISOString(),
      priority,
      category: category === "Custom" ? customCategory.trim() || "Custom" : category,
      estimatedHours: Number(estimatedHours) || 0,
      progress: Math.min(100, Math.max(0, progress)),
      notes: notes.trim(),
      timeSlot,
      duration,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl border border-zinc-800 bg-[#0c0c0e] p-6 md:p-8 shadow-2xl text-zinc-100 scrollbar-none"
            id="task-form-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                  {taskToEdit ? "🔧 Edit Task" : "➕ Create New Task"}
                </h3>
                <p className="text-[10px] text-zinc-400 mt-1">Set deadline and parameters to enable risk prediction.</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition-all"
                id="close-task-form-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-300"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Task Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  id="task-name-input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Complete chemistry lab protocol"
                  className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                />
              </div>

              {/* Grid: Deadline & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Deadline */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    id="task-deadline-input"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                  />
                </div>

                {/* Priority Selection */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Priority Tier
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[#070708] p-1 rounded-xl border border-zinc-800">
                    {(["low", "medium", "high"] as const).map((p) => {
                      const activePriorityBg = {
                        low: "bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/20",
                        medium: "bg-amber-500/10 text-amber-400 font-bold border-amber-500/20",
                        high: "bg-rose-500/10 text-rose-400 font-bold border-rose-500/20",
                      };
                      const isSelected = priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          id={`task-priority-${p}`}
                          onClick={() => setPriority(p)}
                          className={`py-1.5 rounded-lg text-xs capitalize font-semibold transition-all border ${
                            isSelected
                              ? activePriorityBg[p]
                              : "text-zinc-500 border-transparent hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Grid: Time Slot & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Time Slot */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Daily Schedule Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-all"
                  >
                    <option value="">Unscheduled</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="07:00 PM">07:00 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                    <option value="09:00 PM">09:00 PM</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-all"
                  >
                    <option value="30 mins">30 mins</option>
                    <option value="1 hour">1 hour</option>
                    <option value="1.5 hours">1.5 hours</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="4 hours">4 hours</option>
                  </select>
                </div>
              </div>

              {/* Progressive Disclosure: Toggle for More Options */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 transition-colors select-none py-1.5"
                >
                  {showAdvanced ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Fewer Details</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Add Description, Notes & Subtasks</span>
                    </>
                  )}
                </button>
              </div>

              {/* Collapsible Section */}
              <AnimatePresence initial={false}>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Description */}
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                        Task Description
                      </label>
                      <textarea
                        id="task-desc-input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add details, sub-tasks, or context notes..."
                        rows={2}
                        className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Category Selection & Estimated Hours */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category Selection */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                          Category
                        </label>
                        <select
                          id="task-category-select"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-all"
                        >
                          {presetCategories.map((cat) => (
                            <option key={cat} value={cat} className="bg-[#0c0c0e] text-white">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Estimated Hours */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                          Est. Effort (Hours)
                        </label>
                        <input
                          type="number"
                          id="task-hours-input"
                          min={0}
                          max={1000}
                          step={0.5}
                          value={estimatedHours}
                          onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                          placeholder="e.g., 4"
                        />
                      </div>
                    </div>

                    {/* Custom Category Field if "Custom" selected */}
                    {category === "Custom" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1.5"
                      >
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                          Custom Category Name
                        </label>
                        <input
                          type="text"
                          id="task-custom-category-input"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="e.g., Hackathon, Fitness, Legal"
                          className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                        />
                      </motion.div>
                    )}

                    {/* Progress Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          Completion Progress
                        </label>
                        <span className="font-mono text-xs text-amber-500 font-bold">{progress}%</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          id="task-progress-range"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                          className="w-full h-1 bg-[#070708] rounded-lg appearance-none cursor-pointer accent-amber-500 border border-zinc-800"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                        Detailed Notes
                      </label>
                      <textarea
                        id="task-notes-input"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Paste reference links, sub-deliverables, or special criteria..."
                        rows={2}
                        className="w-full rounded-xl border border-zinc-800 bg-[#070708] p-3 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-zinc-800/80 pt-5 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-5 py-3 text-sm font-semibold text-zinc-400 hover:bg-zinc-800/40 hover:text-white transition-all"
                  id="cancel-task-form-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/10 transition-all active:scale-[0.98]"
                  id="save-task-btn"
                >
                  <Save className="w-4 h-4" />
                  <span>{taskToEdit ? "Save Changes" : "Create Task"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
