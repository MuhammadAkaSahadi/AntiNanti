"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, UserCheck, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User } from "@/types";
import { UserSchema } from "@/lib/validations/schema";

interface SettingsFormProps {
  userProfile: User;
  onSaveSettings: (data: User) => void;
}

export function SettingsForm({ userProfile, onSaveSettings }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    resolver: zodResolver(UserSchema),
    defaultValues: userProfile,
  });

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-amber-950 dark:text-amber-50">Pengaturan Akun & Akuntabilitas</CardTitle>
        <CardDescription>Konfigurasikan rekan belajar Anda untuk sistem sanksi sosial email otomatis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSaveSettings)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Nama Lengkap</label>
            <div className="relative">
              <input
                type="text"
                {...register("displayName")}
                className={`w-full rounded-xl border p-3 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 focus:outline-none ${
                  errors.displayName ? "border-rose-500 focus:ring-rose-500" : "border-stone-200 dark:border-stone-800"
                }`}
              />
              {errors.displayName && (
                <span className="text-[10px] text-rose-600 block mt-1">{errors.displayName.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Email Pengguna</label>
            <input
              type="email"
              {...register("email")}
              className={`w-full rounded-xl border p-3 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 focus:outline-none ${
                errors.email ? "border-rose-500 focus:ring-rose-500" : "border-stone-200 dark:border-stone-800"
              }`}
            />
            {errors.email && (
              <span className="text-[10px] text-rose-600 block mt-1">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block flex items-center gap-1">
              Email Partner Akuntabilitas
              <span title="Email ini akan dihubungi otomatis oleh Resend API jika Anda gagal menyelesaikan tugas.">
                <HelpCircle className="h-3 w-3 text-stone-400" />
              </span>
            </label>
            <input
              type="email"
              {...register("partnerEmail")}
              placeholder="partner@belajar.com"
              className={`w-full rounded-xl border p-3 text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-900 focus:ring-1 focus:ring-emerald-800 focus:border-emerald-800 focus:outline-none ${
                errors.partnerEmail ? "border-rose-500 focus:ring-rose-500" : "border-stone-200 dark:border-stone-800"
              }`}
            />
            {errors.partnerEmail && (
              <span className="text-[10px] text-rose-600 block mt-1">{errors.partnerEmail.message}</span>
            )}
          </div>

          <div className="rounded-xl bg-amber-50/50 border border-amber-100 p-3 flex gap-2 items-start text-xs text-amber-900 dark:bg-amber-950/10 dark:border-amber-900/20 dark:text-amber-300">
            <Mail className="h-4 w-4 shrink-0 text-amber-800" />
            <span>
              Pastikan email partner aktif. Sistem AntiNanti terintegrasi dengan gateway email Resend API untuk menjamin email terkirim langsung saat komitmen waktu dilanggar.
            </span>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-bold text-white hover:bg-emerald-900 transition-colors shadow-md shadow-emerald-800/10 flex items-center justify-center gap-2"
          >
            <UserCheck className="h-4 w-4" /> Simpan Perubahan Profil
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
