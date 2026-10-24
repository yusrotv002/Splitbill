// Jalankan: npm test
import * as P from '../lib/patungan.js';

let lulus = 0;
let gagal = 0;
function cek(nama, kondisi, detail) {
  if (kondisi) { lulus++; console.log('  ok   ' + nama); }
  else { gagal++; console.log('  GAGAL ' + nama + (detail ? '\n        ' + detail : '')); }
}
function sama(nama, hasil, harap) {
  cek(nama, JSON.stringify(hasil) === JSON.stringify(harap), 'dapat ' + JSON.stringify(hasil) + ', harap ' + JSON.stringify(harap));
}
function orang(...pesanan) {
  return pesanan.map((p, i) => ({ nama: 'O' + (i + 1), pesanan: p }));
}
function dasar(ubah) {
  return Object.assign({ subtotal: '385.000', service: '5', pb1: '10', tip: '0', pembulatan: '1000', orang: orang('', '') }, ubah);
}
function errorBerisi(nama, input, potongan) {
  const h = P.hitung(input);
  cek(nama, !h.ok && h.errors.some(e => e.includes(potongan)) && h.orang === undefined,
    'dapat ' + JSON.stringify(h.ok ? 'ok (hasil tampil)' : h.errors));
}

console.log('Contoh uji BRIEF.md');
{
  const h = P.hitung(dasar({ orang: orang('55.000', '145.000', '43.000', '72.000') }));
  cek('hasil ok', h.ok, JSON.stringify(h.errors));
  sama('total 444.675', P.formatRupiah(h.totalSen), 'Rp 444.675');
  sama('faktor 1,155', P.formatAngka(h.faktor, 4), '1,155');
  sama('sharing 70.000', h.sharing, 70000);
  sama('sharing 17.500/orang', P.formatRupiah(h.sharingPerOrangSen), 'Rp 17.500');
  sama('angka persis', h.orang.map(o => P.formatRupiah(o.persisSen)),
    ['Rp 83.737,50', 'Rp 187.687,50', 'Rp 69.877,50', 'Rp 103.372,50']);
  sama('bayar dibulatkan ke atas Rp 1.000', h.orang.map(o => o.bayar), [84000, 188000, 70000, 104000]);
  sama('jumlah persis = total struk', h.orang.reduce((a, o) => a + o.persisSen, 0), h.totalSen);
  sama('sisa pembulatan', P.formatRupiah(h.sisaPembulatanSen), 'Rp 1.325');
  sama('total dibayar - total struk = sisa', h.totalBayar * 100 - h.totalSen, h.sisaPembulatanSen);
}

console.log('Aturan hitung');
{
  const h = P.hitung(dasar({ subtotal: '100.000', service: '5', pb1: '10', tip: '2,5', pembulatan: '0', orang: orang('', '', '') }));
  sama('service = subtotal x %', h.serviceSen, 500000);
  sama('PB1 berlapis = (subtotal + service) x %', h.pb1Sen, 1050000);
  sama('tip = subtotal x % (desimal koma)', h.tipSen, 250000);
  sama('total', h.totalSen, 11800000);
  sama('semua pribadi kosong = bagi rata (persis)', h.orang.map(o => o.persisSen), [3933334, 3933333, 3933333]);
  sama('jumlah persis = total struk walau tidak habis dibagi', h.orang.reduce((a, o) => a + o.persisSen, 0), h.totalSen);
  sama('pembulatan "tidak" = ke atas ke rupiah penuh', h.orang.map(o => o.bayar), [39334, 39334, 39334]);
}
[
  ['500', [74500, 74500]],
  ['1000', [75000, 75000]],
  ['5000', [75000, 75000]]
].forEach(([step, harap]) => {
  const h = P.hitung(dasar({ subtotal: '129.000', service: '0', pb1: '15', pembulatan: step }));
  sama('pembulatan Rp ' + step + ' (persis 74.175)', h.orang.map(o => o.bayar), harap);
});
{
  const h = P.hitung(dasar({ subtotal: '100.000', service: '0', pb1: '0', pembulatan: '5000', orang: orang('50.000', '50.000') }));
  sama('angka sudah pas tidak dinaikkan', h.orang.map(o => o.bayar), [50000, 50000]);
  sama('sisa pembulatan 0', h.sisaPembulatanSen, 0);
}
{
  const h = P.hitung(dasar({ subtotal: '100000', orang: orang('100.000', '') }));
  sama('pribadi = subtotal boleh, sharing 0', [h.ok, h.sharing], [true, 0]);
  const satu = P.hitung(dasar({ orang: orang('') }));
  sama('satu orang bayar seluruh total', satu.orang[0].persisSen, satu.totalSen);
}
{
  // Uji acak: jumlah angka persis selalu sama dengan total struk.
  let semuaPas = true;
  let seed = 7;
  const acak = n => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let k = 0; k < 2000; k++) {
    const sub = 1000 + acak(5000000);
    const jml = 1 + acak(12);
    const pes = [];
    let sisa = sub;
    for (let i = 0; i < jml; i++) { const p = acak(2) ? acak(sisa + 1) : 0; sisa -= p; pes.push(String(p)); }
    const h = P.hitung({ subtotal: String(sub), service: String(acak(11)), pb1: acak(100) + ',' + acak(10),
      tip: String(acak(20)), pembulatan: String([0, 500, 1000, 5000][acak(4)]), orang: orang(...pes) });
    const jumlah = h.orang.reduce((a, o) => a + o.persisSen, 0);
    const bayar = h.orang.reduce((a, o) => a + o.bayar * 100, 0);
    if (!h.ok || jumlah !== h.totalSen || bayar - h.totalSen !== h.sisaPembulatanSen ||
        h.orang.some(o => o.bayar * 100 < o.persisSen)) { semuaPas = false; break; }
  }
  cek('2000 kasus acak: jumlah persis = total, bayar >= persis', semuaPas);
}

console.log('Format input');
sama('titik ribuan', P.parseRupiah('385.000', 'X').nilai, 385000);
sama('koma ribuan', P.parseRupiah('385,000', 'X').nilai, 385000);
sama('awalan Rp', P.parseRupiah('Rp 385.000', 'X').nilai, 385000);
sama('persen koma', P.parsePersen('2,5', 'X').nilai, 250);
sama('persen titik', P.parsePersen('2.5', 'X').nilai, 250);
sama('persen 100 boleh', P.parsePersen('100', 'X').nilai, 10000);
sama('format rupiah', P.formatRupiah(123456700), 'Rp 1.234.567');

console.log('Kasus error (hasil tidak ditampilkan)');
errorBerisi('subtotal kosong', dasar({ subtotal: '' }), 'Subtotal struk belum diisi');
errorBerisi('subtotal spasi saja', dasar({ subtotal: '   ' }), 'Subtotal struk belum diisi');
errorBerisi('subtotal 0', dasar({ subtotal: '0' }), 'harus lebih dari Rp 0');
errorBerisi('subtotal negatif', dasar({ subtotal: '-50.000' }), 'Subtotal struk tidak boleh negatif');
errorBerisi('service negatif', dasar({ service: '-5' }), 'Service tidak boleh negatif');
errorBerisi('pesanan negatif', dasar({ orang: orang('-10.000', '') }), 'Pesanan pribadi O1 tidak boleh negatif');
errorBerisi('huruf di subtotal', dasar({ subtotal: '38abc' }), 'Subtotal struk hanya boleh berisi angka');
errorBerisi('huruf di persen', dasar({ pb1: 'sepuluh' }), 'PB1/Pajak hanya boleh berisi angka');
errorBerisi('huruf di pesanan', dasar({ orang: orang('lima puluh', '') }), 'Pesanan pribadi O1 hanya boleh berisi angka');
errorBerisi('persen di atas 100', dasar({ tip: '101' }), 'Tip tidak boleh lebih dari 100%');
errorBerisi('persen 100,5', dasar({ service: '100,5' }), 'Service tidak boleh lebih dari 100%');
errorBerisi('pesanan pribadi melebihi subtotal', dasar({ subtotal: '100.000', orang: orang('60.000', '50.000') }),
  'Total pesanan pribadi (Rp 110.000) melebihi subtotal (Rp 100.000)');
errorBerisi('tidak ada orang', dasar({ orang: [] }), 'Belum ada orang');
{
  const h = P.hitung({ subtotal: '', service: 'x', pb1: '200', tip: '-1', pembulatan: '1000', orang: [] });
  cek('banyak error sekaligus dilaporkan', !h.ok && h.errors.length === 5, JSON.stringify(h.errors));
}

console.log('Teks salin');
{
  const h = P.hitung(dasar({ orang: [
    { nama: 'Andi', pesanan: '55.000' }, { nama: 'Budi', pesanan: '145.000' },
    { nama: 'Citra', pesanan: '43.000' }, { nama: 'Dewi', pesanan: '72.000' }] }));
  const t = P.teksSalin(h);
  cek('memuat tiap orang', t.includes('- Andi: Rp 84.000 (persis Rp 83.737,50)') && t.includes('- Dewi: Rp 104.000 (persis Rp 103.372,50)'), t);
  cek('memuat total dan sisa', t.includes('Total struk Rp 444.675') && t.includes('sisa pembulatan Rp 1.325'), t);
}

console.log('\n' + lulus + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
