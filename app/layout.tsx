import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Manal Admin',
  description: 'Admin Dashboard',
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
