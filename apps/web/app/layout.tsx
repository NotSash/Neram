import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Neram | Chennai Emergency Response',
  description: 'Emergency ambulance coordination for Chennai traffic police.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
