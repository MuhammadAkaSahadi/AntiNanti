"use client";

import React from "react";
import { LayoutDashboard, CheckSquare, MessageSquare, Settings, Sparkles, User, LogOut } from "lucide-react";

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout?: () => void;
}

export function Sidebar({ currentTab, setCurrentTab, onLogout }: NavigationProps) {
  const menuItems = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "tasks", label: "Manajemen Tugas", icon: CheckSquare },
    { id: "chat", label: "AI Negotiator", icon: MessageSquare },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <>
      {/* HEADER ATAS (Untuk Mobile & Desktop) */}
      <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/80 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/80">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            {/* Logo AntiNanti */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-md shadow-emerald-800/20">
              <span className="text-lg font-black tracking-tighter">AN</span>
            </div>
            <div>
              <span className="text-base font-bold text-stone-900 dark:text-white leading-none block">
                AntiNanti
              </span>
              <span className="text-[10px] text-stone-400 block -mt-0.5">
                AI Productivity
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status AI Live */}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] md:text-xs">AI Sync: Live</span>
            </div>

            {/* Avatar Pengguna */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-900/10 border border-amber-900/20 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              <User className="h-4 w-4" />
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR DESKTOP (Kiri) */}
      <aside className="fixed bottom-0 top-16 left-0 z-30 hidden w-64 border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950 md:flex flex-col justify-between">
        <div className="flex flex-col gap-4 p-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold tracking-wider text-stone-500 uppercase">
              Menu Utama
            </h2>
            <nav className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-800 text-white shadow-md shadow-emerald-800/10"
                        : "text-stone-600 hover:bg-stone-50 hover:text-amber-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {onLogout && (
          <div className="p-4 border-t border-stone-100 dark:border-stone-850">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-700 hover:bg-rose-50 hover:text-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-300 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Keluar Sesi
            </button>
          </div>
        )}
      </aside>

      {/* NAVIGASI BAWAH MOBILE (Floating Bottom Bar) */}
      <nav className="fixed bottom-4 left-4 right-4 z-40 flex h-16 items-center justify-around rounded-2xl border border-stone-200/80 bg-white/90 shadow-lg shadow-stone-900/5 backdrop-blur-md dark:border-stone-850 dark:bg-stone-950/90 md:hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 transition-all duration-200 ${
                isActive
                  ? "text-emerald-800 font-semibold"
                  : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-250"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-rose-500 hover:text-rose-700 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px]">Keluar</span>
          </button>
        )}
      </nav>
    </>
  );
}
