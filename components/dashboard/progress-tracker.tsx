"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Loader2 } from "lucide-react";

interface ProgressTrackerProps {
  completedMicroTasks: number;
  totalMicroTasks: number;
  overallProgress: number;
  onSyncCalendar?: () => void;
  isSyncing?: boolean;
}

export function ProgressTracker({ 
  completedMicroTasks, 
  totalMicroTasks, 
  overallProgress,
  onSyncCalendar,
  isSyncing = false
}: ProgressTrackerProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-3 sm:gap-0">
          <div className="flex flex-col">
            <span className="font-bold text-amber-950 dark:text-amber-50">Progress Micro-Tasks</span>
            <span className="text-xs text-stone-500">
              {completedMicroTasks} dari {totalMicroTasks} sub-tugas selesai hari ini
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            {onSyncCalendar && (
              <button
                onClick={onSyncCalendar}
                disabled={isSyncing || totalMicroTasks === 0}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                title="Sinkronisasikan tugas aktif ke Google Calendar"
              >
                {isSyncing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Calendar className="h-3.5 w-3.5" />
                )}
                {isSyncing ? "Menyinkronkan..." : "Sinkronkan Kalender"}
              </button>
            )}
            <span className="text-lg font-black text-emerald-850 dark:text-emerald-400 shrink-0">{overallProgress}%</span>
          </div>
        </div>
        <Progress value={overallProgress} />
      </CardContent>
    </Card>
  );
}
