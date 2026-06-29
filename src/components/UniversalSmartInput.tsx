import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  FileUp, 
  Camera, 
  FileText, 
  X, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { Task } from "../types";

interface UniversalSmartInputProps {
  onTasksAndScheduleParsed: (data: {
    tasks: Task[];
    schedule: any[];
    reasoning: string[];
    travelTime?: string;
  }) => void;
  customGeminiKey?: string;
}

export default function UniversalSmartInput({
  onTasksAndScheduleParsed,
  customGeminiKey
}: UniversalSmartInputProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraCaptured, setCameraCaptured] = useState(false);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  // Read File/Blob as Base64 helper
  const fileToBase64 = (fileOrBlob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to read file as Base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
    });
  };

  const steps = [
    "Reading input source & file buffers...",
    "Gemini executing deep semantic scheduling extraction...",
    "Formulating optimal chronological schedule blocks...",
    "Injecting smart focus buffers & saving schedule!"
  ];

  const handleSmartInputSubmit = async (queryText: string) => {
    if (!queryText.trim() && !fileBase64) return;
    setLoading(true);
    setLoadingStep(0);
    setErrorMessage(null);

    // Simulate loading steps in UI
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 900);

    try {
      const response = await fetch("/api/gemini/universal-input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customGeminiKey ? { "x-custom-api-key": customGeminiKey } : {})
        },
        body: JSON.stringify({
          text: queryText,
          fileData: fileBase64,
          mimeType: fileMimeType,
          currentTime: new Date().toISOString()
        })
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (data.tasks && data.schedule) {
        onTasksAndScheduleParsed({
          tasks: data.tasks,
          schedule: data.schedule,
          reasoning: data.reasoning || [],
          travelTime: data.travelTime
        });
        // Reset local states
        setText("");
        setUploadedFile(null);
        setCameraCaptured(false);
        setFileBase64(null);
        setFileMimeType(null);
        setErrorMessage(null);
      } else {
        setErrorMessage(data.error || "Could not parse tasks from the input. Please write more details.");
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage("Communication with Gemini API failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Document upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setFileBase64(base64);
        setFileMimeType(file.type || "image/jpeg");
        setUploadedFile({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`
        });
        setText(`Extracted schedule details from uploaded document: ${file.name}`);
      } catch (err) {
        setErrorMessage("Failed to process the uploaded file. Please try again.");
      }
    }
  };

  // Real webcam and canvas capture with 100% native fallback
  const startCamera = async () => {
    setErrorMessage(null);
    setShowCamera(true);
    setCameraCaptured(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Webcam stream access denied/unsupported", err);
      setShowCamera(false);
      setErrorMessage("Inline webcam access is blocked or unsupported in this browser. Opening device camera app instead!");
      // Fallback to native mobile/desktop camera capture
      setTimeout(() => {
        cameraInputRef.current?.click();
      }, 800);
    }
  };

  const handleCameraCaptureFallback = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        setFileBase64(base64);
        setFileMimeType(file.type || "image/jpeg");
        setUploadedFile({
          name: "captured_photo.jpg",
          size: `${(file.size / 1024).toFixed(1)} KB`
        });
        setText("Captured image successfully. Click 'Optimize Day' to analyze!");
      } catch (err) {
        setErrorMessage("Failed to process captured image.");
      }
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const base64 = await fileToBase64(blob);
              setFileBase64(base64);
              setFileMimeType("image/jpeg");
              setUploadedFile({
                name: "captured_photo.jpg",
                size: `${(blob.size / 1024).toFixed(1)} KB`
              });
              setText("Captured image successfully. Click 'Optimize Day' to analyze!");
            } catch (err) {
              console.error("Failed to convert image", err);
            }
          }
        }, "image/jpeg");
      }
    }
    setCameraCaptured(true);
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  // Real Web Speech API microphone system
  const toggleVoiceRecording = () => {
    setErrorMessage(null);
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn(e);
        }
      }
      setIsRecording(false);
    } else {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setErrorMessage("Web Speech Voice Recognition is not supported on this browser/environment.");
        return;
      }
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          const rec = new SpeechRecognitionAPI();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = "en-US";
          
          rec.onstart = () => {
            setIsRecording(true);
            setErrorMessage(null);
          };

          rec.onresult = (event: any) => {
            let interimTranscript = "";
            let finalTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }
            if (finalTranscript) {
              setText(prev => prev + (prev ? " " : "") + finalTranscript);
            }
          };

          rec.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === "not-allowed") {
              setErrorMessage("Microphone permission denied. Please allow microphone permissions in settings.");
            } else if (event.error === "no-speech") {
              setErrorMessage("No speech detected. Please speak clearly into your mic.");
            } else {
              setErrorMessage(`Speech recognition error: ${event.error}`);
            }
            setIsRecording(false);
          };

          rec.onend = () => {
            setIsRecording(false);
          };

          recognitionRef.current = rec;
          rec.start();
        })
        .catch((err) => {
          console.error("Mic permission error:", err);
          setErrorMessage("Microphone permission denied. Please allow microphone access in your browser settings.");
        });
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/85 backdrop-blur-xl p-5 md:p-6 space-y-4 shadow-xl" id="universal-smart-input-container">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Sparkles className="w-5 h-5 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-white tracking-tight">AI Executive Assistant</h3>
            <p className="text-[11px] text-zinc-400">Type, speak, or take photos of files/schedules to optimize your task list instantly.</p>
          </div>
        </div>
      </div>

      {/* Error alerts */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-start justify-between gap-2">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-zinc-400 hover:text-white font-bold cursor-pointer shrink-0">✕</button>
        </div>
      )}

      {/* Main input layout */}
      <div className="space-y-4">
        {/* Input Text Box */}
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/40 p-1 focus-within:border-emerald-500/40 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., 'Physics assignment by 5 PM, group study tomorrow at 11 AM...'"
            className="w-full min-h-[90px] bg-transparent border-0 px-3.5 py-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-0 resize-none"
          />

          {/* Upload indicators */}
          {uploadedFile && (
            <div className="mx-3 mb-2 flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/25">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-semibold text-zinc-300 truncate">{uploadedFile.name} ({uploadedFile.size})</span>
              </div>
              <button 
                onClick={() => { setUploadedFile(null); setText(""); setFileBase64(null); setFileMimeType(null); }}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between border-t border-zinc-900/60 p-2 bg-zinc-950/20 rounded-b-xl gap-2">
            <div className="flex items-center gap-2">
              
              {/* Voice Assist Button with pulsing red dot when listening */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-3 rounded-xl border transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  isRecording 
                    ? "bg-rose-500/20 border-rose-500/30 text-rose-400" 
                    : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-white"
                }`}
                title="Voice Recognition Assistant"
              >
                {isRecording ? (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                    <MicOff className="w-4 h-4" />
                  </div>
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Upload Document / Image */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Upload Document or Screenshot"
              >
                <FileUp className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*,application/pdf,.txt"
              />

              {/* Camera Shutter & Hidden Capture fallback */}
              <button
                type="button"
                onClick={startCamera}
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Capture Schedule using Camera"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={cameraInputRef} 
                onChange={handleCameraCaptureFallback} 
                className="hidden" 
                accept="image/*"
                capture="environment"
              />

            </div>

            <button
              onClick={() => handleSmartInputSubmit(text)}
              disabled={loading || (!text.trim() && !fileBase64)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-40 shadow-lg shadow-emerald-500/10 cursor-pointer active:scale-95 flex items-center gap-1.5 h-[44px]"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Optimize Day
            </button>
          </div>
        </div>

        {/* Listening visual feedback */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-rose-500/10 bg-rose-500/[0.02]"
            >
              <div className="flex items-center gap-1 mb-2">
                {[...Array(6)].map((_, i) => (
                  <span 
                    key={i} 
                    className="w-1.5 bg-rose-500 rounded-full animate-pulse" 
                    style={{ 
                      height: `${12 + Math.random() * 24}px`,
                      animationDelay: `${i * 150}ms`
                    }} 
                  />
                ))}
              </div>
              <p className="text-[10px] text-rose-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-rose-500 rounded-full shrink-0 animate-ping" />
                <span>Assistant listening...</span>
              </p>
              <button 
                onClick={toggleVoiceRecording}
                className="text-xs text-zinc-400 hover:text-white hover:underline mt-2 cursor-pointer font-bold"
              >
                Tap to Stop & Process Speech
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real inline webcam streaming */}
        <AnimatePresence>
          {showCamera && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 p-1"
            >
              <div className="absolute top-3 right-3 z-10">
                <button 
                  onClick={stopCamera} 
                  className="p-2 bg-black/70 rounded-full border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="aspect-video bg-zinc-900 rounded-xl relative flex items-center justify-center overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-dashed border-emerald-500/30 pointer-events-none rounded-xl m-4" />
                
                {/* Shutter capture trigger button */}
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full border border-white/20 shadow-xl cursor-pointer active:scale-95"
                  title="Capture"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Structured dynamic processing stages */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] flex items-start gap-3.5"
          >
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Processing Timeline</h4>
              <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                {steps[loadingStep]}
              </p>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mt-1">
                <motion.div 
                  className="bg-emerald-600 h-full" 
                  initial={{ width: "0%" }}
                  animate={{ width: `${(loadingStep + 1) * 25}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
