'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { formatAngka, formatRupiah, hitung, parsePersen, parseRupiah, ribuan, teksSalin } from '../lib/patungan.js';

const PILIHAN_BULAT = [
  { nilai: '0', label: 'Tidak' },
  { nilai: '500', label: 'Rp 500' },
  { nilai: '1000', label: 'Rp 1.000' },
  { nilai: '5000', label: 'Rp 5.000' }
];

const IkonSalin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

const IkonCentang = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

// Format ribuan sambil mengetik. Mengembalikan posisi kursor baru supaya tetap di belakang digit yang sama.
function ketikRupiah(e, simpan) {
  const el = e.target;
  const mentah = el.value;
  const r = parseRupiah(mentah, '');
  if (r.error || r.kosong) {
    simpan(mentah);
    return null;
  }
  const digitSebelum = mentah.slice(0, el.selectionStart ?? mentah.length).replace(/\D/g, '').length;
  const rapi = ribuan(r.nilai);
  simpan(rapi);
  let pos = 0;
  for (let n = 0; pos < rapi.length && n < digitSebelum; pos++) {
    if (/\d/.test(rapi[pos])) n++;
  }
  return { el, pos };
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

function Avatar({ id, nama, urut }) {
  const huruf = nama.trim() ? nama.trim()[0].toUpperCase() : String(urut);
  return <span className={'avatar av' + (id % 6)} aria-hidden="true">{huruf}</span>;
}

export default function Kalkulator() {
  const idBerikut = useRef(2);
  const [subtotal, setSubtotal] = useState('');
  const [persen, setPersen] = useState({ service: '', pb1: '', tip: '' });
  const [pembulatan, setPembulatan] = useState('1000');
  const [orang, setOrang] = useState([
    { id: 0, nama: '', pesanan: '' },
    { id: 1, nama: '', pesanan: '' }
  ]);
  const [tersalin, setTersalin] = useState(null);
  const namaBaru = useRef(null);
  const timerSalin = useRef(null);
  const kursor = useRef(null);
  const kotakError = useRef(null);

  // Dijalankan setelah React menulis nilai baru ke input, jadi posisi kursor tidak ditimpa.
  useLayoutEffect(() => {
    const k = kursor.current;
    kursor.current = null;
    if (k && document.activeElement === k.el) k.el.setSelectionRange(k.pos, k.pos);
  });

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
    setTersalin(ok ? 'ok' : 'gagal');
    clearTimeout(timerSalin.current);
    timerSalin.current = setTimeout(() => setTersalin(null), 2000);
  }

  const invalidRupiah = teks => String(!!parseRupiah(teks, '').error);
  const invalidPersen = teks => String(!!parsePersen(teks, '').error);

  return (
    <>
      <section>
        <h2><span className="langkah">1</span>Struk</h2>
        <div className="field">
          <label htmlFor="subtotal">Subtotal struk (sebelum pajak)</label>
          <div className="prefix-wrap besar"><span>Rp</span>
            <input
              type="text" id="subtotal" inputMode="numeric" autoComplete="off" placeholder="0"
              value={subtotal}
              aria-invalid={invalidRupiah(subtotal)}
              onChange={e => { kursor.current = ketikRupiah(e, setSubtotal); }}
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
          <legend className="label">Bulatkan ke atas</legend>
          <div className="seg-isi">
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
          </div>
        </fieldset>
      </section>

      <section>
        <h2><span className="langkah">2</span>Siapa saja?</h2>
        <div id="daftar-orang">
          {orang.map((o, i) => (
            <div className="orang-row" key={o.id}>
              <Avatar id={o.id} nama={o.nama} urut={i + 1} />
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
                  onChange={e => { kursor.current = ketikRupiah(e, v => ubahOrang(o.id, 'pesanan', v)); }}
                />
              </div>
              <button
                type="button" className="hapus" aria-label={'Hapus orang ' + (i + 1)}
                onClick={() => setOrang(daftar => daftar.filter(x => x.id !== o.id))}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="tambah" id="tambah" onClick={tambahOrang}>+ Tambah orang</button>
        <p className="hint">
          Isi pesanan pribadi kalau ada. Sisa subtotal dianggap menu sharing dan dibagi rata.
          Kosongkan semua untuk bagi rata.
        </p>
      </section>

      {!h.ok && (
        <div className="errors" id="errors" role="alert" ref={kotakError}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" />
          </svg>
          <div>
            <strong>Hasil belum bisa dihitung</strong>
            <ul id="error-list">
              {h.errors.map(e => <li key={e}>{e}</li>)}
            </ul>
          </div>
        </div>
      )}

      {h.ok && (
        <section id="hasil" aria-live="polite">
          <h2><span className="langkah">3</span>Hasil</h2>
          <div className="total-hero">
            <span className="label">Total struk</span>
            <div className="nilai angka">{formatRupiah(h.totalSen)}</div>
            <span className="chip angka">Pengali x{formatAngka(h.faktor, 4)}</span>
          </div>

          <ul className="orang-hasil" id="hasil-orang">
            {h.orang.map((o, i) => (
              <li key={orang[i].id}>
                <div className="baris-orang">
                  <Avatar id={orang[i].id} nama={orang[i].nama} urut={i + 1} />
                  <span>
                    <span className="nama">{o.nama}</span>
                    <span className="rinci angka">
                      Pribadi {formatRupiah(o.pribadi * 100)} + sharing {formatRupiah(h.sharingPerOrangSen)}
                    </span>
                  </span>
                  <span className="bayar angka">
                    <b>{formatRupiah(o.bayar * 100)}</b>
                    <span className="persis">persis {formatRupiah(o.persisSen)}</span>
                  </span>
                </div>
                <div className="porsi" aria-hidden="true">
                  <span style={{ width: (o.persisSen / h.totalSen * 100).toFixed(2) + '%' }} />
                </div>
              </li>
            ))}
          </ul>

          <div className="struk">
            <table className="ringkas">
              <tbody>
                <tr><td>Subtotal</td><td>{formatRupiah(h.subtotal * 100)}</td></tr>
                <tr><td>Service {formatAngka(h.persen.service, 2)}%</td><td>{formatRupiah(h.serviceSen)}</td></tr>
                <tr><td>PB1 {formatAngka(h.persen.pb1, 2)}%</td><td>{formatRupiah(h.pb1Sen)}</td></tr>
                <tr><td>Tip {formatAngka(h.persen.tip, 2)}%</td><td>{formatRupiah(h.tipSen)}</td></tr>
                <tr className="tebal"><td>Total struk</td><td>{formatRupiah(h.totalSen)}</td></tr>
                <tr className="pisah">
                  <td>Menu sharing</td>
                  <td>{formatRupiah(h.sharing * 100)}</td>
                </tr>
                <tr><td>Per orang</td><td>{formatRupiah(h.sharingPerOrangSen)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="sisa angka" id="sisa">
            Total dibayar <b>{formatRupiah(h.totalBayar * 100)}</b>. Sisa pembulatan <b>{formatRupiah(h.sisaPembulatanSen)}</b>
            {h.sisaPembulatanSen > 0 ? ' (lebih dari total struk, bisa jadi tip atau kembalian).' : '.'}
          </div>

          <button type="button" className="salin" id="salin" onClick={salin}>
            {tersalin === 'ok' ? <IkonCentang /> : <IkonSalin />}
            {tersalin === 'ok' ? 'Tersalin, tinggal tempel di grup' : tersalin === 'gagal' ? 'Gagal menyalin' : 'Salin hasil untuk grup chat'}
          </button>
        </section>
      )}

      {h.ok && (
        <div className="bilah">
          <div className="bilah-isi">
            <div className="bilah-teks angka">
              <span className="label">Total dibayar, {h.orang.length} orang</span>
              <b>{formatRupiah(h.totalBayar * 100)}</b>
            </div>
            <button type="button" className="salin" id="salin-cepat" onClick={salin} aria-label="Salin hasil">
              {tersalin === 'ok' ? <IkonCentang /> : <IkonSalin />}
              {tersalin === 'ok' ? 'Tersalin' : 'Salin'}
            </button>
          </div>
        </div>
      )}
      {!h.ok && (
        <div className="bilah salah">
          <div className="bilah-isi">
            <div className="bilah-teks">
              <b>Belum bisa dihitung</b>
              {h.errors[0]}{h.errors.length > 1 ? ' (+' + (h.errors.length - 1) + ' lagi)' : ''}
            </div>
            <button
              type="button" className="lihat"
              onClick={() => kotakError.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            >
              Lihat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
