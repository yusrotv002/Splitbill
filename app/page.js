import Kalkulator from './Kalkulator';

export default function Page() {
  return (
    <main>
      <header className="kepala">
        <div className="logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3v18M12 12l6.4-6.4" />
          </svg>
        </div>
        <div>
          <h1>Patungan Adil</h1>
          <p className="tagline">Bagi tagihan makan bareng, adil sesuai pesanan.</p>
        </div>
      </header>
      <Kalkulator />
    </main>
  );
}
