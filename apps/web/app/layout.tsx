import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Neram | Chennai Emergency Response',
  description: 'Emergency ambulance coordination for Chennai traffic police.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#070a10',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}</body></html>;
}
