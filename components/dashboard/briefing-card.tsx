"use client";

import React from "react";
import { Calendar, RefreshCw, MapPin, TrendingUp } from "lucide-react";
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
}

export function BriefingCard({ isBriefingLoading, briefingData, onRefresh }: BriefingCardProps) {
  return (
    <Card className="border-t-4 border-t-emerald-800 shadow-md">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Selasa, 26 Mei 2026</span>
          </div>
          <CardTitle className="text-2xl font-bold mt-1 text-amber-950 dark:text-amber-50">
            Briefing Pagi AI
          </CardTitle>
        </div>
        <button
          onClick={onRefresh}
          disabled={isBriefingLoading}
          className="rounded-full p-2 text-stone-500 hover:bg-stone-150 hover:text-emerald-800 transition-colors focus:outline-none disabled:opacity-50"
          title="Segarkan Analisis dengan Search Grounding"
        >
          <RefreshCw className={`h-4 w-4 ${isBriefingLoading ? "animate-spin text-emerald-800" : ""}`} />
        </button>
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
