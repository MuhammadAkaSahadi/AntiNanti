import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { tasks } = await req.json();

    // Step 1: Search Grounding to fetch weather and traffic updates in Jember
    const searchGroundingResult = await generateText({
      model: google("gemini-2.5-flash"),
      tools: {
        google_search: google.tools.googleSearch({}),
      },
      prompt: "Cari berita cuaca terkini hari ini di Jember serta kemacetan lalu lintas terbaru di sekitar gerbang Universitas Jember (UNEJ) terutama Jalan Kalimantan dan Jalan Jawa.",
    });

    const groundingInfo = searchGroundingResult.text;

    // Step 2: Structure the output using generateObject (Structured JSON Schema)
    const structuredBriefingPrompt = `
Anda adalah modul backend kecerdasan buatan utama untuk aplikasi AntiNanti.
Berikut adalah informasi lingkungan real-time hasil pencarian Google Search Grounding:
"${groundingInfo}"

Berikut adalah daftar tugas aktif milik pengguna:
${JSON.stringify(tasks, null, 2)}

Berdasarkan data di atas, tolong buatkan briefing taktis harian dengan mengikuti format skema JSON kaku yang diwajibkan:
1. pesan_utama: Sapa pengguna secara personal, sebutkan ringkasan cuaca Jember dan lalu lintas gerbang kampus UNEJ secara eksplisit dari internet, lalu hubungkan dengan beban tugas aktifnya untuk memberi saran waktu mulai belajar terbaik.
2. strategi_tugas: Rekomendasi 2-3 pecahan tugas kecil (micro-tasks) prioritas dari tugas yang belum selesai, lengkap dengan durasi (menit) dan tingkat urgensinya (Tinggi/Sedang/Rendah).
3. peringatan_sistem: Konsekuensi tegas pemicuan email penalti akuntabilitas jika tugas gagal diselesaikan.
`;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: z.object({
        pesan_utama: z.string(),
        peringatan_sistem: z.string(),
        strategi_tugas: z.array(
          z.object({
            nama_tugas_kecil: z.string(),
            durasi_menit: z.number(),
            tingkat_urgency: z.enum(["Tinggi", "Sedang", "Rendah"]),
          })
        ),
      }),
      prompt: structuredBriefingPrompt,
    });

    return NextResponse.json({
      success: true,
      data: object,
      groundingText: groundingInfo
    });

  } catch (error: any) {
    console.error("Error in AI Briefing API:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal Server Error during AI briefing processing"
    }, { status: 500 });
  }
}
