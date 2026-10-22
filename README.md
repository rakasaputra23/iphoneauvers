# Ponsel AU (WhatsApp) - Next.js

## Jalankan lokal
```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy ke Vercel
1. Push folder ini ke GitHub.
2. vercel.com -> Add New -> Project -> pilih repo -> Deploy (Framework otomatis terdeteksi: Next.js).

Atau lewat CLI: `npm i -g vercel && vercel --prod`

## Struktur
- `app/layout.js`  : metadata, viewport, font
- `app/page.js`    : merender ponsel
- `app/markup.js`  : kerangka HTML ponsel
- `app/globals.css`: seluruh gaya
- `public/phone.js`: logika + **cerita** (ubah objek `STORY` di bagian atas untuk ganti isi chat, nama, cuaca, dll.)

## Catatan
- Kode sandi layar kunci: **5106** (ubah di `public/phone.js`, konstanta `PIN`).
- "Ulangi cerita dari awal" ada di app Pengaturan.
- Saat giliran Anda membalas, cukup ketuk kolom pesan: keyboard naik, pesan diketik otomatis lalu terkirim.
