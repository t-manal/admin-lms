import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LATIN_DIGITS_LOCALE_SUFFIX = '-u-nu-latn';
const RIYAL_SYMBOL = '\u20C1';
const CURRENCY_CODE = 'SAR';
let supportsRiyalSymbolCache: boolean | null = null;

export function withLatinDigits(locale = 'en-US') {
  if (!locale) {
    return `en-US${LATIN_DIGITS_LOCALE_SUFFIX}`;
  }

  return locale.includes('-u-nu-')
    ? locale
    : `${locale}${LATIN_DIGITS_LOCALE_SUFFIX}`;
}

function supportsRiyalSymbol() {
  if (supportsRiyalSymbolCache !== null) {
    return supportsRiyalSymbolCache;
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    supportsRiyalSymbolCache = false;
    return supportsRiyalSymbolCache;
  }

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      supportsRiyalSymbolCache = false;
      return supportsRiyalSymbolCache;
    }

    const bodyFont = document.body
      ? window.getComputedStyle(document.body).font
      : '16px sans-serif';

    context.font = bodyFont || '16px sans-serif';
    const symbolWidth = context.measureText(RIYAL_SYMBOL).width;
    const replacementWidth = context.measureText('\uFFFD').width;
    const emptyBoxWidth = context.measureText('\u25A1').width;

    supportsRiyalSymbolCache =
      symbolWidth > 0 &&
      symbolWidth !== replacementWidth &&
      symbolWidth !== emptyBoxWidth;
  } catch {
    supportsRiyalSymbolCache = false;
  }

  return supportsRiyalSymbolCache;
}

export function formatPrice(price: number) {
  const formattedNumber = new Intl.NumberFormat(withLatinDigits('en-US'), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

  const currencyToken = supportsRiyalSymbol() ? RIYAL_SYMBOL : CURRENCY_CODE;
  return `\u2066${currencyToken}\u00A0${formattedNumber}\u2069`;
}
