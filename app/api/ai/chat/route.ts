import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  let message = "";
  let history = [];
  try {
    const body = await req.json();
    message = body.message || "";
    history = body.history || [];

    const systemPrompt = `
Anda adalah AI Procrastination Negotiator pada aplikasi AntiNanti.
Tugas Anda adalah menanggapi alasan penundaan tugas, keluhan, atau pertanyaan produktivitas dari mahasiswa pengguna.

Aturan Respon:
1. Bersikap tegas, suportif, taktis, dan sedikit humoris tetapi tetap menunjukkan urgensi (konsekuensi sanksi email sosial).
2. Tawarkan solusi praktis instan (seperti teknik Pomodoro, aturan 2 menit, atau mencicil paragraf pertama).
3. Jangan biarkan mereka membenarkan penundaan. Counter alasan mereka secara logis dan bersahabat.
4. Gunakan Bahasa Indonesia yang santai tapi sopan (sesuai gaya mahasiswa).
`;

    const chatContext = history
      ? history.map((msg: any) => `${msg.sender === "user" ? "Pengguna" : "AI"}: ${msg.text}`).join("\n")
      : "";

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        reply: z.string().describe("Tanggapan AI untuk membantu dan memotivasi pengguna agar segera bekerja."),
      }),
      prompt: `
Latar belakang instruksi sistem:
${systemPrompt}

Riwayat obrolan sebelumnya (jika ada):
${chatContext}

Pesan terbaru pengguna:
"${message}"
`,
    });

    return NextResponse.json({
      success: true,
      data: object,
    });

  } catch (error: any) {
    console.error("Error in AI Chat API (falling back to smart local negotiator):", error);
    
    const msg = (message || "").toLowerCase();
    let reply = "";
    
    if (msg.includes("malas") || msg.includes("tunda") || msg.includes("nanti") || msg.includes("ogah")) {
      const options = [
        "Saya paham rasa malas itu berat. Tapi tahu tidak? Kemalasan kognitif biasanya hilang dalam 5 menit pertama pengerjaan. Mari lakukan aturan 2 menit: buka draft tugas Anda sekarang, dan tulis baris pertama saja. Momentum akan mengikuti!",
        "Menunggu mood sempurna adalah jebakan utama prokrastinasi. Mood membaik setelah kita mulai bekerja, bukan sebelum. Buka file Anda sekarang, mari kita cicil bagian yang paling mudah!",
        "Rasa malas itu wajar, tetapi membiarkannya menang akan memicu penalti sosial ke partner Anda. Mari kurangi beban mentalnya: berkomitmenlah untuk fokus hanya selama 5 menit saja sekarang."
      ];
      reply = options[Math.floor(Math.random() * options.length)];
    } else if (msg.includes("capek") || msg.includes("lelah") || msg.includes("lemes") || msg.includes("ngantuk") || msg.includes("pusing")) {
      const options = [
        "Jika Anda benar-benar lelah fisik, tidurlah 15 menit. Tapi jika ini lelah mental karena menghindari tugas, mari komitmen kerjakan 10 menit saja sekarang. Setelah itu Anda bebas beristirahat!",
        "Rasa lelah mental sering kali hilang saat kita mulai fokus. Tarik napas dalam-dalam, minum segelas air putih, lalu mari kita selesaikan sub-tugas pertama yang berdurasi paling singkat.",
        "Mari gunakan taktik Pomodoro super pendek: cukup fokus bekerja 15 menit, lalu dapatkan istirahat berkualitas 5 menit. Tubuh dan pikiran Anda akan beradaptasi!"
      ];
      reply = options[Math.floor(Math.random() * options.length)];
    } else if (msg.includes("sulit") || msg.includes("bingung") || msg.includes("berat") || msg.includes("susah") || msg.includes("takut")) {
      const options = [
        "Tugas yang besar memang terasa menakutkan. Kuncinya adalah membaginya menjadi pecahan sekecil mungkin. Jangan pikirkan hasil akhirnya dahulu, fokus saja pada sub-tugas pertama sekarang.",
        "Kebingungan adalah tanda Anda sedang mempelajari hal baru. Mulai dari yang paling Anda pahami. Jika semuanya terasa rumit, mari buat draft coretan kasar terlebih dahulu.",
        "Ingat, tidak ada pekerjaan pertama yang sempurna. Lebih baik buat versi coretan kasar yang jelek sekarang daripada tidak memulai sama sekali. Kita bisa mengeditnya nanti!"
      ];
      reply = options[Math.floor(Math.random() * options.length)];
    } else {
      const options = [
        "Setiap langkah kecil yang Anda ambil hari ini akan meringankan beban Anda besok. Ingat komitmen Anda dan partner akuntabilitas Anda yang mengawasi. Mari mulai sekarang!",
        "Saya di sini untuk membantu Anda tetap disiplin. Jangan biarkan hari ini terlewat tanpa ada progres sama sekali. Pilih satu sub-tugas paling ringan dan mari selesaikan!",
        "Mari kita lawan prokrastinasi bersama-sama. Buka laptop atau buku Anda sekarang, dan beritahu saya jika sub-tugas pertama sudah mulai dikerjakan!"
      ];
      reply = options[Math.floor(Math.random() * options.length)];
    }

    return NextResponse.json({
      success: true,
      data: {
        reply: reply
      }
    });
  }
}
