"use client";

import React from "react";
import { Clock, CheckCircle2, Circle, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onToggleMicroTask: (taskId: string, microTaskId: string) => void;
  onStartNegotiation: (task: Task) => void;
}

export function TaskCard({ task, onToggleMicroTask, onStartNegotiation }: TaskCardProps) {
  const completedCount = task.microTasks.filter((mt) => mt.status === "completed").length;
  const totalCount = task.microTasks.length;
  const taskProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="overflow-hidden hover:border-emerald-800/30 transition-all shadow-sm">
      <div className="p-5 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-stone-400 flex items-center gap-1 mb-1">
              <Clock className="h-3 w-3" /> Deadline: {task.deadline}
            </span>
            <h3 className="font-bold text-stone-900 dark:text-white text-base">
              {task.title}
            </h3>
          </div>
          
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            task.status === "completed" 
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
              : task.status === "progress" 
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" 
              : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
          }`}>
            {task.status === "completed" ? "Selesai" : task.status === "progress" ? "Dalam Proses" : "Belum Mulai"}
          </span>
        </div>

        {/* List of Microtasks with Interactive Checkboxes */}
        {task.microTasks.length > 0 && (
          <div className="border-t border-stone-100 pt-3 mt-1 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Pecahan Tugas AI
            </span>
            <div className="flex flex-col gap-2">
              {task.microTasks.map((mt) => (
                <div 
                  key={mt.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-stone-50/60 dark:bg-stone-850 hover:bg-stone-100/50 dark:hover:bg-stone-800 transition-colors"
                >
                  <button
                    onClick={() => onToggleMicroTask(task.id || "", mt.id)}
                    className="flex items-center gap-2 text-left text-xs font-medium text-stone-700 dark:text-stone-300"
                  >
                    {mt.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-800 dark:text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-stone-300 dark:text-stone-600 shrink-0" />
                    )}
                    <span className={mt.status === "completed" ? "line-through text-stone-400" : ""}>
                      {mt.title}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="text-[9px] text-stone-400 font-mono">
                      {mt.duration}m
                    </span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-md ${
                      mt.urgency === "high"
                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                        : mt.urgency === "medium"
                        ? "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
                        : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                    }`}>
                      {mt.urgency.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-stone-500">
            Pecahan: {completedCount}/{totalCount} ({taskProgress}%)
          </div>
          
          <button
            onClick={() => onStartNegotiation(task)}
            className="flex items-center gap-1.5 rounded-full bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-800/10 hover:bg-emerald-900 transition-colors"
          >
            <Play className="h-3 w-3 fill-white" /> Negosiasi dengan AI
          </button>
        </div>
      </div>
    </Card>
  );
}
