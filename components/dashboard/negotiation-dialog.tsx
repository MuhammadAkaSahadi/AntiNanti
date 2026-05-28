"use client";

import React from "react";
import { AlertTriangle, Sparkles, Volume2, VolumeX, Mic, MicOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Task, MicroTask } from "@/types";

interface NegotiationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeTask: Task | null;
  negotiatedMicroTasks: MicroTask[];
  setNegotiatedMicroTasks: React.Dispatch<React.SetStateAction<MicroTask[]>>;
  aiMessage: string;
  isNegotiating: boolean;
  negotiationRound: number;
  partnerEmail: string;
  onAskForMoreTime: (reason: string) => void;
  onAcceptCommitment: () => void;
}

export function NegotiationDialog({
  isOpen,
  onOpenChange,
  activeTask,
  negotiatedMicroTasks,
  setNegotiatedMicroTasks,
  aiMessage,
  isNegotiating,
  negotiationRound,
  partnerEmail,
  onAskForMoreTime,
  onAcceptCommitment
}: NegotiationDialogProps) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [speechError, setSpeechError] = React.useState<string | null>(null);
  
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isGeneratingTts, setIsGeneratingTts] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setReason("");
      setSpeechError(null);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      setIsTranscribing(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }
  }, [isOpen]);

  React.useEffect(() => {
    // Kosongkan alasan setelah AI merespon untuk ronde berikutnya
    setReason("");
  }, [aiMessage]);

  // Helper untuk mengubah raw 24kHz 16-bit Mono PCM dari Gemini ke playable WAV format
  const playPcmAudio = (base64Pcm: string) => {
    if (typeof window === "undefined") return;
    
    // Hentikan pemutaran audio sebelumnya
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      const binaryString = window.atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const buffer = new ArrayBuffer(44 + len);
      const view = new DataView(buffer);
      
      const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + len, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM format
      view.setUint16(22, 1, true); // 1 channel (mono)
      view.setUint32(24, 24000, true); // sample rate 24kHz
      view.setUint32(28, 48000, true); // byte rate (24000 * 2 bytes)
      view.setUint16(32, 2, true); // block align
      view.setUint16(34, 16, true); // 16-bit
      writeString(view, 36, 'data');
      view.setUint32(40, len, true);
      
      const pcmView = new Uint8Array(buffer, 44);
      pcmView.set(bytes);
      
      const blob = new Blob([buffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(e => console.error("Playback error:", e));
    } catch (e) {
      console.error("Gagal memproses PCM audio:", e);
    }
  };

  const generateAndPlayTts = async (text: string) => {
    if (!text || isMuted) return;
    setIsGeneratingTts(true);
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const result = await res.json();
      if (result.success && result.audioBase64) {
        playPcmAudio(result.audioBase64);
      }
    } catch (error) {
      console.error("Gagal mendapatkan TTS dari Gemini:", error);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && aiMessage && !isMuted) {
      generateAndPlayTts(aiMessage);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [aiMessage, isOpen, isMuted]);

  const toggleSpeech = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      generateAndPlayTts(aiMessage);
    }
  };

  const startRecording = async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setSpeechError("Browser Anda tidak mendukung perekaman suara.");
      return;
    }
    
    setSpeechError(null);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = { mimeType: "audio/webm" };
      if (typeof MediaRecorder !== "undefined" && !MediaRecorder.isTypeSupported("audio/webm")) {
        options = { mimeType: "audio/mp4" };
      }
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
        if (audioBlob.size === 0) return;

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64data = (reader.result as string).split(",")[1];
            
            const response = await fetch("/api/ai/stt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audioBase64: base64data, mimeType: options.mimeType })
            });
            const result = await response.json();
            if (result.success && result.text) {
              setReason((prev) => (prev ? `${prev} ${result.text}` : result.text));
            } else {
              setSpeechError(result.error || "Gagal mentranskripsi suara.");
            }
            setIsTranscribing(false);
          };
        } catch (err: any) {
          console.error(err);
          setSpeechError("Terjadi kesalahan saat memproses audio.");
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setSpeechError("Akses mikrofon ditolak browser. Izinkan mikrofon di pengaturan browser Anda.");
      } else {
        setSpeechError("Gagal mengakses mikrofon.");
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!activeTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-850" />
            AI Procrastination Negotiator
          </DialogTitle>
          <DialogDescription>
            Negosiasikan waktu & pecahan tugas Anda. Kegagalan melanggar komitmen akan dilaporkan otomatis ke rekan Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-4">
          {/* AI Bubble Message */}
          <div className="relative rounded-2xl bg-stone-100 p-3.5 text-xs text-stone-700 leading-relaxed dark:bg-stone-850 dark:text-stone-300 pr-10">
            {aiMessage}
            <button
              onClick={toggleSpeech}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              title={isMuted ? "Aktifkan Suara" : "Senyapkan Suara"}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-rose-600" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-800" />
              )}
            </button>
          </div>

          {/* Custom excuse input with Speech-to-Text */}
          {negotiationRound < 2 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-amber-950 uppercase dark:text-stone-400">
                Alasan / Argumen Kelonggaran Anda
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Contoh: 'Listrik mati di kosan' atau 'Tugasnya sangat rumit'"
                    className="w-full rounded-xl border border-stone-200 p-2.5 pr-10 text-xs focus:ring-1 focus:ring-emerald-850 focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`absolute right-2.5 top-2.5 transition-colors ${
                      isRecording ? "text-rose-600 animate-pulse" : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    }`}
                    title={isRecording ? "Selesai merekam" : "Gunakan Suara (Speech-to-Text)"}
                  >
                    {isRecording ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
              {isRecording && (
                <span className="text-[10px] text-rose-600 animate-pulse font-medium block pl-1">
                  Merekam suara... Tekan kembali tombol mic untuk memproses.
                </span>
              )}
              {isTranscribing && (
                <span className="text-[10px] text-emerald-800 animate-pulse font-medium block pl-1">
                  Gemini sedang menerjemahkan suara Anda...
                </span>
              )}
              {speechError && (
                <span className="text-[10px] text-rose-600 font-medium block pl-1">
                  {speechError}
                </span>
              )}
            </div>
          )}

          {/* Microtask Negotiation List */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-amber-950 uppercase dark:text-stone-400">
              Rencana Pecahan Kerja Pomodoro
            </label>
            {isNegotiating ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              negotiatedMicroTasks.map((mt, index) => (
                <div key={mt.id} className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-stone-900 dark:text-white">
                      {mt.title}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Urgensi: {mt.urgency.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={mt.duration}
                      onChange={(e) => {
                        const newDur = parseInt(e.target.value) || 0;
                        setNegotiatedMicroTasks((prev) =>
                          prev.map((item, idx) =>
                            idx === index ? { ...item, duration: Math.min(newDur, 45) } : item
                          )
                        );
                      }}
                      className="w-12 rounded-lg border border-stone-300 p-1 text-center text-xs font-bold focus:ring-1 focus:ring-emerald-800 focus:outline-none dark:border-stone-750 dark:bg-stone-800"
                      min="1"
                      max="45"
                    />
                    <span className="text-xs text-stone-400 font-medium">menit</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Social Accountability Warning Box */}
          <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 flex gap-2.5 items-start text-[11px] text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-700" />
            <div>
              <span className="font-bold block">Sanksi Sosial Aktif</span>
              Laporan email kegagalan disiplin otomatis akan dikirim ke rekan partner Anda <span className="font-bold underline">({partnerEmail})</span> jika pecahan ini tidak selesai tepat waktu.
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={() => onAskForMoreTime(reason)}
            disabled={isNegotiating || negotiationRound >= 2}
            className="flex-1 rounded-full border border-amber-900/20 py-2.5 text-xs font-bold text-amber-950 hover:bg-stone-50 dark:text-amber-300 dark:border-amber-900/40 disabled:opacity-40 transition-colors"
          >
            {negotiationRound >= 2 ? "Batas Negosiasi Habis" : "Minta Kelonggaran AI (+5m)"}
          </button>
          <button
            onClick={onAcceptCommitment}
            disabled={isNegotiating}
            className="flex-1 rounded-full bg-emerald-800 py-2.5 text-xs font-bold text-white hover:bg-emerald-900 transition-colors"
          >
            Setujui Komitmen & Mulai
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
