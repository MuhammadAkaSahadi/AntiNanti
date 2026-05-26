"use client";

import React from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
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
  onAskForMoreTime: () => void;
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
          <div className="rounded-2xl bg-stone-100 p-3.5 text-xs text-stone-700 leading-relaxed dark:bg-stone-850 dark:text-stone-300">
            {aiMessage}
          </div>

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
            onClick={onAskForMoreTime}
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
