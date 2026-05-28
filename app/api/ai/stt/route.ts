import { NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { getGeminiApiKeys } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { audioBase64, mimeType } = await req.json();
    if (!audioBase64) {
      return NextResponse.json({ success: false, error: "Audio data wajib diisi" }, { status: 400 });
    }

    const keys = getGeminiApiKeys();
    let lastError: any = null;

    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[i];
      try {
        const google = createGoogleGenerativeAI({ apiKey });
        const model = google("gemini-2.5-flash");
        const response = await generateText({
          model,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "file",
                  data: audioBase64,
                  mediaType: mimeType || "audio/webm"
                },
                {
                  type: "text",
                  text: "Transkripsikan rekaman audio bahasa Indonesia ini secara akurat. Hasilkan hanya teks transkripsinya saja, tanpa tambahan kalimat penjelasan atau komentar apapun."
                }
              ]
            }
          ]
        });

        return NextResponse.json({
          success: true,
          text: response.text.trim()
        });
      } catch (err: any) {
        const errString = JSON.stringify(err).toLowerCase();
        const isQuotaError =
          errString.includes("quota") ||
          errString.includes("rate limit") ||
          errString.includes("exhausted") ||
          errString.includes("resource_exhausted") ||
          err.status === 429;

        if (isQuotaError) {
          console.warn(`[STT API Rotation] Kunci ke-${i+1} terdeteksi limit/kuota habis. Berputar ke kunci berikutnya...`);
          continue;
        }

        console.error(`Error STT menggunakan kunci ke-${i + 1}:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error("Semua kunci API Gemini gagal merespon STT.");
  } catch (error: any) {
    console.error("Kesalahan pada Rute STT:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
