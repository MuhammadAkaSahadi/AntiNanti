"use client";

import React, { useState } from "react";
import { Calendar, RefreshCw, MapPin, TrendingUp, Edit2, Check, X, Compass, Volume2, VolumeX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BriefingCardProps {
  isBriefingLoading: boolean;
  briefingData: {
    cuaca: string;
    laluLintas: string;
    saranAI: string;
  };
  onRefresh: () => void;
  location: string;
  onUpdateLocation: (newLocation: string) => Promise<void>;
}

export function BriefingCard({ 
  isBriefingLoading, 
  briefingData, 
  onRefresh, 
  location, 
  onUpdateLocation 
}: BriefingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLocation, setTempLocation] = useState(location);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [isPlayingTts, setIsPlayingTts] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [currentDateString, setCurrentDateString] = useState("");
  const [greeting, setGreeting] = useState("Pagi");

  React.useEffect(() => {
    // Generate real-time date in Indonesian locale
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    };
    setCurrentDateString(now.toLocaleDateString("id-ID", options));

    // Determine greeting dynamically based on current local hour
    const hour = now.getHours();
    if (hour >= 5 && hour < 11) {
      setGreeting("Pagi");
    } else if (hour >= 11 && hour < 15) {
      setGreeting("Siang");
    } else if (hour >= 15 && hour < 19) {
      setGreeting("Sore");
    } else {
      setGreeting("Malam");
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playNativeTtsFallback = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      alert("Browser Anda tidak mendukung pemutaran suara lokal.");
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
      setIsPlayingTts(false);
    };
    utterance.onerror = () => {
      setIsPlayingTts(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingTts(true);
  };

  const handleToggleTts = async () => {
    if (isPlayingTts) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingTts(false);
      return;
    }

    if (!briefingData.saranAI || briefingData.saranAI.includes("Klik tombol segarkan")) {
      alert("Belum ada saran briefing AI yang siap dibacakan.");
      return;
    }

    setIsTtsLoading(true);
    try {
      const res = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: briefingData.saranAI }),
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
          setIsPlayingTts(false);
        };
        audio.play().catch(e => {
          console.error(e);
          setIsPlayingTts(false);
        });
        setIsPlayingTts(true);
      } else {
        console.warn("Gemini TTS API returned error. Swapping to Web Speech API fallback...");
        playNativeTtsFallback(briefingData.saranAI);
      }
    } catch (e) {
      console.warn("Gemini TTS API request failed. Swapping to Web Speech API fallback:", e);
      playNativeTtsFallback(briefingData.saranAI);
    } finally {
      setIsTtsLoading(false);
    }
  };

  const handleStartEdit = () => {
    setTempLocation(location);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempLocation.trim()) return;
    await onUpdateLocation(tempLocation.trim());
    setIsEditing(false);
  };

  const handleUseGPS = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Browser Anda tidak mendukung geolokasi.");
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        const coordsStr = `${lat}, ${lon}`;
        setTempLocation(coordsStr);
        await onUpdateLocation(coordsStr);
        setIsGpsLoading(false);
        setIsEditing(false);
      },
      (error) => {
        console.error(error);
        alert("Gagal mendeteksi lokasi GPS. Pastikan izin lokasi aktif.");
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Card className="border-t-4 border-t-emerald-800 shadow-md">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between pb-2 gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{currentDateString || "Memuat tanggal..."}</span>
          </div>
          <CardTitle className="text-2xl font-bold mt-1 text-amber-950 dark:text-amber-50">
            Briefing {greeting} AI
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          {/* Lokasi Display / Editor Trigger */}
          {!isEditing ? (
            <div className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full font-medium border border-emerald-100/50">
              <MapPin className="h-3 w-3 shrink-0 text-emerald-800" />
              <span>Lokasi: <span className="font-bold">{location}</span></span>
              <button 
                onClick={handleStartEdit} 
                className="text-stone-400 hover:text-emerald-800 ml-0.5 p-0.5 rounded transition-colors"
                title="Ganti Lokasi"
              >
                <Edit2 className="h-2.5 w-2.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveEdit} className="flex items-center gap-1 bg-stone-55 dark:bg-stone-900 p-1 rounded-lg border border-stone-200 dark:border-stone-850">
              <input
                type="text"
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
                placeholder="Nama Kota / Wilayah..."
                className="text-xs bg-transparent border-none outline-none px-1.5 py-0.5 w-32 focus:ring-0 text-stone-800 dark:text-white"
                autoFocus
              />
              <button
                type="button"
                onClick={handleUseGPS}
                disabled={isGpsLoading}
                className="p-1 rounded text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition-colors"
                title="Gunakan GPS Browser"
              >
                <Compass className={`h-3 w-3 ${isGpsLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                type="submit"
                className="p-1 rounded text-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Simpan"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1 rounded text-rose-600 hover:bg-rose-100 transition-colors"
                title="Batal"
              >
                <X className="h-3 w-3" />
              </button>
            </form>
          )}

          <button
            onClick={handleToggleTts}
            disabled={isBriefingLoading || isTtsLoading || isEditing}
            className={`rounded-full p-2 transition-colors focus:outline-none disabled:opacity-50 ${
              isPlayingTts 
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" 
                : "text-stone-500 hover:bg-stone-150 hover:text-emerald-800"
            }`}
            title={isPlayingTts ? "Hentikan Suara Briefing" : "Dengarkan Briefing AI"}
          >
            {isTtsLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-800" />
            ) : isPlayingTts ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={onRefresh}
            disabled={isBriefingLoading || isEditing || isTtsLoading}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-150 hover:text-emerald-800 transition-colors focus:outline-none disabled:opacity-50"
            title="Segarkan Analisis dengan Search Grounding"
          >
            <RefreshCw className={`h-4 w-4 ${isBriefingLoading ? "animate-spin text-emerald-800" : ""}`} />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isBriefingLoading ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1 rounded-md bg-stone-100 px-2.5 py-1 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                <MapPin className="h-3 w-3 text-emerald-800" />
                {briefingData.cuaca}
              </span>
              <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-amber-900 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30">
                <TrendingUp className="h-3 w-3 text-amber-800" />
                {briefingData.laluLintas}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              {briefingData.saranAI}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
