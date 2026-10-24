import HasilTes from './HasilTes';

export const metadata = { title: 'Tes Patungan Adil' };

export default function Page() {
  return (
    <main>
      <h1>Tes otomatis</h1>
      <p className="tagline">
        Menjalankan contoh uji BRIEF.md dan semua kasus error langsung di browser ini.{' '}
        <a href="/">Kembali ke aplikasi</a>
      </p>
      <HasilTes />
    </main>
  );
}
