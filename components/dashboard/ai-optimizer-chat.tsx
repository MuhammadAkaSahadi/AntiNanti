"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
}

interface AIOptimizerChatProps {
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isAiTyping: boolean;
}

export function AIOptimizerChat({ chatMessages, onSendMessage, isAiTyping }: AIOptimizerChatProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playNativeTtsFallback = (text: string, idx: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Browser Anda tidak mendukung pemutaran suara lokal.");
      setPlayingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`~]/g, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.startsWith("id") || v.name.toLowerCase().includes("indonesian"));
    if (idVoice) {
      utterance.voice = idVoice;
    }

    utterance.onend = () => {
      setPlayingIdx(null);
    };
    utterance.onerror = () => {
      setPlayingIdx(null);
    };

    window.speechSynthesis.speak(utterance);
    setPlayingIdx(idx);
  };

  const playTtsMessage = async (text: string, idx: number) => {
    if (playingIdx === idx) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingIdx(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      setPlayingIdx(idx);
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const result = await res.json();
      if (result.success && result.audioBase64) {
        const base64Pcm = result.audioBase64;
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
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, 24000, true); // 24kHz
        view.setUint32(28, 48000, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, len, true);
        
        const pcmView = new Uint8Array(buffer, 44);
        pcmView.set(bytes);
        
        const blob = new Blob([buffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => {
          setPlayingIdx(null);
        };
        audio.play().catch(e => {
          console.error(e);
          setPlayingIdx(null);
        });
      } else {
        console.warn("Gemini TTS API returned error. Swapping to Web Speech API fallback...");
        playNativeTtsFallback(text, idx);
      }
    } catch (e) {
      console.warn("Gemini TTS API request failed. Swapping to Web Speech API fallback:", e);
      playNativeTtsFallback(text, idx);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage("");
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
              setInputMessage((prev) => (prev ? `${prev} ${result.text}` : result.text));
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

  return (
    <Card className="flex flex-col h-[70vh] shadow-md overflow-hidden">
      <CardHeader className="border-b border-stone-100 bg-white dark:border-stone-800 dark:bg-stone-950 flex flex-row items-center gap-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <CardTitle className="text-sm font-bold text-stone-900 dark:text-white">Procrastination Negotiator AI</CardTitle>
          <CardDescription className="text-[10px]">Siap memecah tugas & menghalau alasan penundaan Anda</CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/40 dark:bg-stone-900/40">
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="relative group max-w-[80%]">
              <div
                className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-emerald-800 text-white rounded-tr-none shadow-md shadow-emerald-800/10"
                    : "bg-white text-stone-800 border border-stone-200 rounded-tl-none dark:bg-stone-950 dark:border-stone-800 dark:text-stone-300 pr-10"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "ai" && (
                <button
                  onClick={() => playTtsMessage(msg.text, idx)}
                  className="absolute right-2.5 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  title="Dengarkan dengan Gemini TTS"
                >
                  {playingIdx === idx ? (
                    <VolumeX className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 text-emerald-800" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        
        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 dark:bg-stone-950 dark:border-stone-800 rounded-2xl rounded-tl-none p-3.5 text-xs flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-stone-100 bg-white p-3 dark:border-stone-800 dark:bg-stone-950 flex flex-col items-start gap-1">
        {isRecording && (
          <span className="text-[10px] text-rose-600 animate-pulse font-medium block pl-1 mb-1">
            Merekam suara... Tekan kembali tombol mic untuk memproses.
          </span>
        )}
        {isTranscribing && (
          <span className="text-[10px] text-emerald-800 animate-pulse font-medium block pl-1 mb-1">
            Gemini sedang menerjemahkan suara Anda...
          </span>
        )}
        {speechError && (
          <span className="text-[10px] text-rose-600 font-medium block pl-1 mb-1">
            {speechError}
          </span>
        )}
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tulis alasan Anda menunda atau tugas baru..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="w-full rounded-xl border border-stone-200 p-2.5 pr-10 text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-white"
            />
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`absolute right-2.5 top-2.5 transition-colors ${
                isRecording ? "text-rose-600 animate-pulse" : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              }`}
              title={isRecording ? "Selesai merekam" : "Gunakan Suara (Speech-to-Text)"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-emerald-800 p-2.5 text-white hover:bg-emerald-900 transition-colors shadow-md shadow-emerald-800/10"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </CardFooter>
    </Card>
  );
}
