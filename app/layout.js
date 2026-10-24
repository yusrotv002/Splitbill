import './globals.css';

export const metadata = {
  title: 'Patungan Adil',
  description: 'Bagi tagihan makan bareng, adil sesuai pesanan.'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark'
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
