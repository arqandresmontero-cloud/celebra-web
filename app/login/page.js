import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const metadata = {
  title: 'Celebra — Regalos que unen',
  description: 'Organizá regalos grupales para cumpleaños de forma fácil. Unite y sorprendé a quien más querés.',
  openGraph: {
    title: 'Celebra — Regalos que unen',
    description: 'Organizá regalos grupales para cumpleaños de forma fácil.',
    url: 'https://celebra-app.vercel.app',
    siteName: 'Celebra',
    images: [{ url: 'https://celebra-app.vercel.app/og-image.jpg', width: 504, height: 504 }],
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
