# Patungan Adil

**Satu kalimat:** app buat grup makan yang membagi tagihan adil dalam 10 detik.

**Masalah:** hitung patungan + pajak + tip manual itu ribet, sering salah, dan bagi rata terasa tidak adil kalau pesanan beda jauh.

**Pemakai:** teman-teman yang makan bareng, buka dari HP di meja makan.

## Fitur inti

* Input subtotal struk (sebelum pajak).
* Input service %, PB1/pajak %, tip %, dan pilihan pembulatan ke atas (tidak / Rp 500 / Rp 1.000 / Rp 5.000).
* Input nama orang + pesanan pribadi per orang (opsional).
* Sisa subtotal yang tidak tercatat sebagai pesanan pribadi = menu sharing, dibagi rata ke semua orang.
* Semua pesanan pribadi kosong = bagi rata.
* Hasil per orang sudah dibulatkan ke atas, plus angka persisnya.
* Tombol salin hasil untuk ditempel ke grup chat.

## Aturan hitung

* Service = subtotal x service%
* PB1 = (subtotal + service) x PB1% (berlapis, seperti struk resto Indonesia)
* Tip = subtotal x tip%
* Total = subtotal + service + PB1 + tip
* Faktor = total / subtotal
* Bayar per orang = (pesanan pribadi + bagian sharing) x faktor, lalu dibulatkan ke ATAS
* Contoh uji: subtotal 385.000, service 5%, PB1 10%, tip 0 -> total 444.675, faktor 1,155. Pesanan pribadi 55.000 / 145.000 / 43.000 / 72.000 -> sharing 70.000 (17.500/orang) -> persis 83.737,50 / 187.687,50 / 69.877,50 / 103.372,50

## Non-goals

Tanpa login, tanpa riwayat, tanpa payment, tanpa scan struk, tanpa input item satu per satu, tanpa backend/database.

## Selesai jika

1. Angka masuk, hasil langsung muncul.
2. Jumlah tagihan semua orang (sebelum pembulatan) sama dengan total struk; sisa pembulatan ditampilkan.
3. Input aneh keluar pesan error jelas dalam Bahasa Indonesia, dan hasil tidak ditampilkan:
   * subtotal kosong atau 0
   * angka negatif
   * huruf di kolom angka
   * persen di atas 100
   * total pesanan pribadi melebihi subtotal
   * tidak ada orang
4. Nyaman dari HP: lebar 375px tanpa scroll ke samping, keyboard angka muncul otomatis, tombol minimal 44px.
