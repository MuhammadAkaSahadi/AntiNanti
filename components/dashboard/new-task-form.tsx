"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface NewTaskFormProps {
  onAddTask: (title: string, deadline: string) => void;
}

export function NewTaskForm({ onAddTask }: NewTaskFormProps) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline.trim()) return;
    onAddTask(title, deadline);
    setTitle("");
    setDeadline("");
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-amber-950 dark:text-amber-50">Buat Komitmen Tugas Baru</CardTitle>
        <CardDescription>Masuk ke ekosistem produktivitas proaktif. Tugas besar akan dipecah secara cerdas.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-950 uppercase dark:text-stone-400">Nama Tugas Utama</label>
            <input
              type="text"
              placeholder="Contoh: Menulis Paper Jurnal Metodologi Penelitian"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-stone-250 p-3 text-sm focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 focus:outline-none dark:border-stone-750 dark:bg-stone-850"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-amber-950 uppercase dark:text-stone-400">Tenggat Waktu (Deadline)</label>
            <input
              type="text"
              placeholder="Contoh: Hari ini, 23:59 WIB atau Besok, 12:00 WIB"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-stone-250 p-3 text-sm focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 focus:outline-none dark:border-stone-750 dark:bg-stone-850"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white hover:bg-emerald-900 transition-colors shadow-md shadow-emerald-800/10"
          >
            Simpan Tugas & Pecah dengan AI
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
