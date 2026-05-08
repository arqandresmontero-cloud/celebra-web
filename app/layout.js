import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'Celebra',
  description: 'Regalos que unen',
  icons: {
    icon: '/og-image.jpg',
  },
  openGraph: {
    title: 'Celebra — Regalos que unen',
    description: 'Organizá regalos grupales para cumpleaños de forma fácil',
    url: 'https://celebra-app.vercel.app',
    siteName: 'Celebra',
    images: [
      {
        url: 'https://celebra-app.vercel.app/og-image.jpg',
        width: 504,
        height: 504,
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
