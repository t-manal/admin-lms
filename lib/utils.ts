import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RIYAL_SIGN = '\u20C1';
const LATIN_DIGITS_LOCALE_SUFFIX = '-u-nu-latn';

export function withLatinDigits(locale = 'en-US') {
  if (!locale) {
    return `en-US${LATIN_DIGITS_LOCALE_SUFFIX}`;
  }

  return locale.includes('-u-nu-')
    ? locale
    : `${locale}${LATIN_DIGITS_LOCALE_SUFFIX}`;
}

export function formatPrice(price: number) {
    const formattedNumber = new Intl.NumberFormat(withLatinDigits('ar-SA'), {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);

    return `\u200E${RIYAL_SIGN}\u00A0${formattedNumber}`;
}
