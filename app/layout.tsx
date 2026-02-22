import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Manal Admin',
  description: 'Admin Dashboard',
  icons: {
    icon: '/Manal Alhihi Logo (1).webp',
    shortcut: '/Manal Alhihi Logo (1).webp',
    apple: '/Manal Alhihi Logo (1).webp',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
