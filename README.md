# Patungan Adil

Bagi tagihan makan bareng secara adil dalam 10 detik, langsung dari HP. Spesifikasi lengkap ada di [BRIEF.md](BRIEF.md).

## Pakai

Buka `index.html` di browser (HP atau laptop). Tidak perlu instal, build, atau internet.

Untuk GitHub Pages: Settings > Pages > Deploy from a branch, pilih branch dan folder root. Aplikasinya ada di `https://<user>.github.io/<repo>/`.

## Tes

```
node tests.js
```

Skrip mengambil `<script id="logika">` dari `index.html`, jadi yang dites adalah kode yang sama dengan yang dipakai aplikasi. Isinya: contoh uji BRIEF.md, aturan hitung, keempat pilihan pembulatan, 2.000 kasus acak (jumlah angka persis selalu sama dengan total struk), format input, dan semua kasus error.

## Keputusan yang diambil

* Uang dihitung dalam sen dengan BigInt. Service, PB1, dan tip dibulatkan ke sen terdekat seperti di struk.
* Kalau total tidak habis dibagi (misal 3 orang), selisih 1 sen diberikan ke orang dengan sisa pembagian terbesar. Hasilnya jumlah angka persis semua orang selalu tepat sama dengan total struk.
* Pembulatan "Tidak" berarti dibulatkan ke atas ke rupiah penuh, karena rupiah tidak punya sen dalam praktik.
* Input rupiah: titik, koma, spasi, dan awalan "Rp" diterima sebagai pemisah ribuan. Persen menerima desimal koma atau titik, maksimal 2 angka di belakang koma.
* Kolom persen yang kosong dianggap 0%. Nama yang kosong diganti "Orang 1", "Orang 2", dan seterusnya.

## Ide berikutnya

Belum dikerjakan karena di luar BRIEF.md:

* Bagikan hasil lewat tombol share bawaan HP (Web Share API) selain salin.
* Simpan setelan service/PB1 terakhir di browser supaya tidak isi ulang.
* Pilihan pembulatan ke bawah atau ke ratusan terdekat.
