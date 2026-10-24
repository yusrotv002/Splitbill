// Logika hitung murni (tanpa DOM/React) supaya bisa dites dengan Node.
// Semua uang dihitung dalam sen (BigInt) supaya tidak ada error pembulatan float.
export const PEMBULATAN = [0, 500, 1000, 5000];
const BATAS_RUPIAH = 1e12;

export function parseRupiah(teks, label) {
  let s = String(teks == null ? '' : teks).trim();
  if (s === '') return { kosong: true, nilai: 0 };
  s = s.replace(/^rp\.?\s*/i, '');
  if (/^[-−]/.test(s)) return { error: label + ' tidak boleh negatif.' };
  if (!/^[\d.,\s]+$/.test(s) || !/\d/.test(s)) return { error: label + ' hanya boleh berisi angka.' };
  const nilai = Number(s.replace(/[.,\s]/g, ''));
  if (nilai > BATAS_RUPIAH) return { error: label + ' terlalu besar.' };
  return { nilai: nilai };
}

// Hasil dalam per-seratus persen (2,5% -> 250) supaya bisa dihitung sebagai bilangan bulat.
export function parsePersen(teks, label) {
  let s = String(teks == null ? '' : teks).trim().replace(/\s*%$/, '');
  if (s === '') return { kosong: true, nilai: 0 };
  if (/^[-−]/.test(s)) return { error: label + ' tidak boleh negatif.' };
  const m = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(s);
  if (!m) return { error: label + ' hanya boleh berisi angka persen, contoh 10 atau 2,5.' };
  const nilai = Number(m[1]) * 100 + Number((m[2] || '').padEnd(2, '0'));
  if (nilai > 10000) return { error: label + ' tidak boleh lebih dari 100%.' };
  return { nilai: nilai };
}

function persenDari(sen, perSeratusPersen) {
  // Pembulatan setengah ke atas ke sen terdekat.
  return (sen * BigInt(perSeratusPersen) + 5000n) / 10000n;
}

export function hitung(input) {
  const errors = [];
  const sub = parseRupiah(input.subtotal, 'Subtotal struk');
  if (sub.error) errors.push(sub.error);
  else if (sub.kosong) errors.push('Subtotal struk belum diisi.');
  else if (sub.nilai === 0) errors.push('Subtotal struk harus lebih dari Rp 0.');

  const persen = {};
  [['service', 'Service'], ['pb1', 'PB1/Pajak'], ['tip', 'Tip']].forEach(function (p) {
    const r = parsePersen(input[p[0]], p[1]);
    if (r.error) errors.push(r.error);
    persen[p[0]] = r.nilai || 0;
  });

  const step = Number(input.pembulatan) || 0;
  if (PEMBULATAN.indexOf(step) === -1) errors.push('Pilihan pembulatan tidak dikenal.');

  const orang = (input.orang || []).map(function (o, i) {
    const nama = String(o.nama || '').trim() || 'Orang ' + (i + 1);
    const r = parseRupiah(o.pesanan, 'Pesanan pribadi ' + nama);
    if (r.error) errors.push(r.error);
    return { nama: nama, pribadi: r.nilai || 0 };
  });
  if (orang.length === 0) errors.push('Belum ada orang. Tambahkan minimal satu orang.');

  const totalPribadi = orang.reduce(function (a, o) { return a + o.pribadi; }, 0);
  if (errors.length === 0 && totalPribadi > sub.nilai) {
    errors.push('Total pesanan pribadi (' + formatRupiah(totalPribadi * 100) +
      ') melebihi subtotal (' + formatRupiah(sub.nilai * 100) + ').');
  }
  if (errors.length) return { ok: false, errors: errors };

  const n = BigInt(orang.length);
  const subtotalSen = BigInt(sub.nilai) * 100n;
  const serviceSen = persenDari(subtotalSen, persen.service);
  const pb1Sen = persenDari(subtotalSen + serviceSen, persen.pb1);
  const tipSen = persenDari(subtotalSen, persen.tip);
  const totalSen = subtotalSen + serviceSen + pb1Sen + tipSen;
  const sharing = sub.nilai - totalPribadi;

  // Bobot tiap orang = (pribadi + sharing/n) dikali n, supaya tetap bilangan bulat.
  // Total struk dibagi sesuai bobot; sisa sen dibagi ke sisa pembagian terbesar,
  // jadi jumlah angka persis semua orang selalu sama dengan total struk.
  const W = BigInt(sub.nilai) * n;
  const bagian = orang.map(function (o, i) {
    const w = BigInt(o.pribadi) * n + BigInt(sharing);
    const kali = totalSen * w;
    return { i: i, sen: kali / W, sisa: kali % W };
  });
  let kurang = totalSen - bagian.reduce(function (a, b) { return a + b.sen; }, 0n);
  bagian.slice().sort(function (a, b) {
    return a.sisa === b.sisa ? a.i - b.i : (a.sisa > b.sisa ? -1 : 1);
  }).forEach(function (b) {
    if (kurang > 0n) { b.sen += 1n; kurang -= 1n; }
  });

  const stepSen = BigInt((step || 1) * 100);
  let totalBayarSen = 0n;
  const hasilOrang = orang.map(function (o, i) {
    const persis = bagian[i].sen;
    const bayar = (persis + stepSen - 1n) / stepSen * stepSen;
    totalBayarSen += bayar;
    return {
      nama: o.nama,
      pribadi: o.pribadi,
      persisSen: Number(persis),
      bayar: Number(bayar / 100n)
    };
  });

  return {
    ok: true,
    subtotal: sub.nilai,
    persen: { service: persen.service / 100, pb1: persen.pb1 / 100, tip: persen.tip / 100 },
    serviceSen: Number(serviceSen),
    pb1Sen: Number(pb1Sen),
    tipSen: Number(tipSen),
    totalSen: Number(totalSen),
    faktor: Number(totalSen) / Number(subtotalSen),
    sharing: sharing,
    sharingPerOrangSen: Math.round(sharing * 100 / orang.length),
    pembulatan: step,
    orang: hasilOrang,
    totalBayar: Number(totalBayarSen / 100n),
    sisaPembulatanSen: Number(totalBayarSen - totalSen)
  };
}

export function ribuan(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Terima nilai dalam sen. Desimal hanya ditampilkan kalau ada sen.
export function formatRupiah(sen) {
  const s = Math.round(sen);
  const rp = Math.floor(s / 100);
  const c = s % 100;
  return 'Rp ' + ribuan(rp) + (c ? ',' + String(c).padStart(2, '0') : '');
}

export function formatAngka(x, maksDesimal) {
  return x.toFixed(maksDesimal).replace(/\.?0+$/, '').replace('.', ',');
}

export function teksSalin(h) {
  const baris = [
    'Patungan Adil',
    'Total struk ' + formatRupiah(h.totalSen) + ' (subtotal ' + formatRupiah(h.subtotal * 100) +
      ', service ' + formatAngka(h.persen.service, 2) + '%, PB1 ' + formatAngka(h.persen.pb1, 2) +
      '%, tip ' + formatAngka(h.persen.tip, 2) + '%)',
    ''
  ];
  h.orang.forEach(function (o) {
    baris.push('- ' + o.nama + ': ' + formatRupiah(o.bayar * 100) + ' (persis ' + formatRupiah(o.persisSen) + ')');
  });
  baris.push('');
  baris.push('Total dibayar ' + formatRupiah(h.totalBayar * 100) + ', sisa pembulatan ' + formatRupiah(h.sisaPembulatanSen));
  return baris.join('\n');
}
