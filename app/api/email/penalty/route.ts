import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "Missing RESEND_API_KEY environment variable. Configure this in your Firebase App Hosting secrets."
      }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { displayName, email, partnerEmail, taskTitle } = await req.json();

    if (!partnerEmail) {
      return NextResponse.json({
        success: false,
        error: "Partner email is required to send accountability notification"
      }, { status: 400 });
    }

    const htmlContent = `
      <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: auto; background-color: #faf9f6; border-radius: 16px; border: 1px solid #e7e5e4;">
        <div style="background-color: #991b1b; color: white; padding: 16px; border-radius: 12px; font-weight: bold; text-align: center; margin-bottom: 20px;">
          ⚠️ LAPORAN KEGAGALAN DISIPLIN WAKTU: ANTINANTI
        </div>
        <h2 style="color: #4a3b32; margin-bottom: 8px;">Halo Rekan Belajar,</h2>
        <p style="color: #44403c; font-size: 14px; line-height: 1.6;">
          Email ini dikirimkan secara otomatis oleh sistem akuntabilitas proaktif <strong>AntiNanti</strong>. Rekan Anda:
        </p>
        <div style="background-color: #f5f5f4; padding: 16px; border-radius: 12px; border-left: 4px solid #991b1b; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; color: #1c1917;"><strong>Nama:</strong> ${displayName}</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #1c1917;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #1c1917;"><strong>Komitmen Tugas Yang Dilanggar:</strong> ${taskTitle}</p>
        </div>
        <p style="color: #44403c; font-size: 14px; line-height: 1.6;">
          <strong>${displayName || "Rekan Anda"}</strong> telah gagal menyelesaikan sub-tugas (micro-task) Pomodoro yang sudah disepakati bersama AI dalam batas toleransi waktu yang disetujui. Sebagai partner belajar, Anda dipersilakan untuk memberikan teguran langsung atau membantu rekan Anda kembali fokus.
        </p>
        <div style="margin-top: 24px; font-size: 11px; color: #78716c; text-align: center; border-top: 1px solid #e7e5e4; padding-top: 16px;">
          Dikirim otomatis oleh AntiNanti Productivity Engine. Kebebasan menunda adalah ilusi.
        </div>
      </div>
    `;

    // Send the email using Resend API
    const { data, error } = await resend.emails.send({
      from: "AntiNanti <onboarding@resend.dev>",
      to: partnerEmail,
      subject: `[AntiNanti Penalty] ${displayName} Gagal Menyelesaikan Tugas: ${taskTitle}`,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API delivery error:", error);
      return NextResponse.json({
        success: false,
        error: error.message || "Failed to send email via Resend"
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error("Error sending Resend penalty email:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Internal server error during email dispatch"
    }, { status: 500 });
  }
}
