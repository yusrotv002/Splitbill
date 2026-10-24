'use client';

import { useMemo, useRef, useState } from 'react';
import { formatAngka, formatRupiah, hitung, parsePersen, parseRupiah, ribuan, teksSalin } from '../lib/patungan.js';

const PILIHAN_BULAT = [
  { nilai: '0', label: 'Tidak' },
  { nilai: '500', label: 'Rp 500' },
  { nilai: '1000', label: 'Rp 1.000' },
  { nilai: '5000', label: 'Rp 5.000' }
];

function rapikanRupiah(teks) {
  const r = parseRupiah(teks, '');
  return !r.error && !r.kosong ? ribuan(r.nilai) : teks;
}

async function salinKeClipboard(teks) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(teks);
      return true;
    } catch (e) {
      // lanjut ke cara cadangan
    }
  }
  const ta = document.createElement('textarea');
  ta.value = teks;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  ta.remove();
  return ok;
}

export default function Kalkulator() {
  const idBerikut = useRef(3);
  const [subtotal, setSubtotal] = useState('');
  const [persen, setPersen] = useState({ service: '', pb1: '', tip: '' });
  const [pembulatan, setPembulatan] = useState('1000');
  const [orang, setOrang] = useState([
    { id: 1, nama: '', pesanan: '' },
    { id: 2, nama: '', pesanan: '' }
  ]);
  const [statusSalin, setStatusSalin] = useState('');
  const namaBaru = useRef(null);

  const h = useMemo(
    () => hitung({ subtotal, ...persen, pembulatan, orang }),
    [subtotal, persen, pembulatan, orang]
  );

  function ubahOrang(id, kolom, nilai) {
    setOrang(daftar => daftar.map(o => (o.id === id ? { ...o, [kolom]: nilai } : o)));
  }

  function tambahOrang() {
    const id = idBerikut.current++;
    namaBaru.current = id;
    setOrang(daftar => [...daftar, { id, nama: '', pesanan: '' }]);
  }

  async function salin() {
    if (!h.ok) return;
    const ok = await salinKeClipboard(teksSalin(h));
    setStatusSalin(ok ? 'Tersalin, tinggal tempel di grup' : 'Gagal menyalin');
    setTimeout(() => setStatusSalin(''), 2000);
  }

  const invalidRupiah = teks => String(!!parseRupiah(teks, '').error);
  const invalidPersen = teks => String(!!parsePersen(teks, '').error);

  return (
    <>
      <section>
        <h2>Struk</h2>
        <div className="field">
          <label htmlFor="subtotal">Subtotal struk (sebelum pajak)</label>
          <div className="prefix-wrap"><span>Rp</span>
            <input
              type="text" id="subtotal" inputMode="numeric" autoComplete="off" placeholder="385.000"
              value={subtotal}
              aria-invalid={invalidRupiah(subtotal)}
              onChange={e => setSubtotal(e.target.value)}
              onBlur={e => setSubtotal(rapikanRupiah(e.target.value))}
            />
          </div>
        </div>
        <div className="field grid3">
          {[['service', 'Service'], ['pb1', 'PB1/Pajak'], ['tip', 'Tip']].map(([kunci, label]) => (
            <div key={kunci}>
              <label htmlFor={kunci}>{label}</label>
              <div className="suffix-wrap">
                <input
                  type="text" id={kunci} inputMode="decimal" autoComplete="off" placeholder="0"
                  value={persen[kunci]}
                  aria-invalid={invalidPersen(persen[kunci])}
                  onChange={e => setPersen(p => ({ ...p, [kunci]: e.target.value }))}
                />
                <span>%</span>
              </div>
            </div>
          ))}
        </div>
        <fieldset className="field seg">
          <legend>Bulatkan ke atas</legend>
          {PILIHAN_BULAT.map(p => (
            <span key={p.nilai} style={{ display: 'contents' }}>
              <input
                type="radio" name="bulat" id={'bulat' + p.nilai} value={p.nilai}
                checked={pembulatan === p.nilai}
                onChange={() => setPembulatan(p.nilai)}
              />
              <label htmlFor={'bulat' + p.nilai}>{p.label}</label>
            </span>
          ))}
        </fieldset>
      </section>

      <section>
        <h2>Orang</h2>
        <div className="orang-head"><span>Nama</span><span>Pesanan pribadi</span><span></span></div>
        <div id="daftar-orang">
          {orang.map((o, i) => (
            <div className="orang-row" key={o.id}>
              <input
                type="text" className="nama-orang" autoComplete="off"
                placeholder={'Orang ' + (i + 1)}
                aria-label={'Nama orang ' + (i + 1)}
                value={o.nama}
                autoFocus={namaBaru.current === o.id}
                onChange={e => ubahOrang(o.id, 'nama', e.target.value)}
              />
              <div className="prefix-wrap"><span>Rp</span>
                <input
                  type="text" className="pesanan-orang" inputMode="numeric" autoComplete="off" placeholder="0"
                  aria-label={'Pesanan pribadi orang ' + (i + 1)}
                  value={o.pesanan}
                  aria-invalid={invalidRupiah(o.pesanan)}
                  onChange={e => ubahOrang(o.id, 'pesanan', e.target.value)}
                  onBlur={e => ubahOrang(o.id, 'pesanan', rapikanRupiah(e.target.value))}
                />
              </div>
              <button
                type="button" className="hapus" aria-label={'Hapus orang ' + (i + 1)}
                onClick={() => setOrang(daftar => daftar.filter(x => x.id !== o.id))}
              >
                {'×'}
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="tambah" id="tambah" onClick={tambahOrang}>+ Tambah orang</button>
        <p className="hint">Pesanan pribadi boleh dikosongkan. Sisa subtotal dianggap menu sharing dan dibagi rata.</p>
      </section>

      {!h.ok && (
        <div className="errors" id="errors" role="alert">
          <strong>Hasil belum bisa dihitung:</strong>
          <ul id="error-list">
            {h.errors.map(e => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      {h.ok && (
        <section id="hasil" aria-live="polite">
          <h2>Hasil</h2>
          <ul className="orang-hasil" id="hasil-orang">
            {h.orang.map((o, i) => (
              <li key={i}>
                <span className="nama">
                  {o.nama}
                  <span className="rinci">
                    Pribadi {formatRupiah(o.pribadi * 100)} + sharing {formatRupiah(h.sharingPerOrangSen)}
                  </span>
                </span>
                <span className="bayar">
                  <b>{formatRupiah(o.bayar * 100)}</b>
                  <span className="persis">persis {formatRupiah(o.persisSen)}</span>
                </span>
              </li>
            ))}
          </ul>
          <table className="ringkas">
            <tbody>
              <tr><td>Subtotal</td><td>{formatRupiah(h.subtotal * 100)}</td></tr>
              <tr><td>Service {formatAngka(h.persen.service, 2)}%</td><td>{formatRupiah(h.serviceSen)}</td></tr>
              <tr><td>PB1 {formatAngka(h.persen.pb1, 2)}%</td><td>{formatRupiah(h.pb1Sen)}</td></tr>
              <tr><td>Tip {formatAngka(h.persen.tip, 2)}%</td><td>{formatRupiah(h.tipSen)}</td></tr>
              <tr className="tebal"><td>Total struk</td><td>{formatRupiah(h.totalSen)}</td></tr>
              <tr><td>Faktor pengali</td><td>{formatAngka(h.faktor, 4)}</td></tr>
              <tr>
                <td>Menu sharing</td>
                <td>{formatRupiah(h.sharing * 100)} ({formatRupiah(h.sharingPerOrangSen)}/orang)</td>
              </tr>
            </tbody>
          </table>
          <div className="sisa" id="sisa">
            Total dibayar {formatRupiah(h.totalBayar * 100)}. Sisa pembulatan {formatRupiah(h.sisaPembulatanSen)}
            {h.sisaPembulatanSen > 0 ? ' (lebih dari total struk, bisa jadi tip atau kembalian).' : '.'}
          </div>
          <button type="button" className="salin" id="salin" onClick={salin}>
            {statusSalin || 'Salin hasil'}
          </button>
        </section>
      )}
    </>
  );
}
