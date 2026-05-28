"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface NewTaskFormProps {
  onAddTask: (title: string, deadline: string) => void;
}

const MONTHS = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" }
];

const YEARS = ["2026", "2027", "2028"];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = [
  ...Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")),
  "59"
];

export function NewTaskForm({ onAddTask }: NewTaskFormProps) {
  const [title, setTitle] = useState("");
  
  // Custom dropdown states
  const [day, setDay] = useState("01");
  const [month, setMonth] = useState("05");
  const [year, setYear] = useState("2026");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");

  // Default to 1 hour from now on load
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setHours(defaultDate.getHours() + 1);
    
    setDay(String(defaultDate.getDate()).padStart(2, "0"));
    setMonth(String(defaultDate.getMonth() + 1).padStart(2, "0"));
    setYear(String(defaultDate.getFullYear()));
    setHour(String(defaultDate.getHours()).padStart(2, "0"));
    
    const roundedMins = Math.round(defaultDate.getMinutes() / 5) * 5;
    const finalMins = roundedMins >= 60 ? 55 : roundedMins;
    setMinute(String(finalMins).padStart(2, "0"));
  }, []);

  // Quick Preset Handlers
  const setPreset = (minutesOffset: number) => {
    const target = new Date();
    target.setMinutes(target.getMinutes() + minutesOffset);
    
    setDay(String(target.getDate()).padStart(2, "0"));
    setMonth(String(target.getMonth() + 1).padStart(2, "0"));
    setYear(String(target.getFullYear()));
    setHour(String(target.getHours()).padStart(2, "0"));
    
    const roundedMins = Math.round(target.getMinutes() / 5) * 5;
    const finalMins = roundedMins >= 60 ? 55 : roundedMins;
    setMinute(String(finalMins).padStart(2, "0"));
  };

  const setEndOfDayPreset = (daysOffset: number) => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    
    setDay(String(target.getDate()).padStart(2, "0"));
    setMonth(String(target.getMonth() + 1).padStart(2, "0"));
    setYear(String(target.getFullYear()));
    setHour("23");
    setMinute("59");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Combine to format: YYYY-MM-DDTHH:mm
    const deadline = `${year}-${month}-${day}T${hour}:${minute}`;
    onAddTask(title, deadline);
    
    setTitle("");
  };

  return (
    <Card className="shadow-md border border-stone-200 dark:border-stone-850 dark:bg-stone-950">
      <CardHeader>
        <CardTitle className="text-amber-950 dark:text-amber-50 text-xl font-extrabold">Buat Komitmen Tugas Baru</CardTitle>
        <CardDescription className="text-stone-500 dark:text-stone-400 text-sm">Masuk ke ekosistem produktivitas proaktif. Tugas besar akan dipecah secara cerdas.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-950 uppercase dark:text-stone-400">Nama Tugas Utama</label>
            <input
              type="text"
              placeholder="Contoh: Menulis Paper Jurnal Metodologi Penelitian"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 focus:outline-none"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-950 uppercase dark:text-stone-400">Pilihan Cepat (Presets)</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPreset(30)}
                className="rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 transition-colors cursor-pointer border border-stone-200 dark:border-stone-800"
              >
                +30 Menit
              </button>
              <button
                type="button"
                onClick={() => setPreset(60)}
                className="rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 transition-colors cursor-pointer border border-stone-200 dark:border-stone-800"
              >
                +1 Jam
              </button>
              <button
                type="button"
                onClick={() => setPreset(180)}
                className="rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 transition-colors cursor-pointer border border-stone-200 dark:border-stone-800"
              >
                +3 Jam
              </button>
              <button
                type="button"
                onClick={() => setEndOfDayPreset(0)}
                className="rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 transition-colors cursor-pointer border border-stone-200 dark:border-stone-800"
              >
                Hari Ini (23:59)
              </button>
              <button
                type="button"
                onClick={() => setEndOfDayPreset(1)}
                className="rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 transition-colors cursor-pointer border border-stone-200 dark:border-stone-800"
              >
                Besok (23:59)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-amber-950 uppercase dark:text-stone-400">Atur Tanggal & Waktu Tenggat</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Day */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-stone-455 uppercase tracking-wider">Hari</span>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-800 focus:outline-none"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">{d}</option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[10px] font-bold text-stone-455 uppercase tracking-wider">Bulan</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-800 focus:outline-none"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-stone-455 uppercase tracking-wider">Tahun</span>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-800 focus:outline-none"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">{y}</option>
                  ))}
                </select>
              </div>

              {/* Time */}
              <div className="flex flex-col gap-1 sm:col-span-1 col-span-2">
                <span className="text-[10px] font-bold text-stone-455 uppercase tracking-wider text-left">Pukul</span>
                <div className="flex gap-1 items-center">
                  <select
                    value={hour}
                    onChange={(e) => setHour(e.target.value)}
                    className="flex-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-800 focus:outline-none text-center"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">{h}</option>
                    ))}
                  </select>
                  <span className="text-stone-400 dark:text-stone-500 font-bold">:</span>
                  <select
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="flex-1 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5 text-xs text-stone-900 dark:text-stone-100 focus:ring-1 focus:ring-emerald-800 focus:outline-none text-center"
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white hover:bg-emerald-900 transition-colors shadow-md shadow-emerald-800/10 cursor-pointer"
          >
            Simpan Tugas & Pecah dengan AI
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
