import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale) {
    console.log('[i18n/request] Locale missing, falling back to en');
    locale = 'en';
  }

  console.log('[i18n/request] resolved locale:', locale);

  if (!['en', 'ar'].includes(locale)) {
    console.log('[i18n/request] Invalid locale, calling notFound()');
    notFound();
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
