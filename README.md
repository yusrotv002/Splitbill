# Patungan Adil

Bagi tagihan makan bareng secara adil dalam 10 detik, langsung dari HP. Spesifikasi lengkap ada di [BRIEF.md](BRIEF.md).

Dibuat dengan Next.js (App Router) dan siap di-deploy ke Vercel. Tanpa backend: halaman di-render statis dan semua hitungan jalan di browser.

## Struktur

| File | Isi |
|---|---|
| `lib/patungan.js` | Logika hitung murni (tanpa React/DOM): parsing input, validasi, hitung, format rupiah, teks salin |
| `app/Kalkulator.js` | Tampilan form dan hasil (client component) |
| `app/page.js`, `app/layout.js` | Halaman dan kerangka HTML |
| `app/globals.css` | Gaya, termasuk tema terang/gelap mengikuti setelan HP |
| `lib/tes.js` | Daftar tes logika, dipakai `npm test` dan halaman `/tes` |
| `app/tes/` | Halaman `/tes` yang menjalankan tes di browser |
| `tests/patungan.test.js` | Runner tes untuk Node |

## Jalankan di komputer

Butuh Node.js 20.9 atau lebih baru.

```
npm install
npm run dev
```

Buka `http://localhost:3000`. Untuk mencoba dari HP di Wi-Fi yang sama, jalankan `npm run dev -- -H 0.0.0.0` lalu buka `http://<IP-laptop>:3000`.

## Tes

Panduan lengkap untuk tes manual ada di [PANDUAN-TES.md](PANDUAN-TES.md).

Tes otomatis bisa dijalankan dua cara, isinya sama (`lib/tes.js`):

* Di browser: buka halaman `/tes` di aplikasi yang sudah di-deploy.
* Di komputer:

```
npm test
```

Isinya: contoh uji BRIEF.md, aturan hitung, keempat pilihan pembulatan, 2.000 kasus acak (jumlah angka persis selalu sama dengan total struk), format input, dan semua kasus error. Hasil yang benar: `48 lulus, 0 gagal`.

Cek build produksi (sama dengan yang dijalankan Vercel):

```
npm run build
```

## Deploy ke Vercel

1. Masuk ke vercel.com, pilih **Add New > Project**, lalu import repo ini.
2. Framework terdeteksi otomatis sebagai Next.js. Tidak perlu environment variable.
3. Klik **Deploy**. Setiap push ke `main` otomatis di-deploy ulang, dan setiap pull request dapat link preview sendiri.

## Keputusan yang diambil

* Uang dihitung dalam sen dengan BigInt. Service, PB1, dan tip dibulatkan ke sen terdekat seperti di struk.
* Kalau total tidak habis dibagi (misal 3 orang), selisih 1 sen diberikan ke orang dengan sisa pembagian terbesar. Hasilnya jumlah angka persis semua orang selalu tepat sama dengan total struk.
* Pembulatan "Tidak" berarti dibulatkan ke atas ke rupiah penuh, karena rupiah tidak punya sen dalam praktik.
* Input rupiah: titik, koma, spasi, dan awalan "Rp" diterima sebagai pemisah ribuan. Persen menerima desimal koma atau titik, maksimal 2 angka di belakang koma.
* Kolom rupiah diberi titik ribuan otomatis saat mengetik, posisi kursor tetap.
* Kolom persen yang kosong dianggap 0%. Nama yang kosong diganti "Orang 1", "Orang 2", dan seterusnya.

## Ide berikutnya

Belum dikerjakan karena di luar BRIEF.md:

* Bagikan hasil lewat tombol share bawaan HP (Web Share API) selain salin.
* Simpan setelan service/PB1 terakhir di browser supaya tidak isi ulang.
* Pilihan pembulatan ke bawah atau ke ratusan terdekat.
