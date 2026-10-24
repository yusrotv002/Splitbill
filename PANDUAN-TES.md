# Panduan Tes Patungan Adil

Ganti `<link>` dengan alamat aplikasi di Vercel.

## 1. Tes otomatis (1 menit)

Buka `<link>/tes` di HP atau laptop. Halaman ini menjalankan 48 tes langsung di browser: contoh uji BRIEF.md, aturan hitung, pembulatan, 2.000 kasus acak, format input, semua kasus error, dan teks salin.

Lulus kalau kotak di atas menulis **48 lulus, 0 gagal**. Kalau ada yang gagal, barisnya merah beserta angka yang didapat dan yang seharusnya. Kirim screenshot-nya.

Di laptop dengan Node.js, tes yang sama bisa dijalankan dengan `npm test`.

## 2. Tes manual di HP (5 menit)

Buka `<link>` lalu centang satu per satu.

### A. Contoh uji BRIEF (kriteria 1 dan 2)
- [ ] Isi subtotal `385.000`, service `5`, PB1 `10`, tip kosong, pembulatan **Rp 1.000**.
- [ ] Tekan **+ Tambah orang** dua kali sampai ada 4 baris.
- [ ] Isi pesanan pribadi `55.000`, `145.000`, `43.000`, `72.000`.
- [ ] Hasil langsung muncul tanpa menekan tombol apa pun.

| Orang | Bayar | Persis |
|---|---|---|
| 1 | Rp 84.000 | Rp 83.737,50 |
| 2 | Rp 188.000 | Rp 187.687,50 |
| 3 | Rp 70.000 | Rp 69.877,50 |
| 4 | Rp 104.000 | Rp 103.372,50 |

- [ ] Total struk **Rp 444.675**, faktor **1,155**, menu sharing **Rp 70.000 (Rp 17.500/orang)**.
- [ ] Tertulis "Total dibayar Rp 446.000. Sisa pembulatan Rp 1.325".

### B. Bagi rata
- [ ] Kosongkan semua pesanan pribadi. Semua orang mendapat tagihan yang sama.

### C. Pembulatan
- [ ] Ganti ke **Tidak**, **Rp 500**, **Rp 5.000**. Angka "Bayar" berubah, angka "persis" tetap.

### D. Error (kriteria 3)
Setiap baris: hasil harus hilang dan kotak merah muncul dengan pesan ini.

| Lakukan | Pesan |
|---|---|
| Kosongkan subtotal | Subtotal struk belum diisi. |
| Subtotal `0` | Subtotal struk harus lebih dari Rp 0. |
| Service `-5` | Service tidak boleh negatif. |
| Subtotal `38abc` | Subtotal struk hanya boleh berisi angka. |
| Tip `150` | Tip tidak boleh lebih dari 100%. |
| Subtotal `100.000`, pesanan `60.000` dan `50.000` | Total pesanan pribadi (Rp 110.000) melebihi subtotal (Rp 100.000). |
| Hapus semua orang dengan tombol × | Belum ada orang. Tambahkan minimal satu orang. |

### E. Nyaman di HP (kriteria 4)
- [ ] Halaman tidak bisa digeser ke samping.
- [ ] Ketuk kolom subtotal: muncul keyboard angka.
- [ ] Ketuk kolom persen: muncul keyboard angka dengan koma.
- [ ] Semua tombol mudah ditekan dengan jempol.
- [ ] Ganti HP ke mode gelap: tampilan ikut gelap.

### F. Salin hasil
- [ ] Tekan **Salin hasil**, tombol berubah jadi "Tersalin, tinggal tempel di grup".
- [ ] Tempel di WhatsApp: muncul nama, tagihan, dan angka persis tiap orang, plus total dan sisa pembulatan.
