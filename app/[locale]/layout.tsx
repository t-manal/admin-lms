import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Cairo } from 'next/font/google';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { QueryProvider } from './query-provider';

const inter = Inter({ subsets: ['latin'] });
const cairo = Cairo({ subsets: ['arabic'] });

const locales = ['en', 'ar'];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function getDirection(locale: string): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

import { ThemeProvider } from '@/components/providers/theme-provider';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  console.log('[RootLayout] Received locale:', locale);

  if (!locales.includes(locale)) {
    console.log('[RootLayout] Invalid locale, triggering notFound()');
    notFound();
  }

  const messages = await getMessages();
  const direction = getDirection(locale);
  const fontClass = locale === 'ar' ? cairo.className : inter.className;

  return (
    <div dir={direction} className={`${fontClass} min-h-screen bg-background transition-colors duration-300`}>
      <NextTopLoader
        color="#f59e0b"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl={true}
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px #f59e0b, 0 0 5px #f59e0b"
      />
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-center" richColors />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </div>
  );
}

