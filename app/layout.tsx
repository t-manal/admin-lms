import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://admin.manalalhihi.com'),
  title: 'T.MANAL ALHIHI',
  description: 'Educational Platform',
  applicationName: 'T.MANAL LMS',
  authors: [{ name: 'INKSPIRE' }],
  creator: 'INKSPIRE',
  publisher: 'INKSPIRE',
  icons: {
    icon: '/favicon.webp',
    shortcut: '/favicon.webp',
    apple: '/favicon.webp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
