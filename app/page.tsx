"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldAlert, Timer, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

export default function Home() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent"></div>
          <span className="text-sm font-semibold text-stone-500">Memuat sesi Anda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 dark:bg-stone-950 font-sans">
      
      {/* Header */}
      <header className="border-b border-stone-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 dark:bg-stone-950/70 dark:border-stone-850">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <span className="font-black text-amber-950 dark:text-amber-50 tracking-tight text-base block">AntiNanti</span>
              <span className="text-[9px] text-stone-400 font-mono tracking-widest block uppercase">AI Productivity</span>
            </div>
          </div>
          
          <button
            onClick={signInWithGoogle}
            className="rounded-full bg-emerald-800 hover:bg-emerald-900 transition-all text-xs font-bold text-white px-5 py-2.5 shadow-md shadow-emerald-800/10"
          >
            Masuk
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center py-12 px-6 max-w-5xl mx-auto w-full gap-12 md:gap-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400">
            <Sparkles className="h-3 w-3" />
            <span>Next-Gen Proactive Time Manager</span>
          </div>
          
          <h1 className="text-4xl font-extrabold md:text-5xl lg:text-6xl text-amber-950 dark:text-white tracking-tight leading-[1.15]">
            Hentikan Siklus Menunda Tugas dengan <span className="text-emerald-850 dark:text-emerald-500">Otomasi AI</span>
          </h1>
          
          <p className="text-stone-600 dark:text-stone-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            AntiNanti adalah sistem produktivitas adaptif yang memecah tugas besar Anda, menegosiasikan blok waktu, dan memberikan sanksi sosial email otomatis jika Anda melanggar komitmen.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <button
              onClick={signInWithGoogle}
              className="flex-1 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm px-6 py-4 shadow-lg shadow-emerald-800/15 flex items-center justify-center gap-2 transition-all"
            >
              Mulai Sekarang (Google Login) <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Features Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Feature 1 */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:bg-stone-900 dark:border-stone-850 flex flex-col gap-4 shadow-sm hover:border-emerald-850/20 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-850 dark:text-emerald-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 dark:text-amber-50 text-base mb-1">Morning Briefing</h3>
              <p className="text-xs text-stone-500 leading-relaxed dark:text-stone-400">
                Pemicuan Gemini API di pagi hari yang beralaskan pencarian internet real-time (cuaca & kemacetan Jember/UNEJ) untuk menyusun prioritas jadwal pengerjaan Anda.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:bg-stone-900 dark:border-stone-850 flex flex-col gap-4 shadow-sm hover:border-emerald-850/20 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-800 dark:text-amber-400">
              <Timer className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 dark:text-amber-50 text-base mb-1">AI Task Negotiator</h3>
              <p className="text-xs text-stone-500 leading-relaxed dark:text-stone-400">
                AI tidak menerima penundaan tugas secara pasif. Tugas Anda akan dipecah menjadi unit Pomodoro adaptif (&lt;45 menit) yang disepakati langsung dalam dialog interaktif.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl border border-stone-200 bg-white p-6 dark:bg-stone-900 dark:border-stone-850 flex flex-col gap-4 shadow-sm hover:border-emerald-850/20 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-700 dark:text-rose-450">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-amber-950 dark:text-amber-50 text-base mb-1">Sanksi Sosial Otomatis</h3>
              <p className="text-xs text-stone-500 leading-relaxed dark:text-stone-400">
                Setiap kali komitmen waktu dilanggar, backend akan memicu Resend API untuk mengirimkan email teguran langsung ke rekan partner belajar Anda secara otomatis.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/50 py-6 text-center text-xs text-stone-400 dark:border-stone-850 dark:text-stone-500">
        © 2026 AntiNanti - AI-Driven Proactive Productivity Platform.
      </footer>
    </div>
  );
}
