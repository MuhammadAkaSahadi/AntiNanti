import { NextResponse } from "next/server";
import { getGeminiApiKeys } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ success: false, error: "Teks wajib diisi" }, { status: 400 });
    }

    const cleanText = text.replace(/[*_#`~]/g, "").trim();
    const wrappedText = `Read the following text transcript aloud exactly as written. Do not add any extra text or response. Generate only the audio output:\n\n"${cleanText}"`;

    const keys = getGeminiApiKeys();
    let lastError: any = null;

    for (let i = 0; i < keys.length; i++) {
      const apiKey = keys[i];
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: wrappedText }]
              }
            ],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Aoede" // Suara native Indonesia yang jernih
                  }
                }
              }
            }
          })
        });

        const data = await response.json();
        
        if (response.status === 200 && data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
          return NextResponse.json({
            success: true,
            audioBase64: data.candidates[0].content.parts[0].inlineData.data
          });
        }

        const dataString = JSON.stringify(data).toLowerCase();
        const isQuotaError =
          response.status === 429 ||
          dataString.includes("quota") ||
          dataString.includes("rate limit") ||
          dataString.includes("exhausted") ||
          dataString.includes("resource_exhausted");

        if (isQuotaError) {
          console.warn(`[TTS API Rotation] Kunci ke-${i+1} terdeteksi limit/kuota habis. Berputar ke kunci berikutnya...`);
          continue;
        }

        throw new Error(data.error?.message || "Gagal membangkitkan audio TTS.");
      } catch (err: any) {
        console.error(`Error TTS menggunakan kunci ke-${i + 1}:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error("Semua kunci API Gemini gagal merespon TTS.");
  } catch (error: any) {
    console.error("Kesalahan pada Rute TTS:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
