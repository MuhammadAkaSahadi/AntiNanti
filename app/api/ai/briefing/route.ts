import { generateText, generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { withKeyRotation } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { tasks, location } = await req.json();
    const activeLocation = location || "Jember";

    const result = await withKeyRotation(async (google) => {
      // Step 1: Search Grounding to fetch weather and traffic updates dynamically
      const searchGroundingResult = await generateText({
        model: google("gemini-2.5-flash"),
        tools: {
          google_search: google.tools.googleSearch({}),
        },
        prompt: `Cari berita cuaca terkini hari ini di lokasi/wilayah "${activeLocation}" (jika berupa koordinat lat/lon seperti '-7.98, 112.63', cari tahu dulu kota/wilayah tersebut) serta kondisi kemacetan lalu lintas terbaru di jalanan utama sekitar wilayah "${activeLocation}" tersebut.`,
      });

      const groundingInfo = searchGroundingResult.text;

      // Step 2: Structure the output using generateObject (Structured JSON Schema)
      const structuredBriefingPrompt = `
Anda adalah modul backend kecerdasan buatan utama untuk aplikasi AntiNanti.
Berikut adalah informasi lingkungan real-time hasil pencarian Google Search Grounding di lokasi "${activeLocation}":
"${groundingInfo}"

Berikut adalah daftar tugas aktif milik pengguna:
${JSON.stringify(tasks, null, 2)}

Berdasarkan data di atas, tolong buatkan briefing taktis harian dengan mengikuti format skema JSON kaku yang diwajibkan:
1. ringkasan_cuaca: Tuliskan nama lokasi/kota yang dideteksi beserta kondisi cuaca terkininya (contoh: "Malang: Cerah Berawan, 28°C" atau jika koordinat "Jember: Hujan Ringan, 26°C").
2. ringkasan_lalu_lintas: Tuliskan ringkasan singkat kondisi kemacetan atau kelancaran jalanan utama di lokasi tersebut berdasarkan data pencarian internet real-time.
3. pesan_utama: Sapa pengguna secara personal, sebutkan cuaca dan lalu lintas lokasi tersebut secara eksplisit, lalu hubungkan dengan beban tugas aktifnya untuk memberi saran waktu mulai belajar terbaik.
4. strategi_tugas: Rekomendasi 2-3 pecahan tugas kecil (micro-tasks) prioritas dari tugas yang belum selesai, lengkap dengan durasi (menit) dan tingkat urgensinya (Tinggi/Sedang/Rendah).
5. peringatan_sistem: Konsekuensi tegas pemicuan email penalti akuntabilitas jika tugas gagal diselesaikan.
`;

      const { object } = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: z.object({
          ringkasan_cuaca: z.string(),
          ringkasan_lalu_lintas: z.string(),
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

      return { object, groundingInfo };
    });

    return NextResponse.json({
      success: true,
      data: result.object,
      groundingText: result.groundingInfo
    });

  } catch (error: any) {
    console.error("Error in AI Briefing API:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal Server Error during AI briefing processing"
    }, { status: 500 });
  }
}
