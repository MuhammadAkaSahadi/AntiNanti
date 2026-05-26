# Cetak Biru UI/UX: AntiNanti (Mobile-First Dashboard)

Dokumen ini mendikte arsitektur antarmuka, tata letak komponen ShadcnUI, dan skema warna untuk aplikasi AntiNanti, mengadaptasi struktur modular dari sistem dasbor lanjutan.

## 1. Skema Warna & Tema (Soft Earthy Tone)
Menggunakan Tailwind CSS dengan pendekatan variabel CSS tokens:
- **Primary (Hijau Lumut Soft / Sage Green):** `bg-emerald-800` / `#2f4f4f` (Memberikan kesan tenang namun fokus).
- **Secondary (Coklat Kopi Soft / Warm Espresso):** `text-amber-900` / `#4a3b32` (Digunakan untuk teks penekanan dan pembungkus sekunder).
- **Background:** `bg-stone-50` / `#faf9f6` (Putih gading lembut untuk mengurangi kelelahan mata).
- **Accent/Alert (Peringatan Sistem):** `bg-rose-50 text-rose-700 border-rose-200` (Untuk komponen penalti dan teguran keras).

## 2. Struktur Tata Letak (Layout Architecture)

### A. Komponen Sidebar & Navigasi Mobile (`components/sidebar.tsx`)
- **Navigasi Atas (Header):** Menampilkan logo AntiNanti kecil, indikator status sinkronisasi AI (Live), dan komponen `Avatar` dari ShadcnUI yang terhubung ke Firebase Auth.
- **Navigasi Bawah (Mobile Navigation Bar):** Menu berbasis ikon (Lucide React) di bagian bawah layar untuk akses cepat satu jempol:
  - `Home` (Dashboard utama)
  - `Tasks` (Manajemen tugas harian)
  - `AI Chat` (Konsultasi negosiasi prokrastinasi)
  - `Settings` (Konfigurasi email partner akuntabilitas)

### B. Halaman Utama (`app/dashboard/page.tsx`)
1. **Widget 1: Contextual Morning Briefing Card (Bagian Atas)**
   - Menggunakan Shadcn `Card`, `CardHeader`, dan `CardContent`.
   - Menampilkan teks sapaan dinamis hasil olahan Gemini API (Cuaca + Lalu lintas Jember).
   - Menyediakan indikator `Skeleton` beranimasi pulsa jika data sedang di-fetch secara real-time dari Search Grounding.
2. **Widget 2: Micro-Tasking Progress Tracker**
   - Menggunakan komponen `Progress` dari ShadcnUI.
   - Menampilkan persentase sub-tugas yang berhasil diselesaikan hari ini secara visual.
3. **Widget 3: Dynamic Task Negotiation List**
   - Menampilkan daftar tugas dari sub-koleksi Firestore.
   - Setiap tugas memiliki tombol "Mulai Sesi" atau "Negosiasi dengan AI" yang akan membuka komponen `Dialog` (Modal) interaktif.

## 3. Komponen Interaksi Teknis (`hooks/useAntiNantiAI.ts`)
- Menggunakan `useChat` dari Vercel AI SDK.
- Mengirimkan payload JSON mentah berisi kondisi lingkungan saat ini ke rute `/api/chat`.
- Respons yang diterima berupa objek JSON terstruktur yang langsung memetakan state UI secara real-time tanpa penundaan *parsing* manual.