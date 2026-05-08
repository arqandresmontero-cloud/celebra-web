import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'Celebra',
  description: 'Regalos grupales para cumpleaños',
  openGraph: {
    title: 'Celebra',
    description: 'Regalos que unen',
    url: 'https://celebra-app.vercel.app',
    siteName: 'Celebra',
    images: [
      {
        url: 'https://celebra-app.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      }
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
