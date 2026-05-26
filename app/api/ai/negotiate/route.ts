import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { taskTitle, microTasks, requestExtension, negotiationRound } = await req.json();

    let systemPrompt = "";

    if (requestExtension) {
      systemPrompt = `
Anda adalah AI Procrastination Negotiator. Pengguna meminta kelonggaran waktu tambahan untuk menyelesaikan tugas "${taskTitle}".
Ini adalah negosiasi ronde ke-${negotiationRound + 1}.

Aturan Negosiasi:
1. Jika ini ronde ke-1 (round 0 -> 1): Berikan kelonggaran tambahan sedikit (misalnya naikkan waktu pengerjaan sub-tugas sebesar +5 menit), namun beri pesan tegas bahwa ini batas toleransi awal.
2. Jika ini ronde ke-2 (round 1 -> 2): Berikan persetujuan akhir namun nyatakan dengan sangat keras bahwa tidak ada penundaan lebih lanjut. Ingatkan bahwa email penalti sosial akan dikirim ke rekan mereka jika mereka melanggar komitmen kali ini.
3. Anda tidak boleh memberikan durasi sub-tugas lebih dari 45 menit.

Kembalikan pecahan tugas yang disesuaikan dalam format JSON terstruktur.
`;
    } else {
      systemPrompt = `
Anda adalah AI Procrastination Negotiator. Tugas Anda adalah memecah tugas utama "${taskTitle}" menjadi sub-tugas Pomodoro taktis agar pengguna tidak menunda pekerjaan.

Aturan Pemecahan Tugas:
- Maksimal 3 pecahan tugas kecil.
- Durasi setiap pecahan tugas tidak boleh lebih dari 45 menit (Teknik Pomodoro adaptif).
- Berikan urgensi yang jelas (Tinggi/Sedang/Rendah) untuk masing-masing pecahan tugas.
- Sapa pengguna dengan tegas dan tawarkan strategi pengerjaan pertama.
`;
    }

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        pesan_utama: z.string(),
        peringatan_sistem: z.string(),
        strategi_tugas: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            duration: z.number(),
            urgency: z.enum(["low", "medium", "high"]),
            status: z.enum(["pending", "progress", "completed"]),
          })
        ),
      }),
      prompt: `
Proses data berikut:
Judul Tugas: "${taskTitle}"
Pecahan Saat Ini: ${JSON.stringify(microTasks, null, 2)}
Latar Belakang Instruksi: ${systemPrompt}
`,
    });

    return NextResponse.json({
      success: true,
      data: object,
    });

  } catch (error: any) {
    console.error("Error in AI Negotiate API:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal Server Error during negotiation"
    }, { status: 500 });
  }
}
