'use client';

import { useEffect, useState } from 'react';
import { jalankanTes } from '../../lib/tes.js';

export default function HasilTes() {
  const [hasil, setHasil] = useState(null);

  // Dijalankan setelah halaman terbuka supaya tes benar-benar memakai mesin JavaScript browser ini.
  useEffect(() => {
    try {
      setHasil(jalankanTes());
    } catch (e) {
      setHasil([{ grup: 'Error', nama: 'Tes gagal dijalankan', lulus: false, detail: String(e) }]);
    }
  }, []);

  if (!hasil) return <p>Menjalankan tes...</p>;

  const gagal = hasil.filter(t => !t.lulus).length;
  const grup = [...new Set(hasil.map(t => t.grup))];

  return (
    <>
      <div className={gagal ? 'errors' : 'sisa'} id="ringkasan-tes" role="status">
        <strong>{hasil.length - gagal} lulus, {gagal} gagal</strong>
        {gagal ? ' Ada yang tidak sesuai, kirim screenshot halaman ini.' : ' Semua tes lulus.'}
      </div>
      {grup.map(g => (
        <section key={g}>
          <h2>{g}</h2>
          <ul className="daftar-tes">
            {hasil.filter(t => t.grup === g).map(t => (
              <li key={t.nama} className={t.lulus ? 'lulus' : 'gagal'}>
                <span aria-hidden="true">{t.lulus ? '✓' : '✗'}</span> {t.nama}
                {t.detail && <code>{t.detail}</code>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
