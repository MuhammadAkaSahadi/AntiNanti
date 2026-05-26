"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressTrackerProps {
  completedMicroTasks: number;
  totalMicroTasks: number;
  overallProgress: number;
}

export function ProgressTracker({ completedMicroTasks, totalMicroTasks, overallProgress }: ProgressTrackerProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex flex-col">
            <span className="font-bold text-amber-950 dark:text-amber-50">Progress Micro-Tasks</span>
            <span className="text-xs text-stone-500">
              {completedMicroTasks} dari {totalMicroTasks} sub-tugas selesai hari ini
            </span>
          </div>
          <span className="text-lg font-black text-emerald-850 dark:text-emerald-400">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} />
      </CardContent>
    </Card>
  );
}
