import type { Metadata, Viewport } from 'next';
import './globals.css';
import './mobile.css';
import './ambulances-mobile.css';
import ServiceWorkerRegister from './ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'Neram | Chennai Emergency Response',
  description: 'Emergency ambulance coordination for Chennai traffic police.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/neram-icon.svg',
    shortcut: '/icons/neram-icon.svg',
    apple: '/icons/neram-icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Neram',
  },
};

export const viewport: Viewport = {
  themeColor: '#070a10',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body><ServiceWorkerRegister />{children}</body></html>;
}
