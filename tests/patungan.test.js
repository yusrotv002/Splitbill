// Jalankan: npm test
import { jalankanTes } from '../lib/tes.js';

let grup = '';
let gagal = 0;
const hasil = jalankanTes();
for (const t of hasil) {
  if (t.grup !== grup) { grup = t.grup; console.log(grup); }
  if (t.lulus) console.log('  ok   ' + t.nama);
  else { gagal++; console.log('  GAGAL ' + t.nama + (t.detail ? '\n        ' + t.detail : '')); }
}
console.log('\n' + (hasil.length - gagal) + ' lulus, ' + gagal + ' gagal');
process.exit(gagal ? 1 : 0);
