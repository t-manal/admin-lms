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
    const SIZE = 40;
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      supportsRiyalSymbolCache = false;
      return supportsRiyalSymbolCache;
    }

    const bodyFont = document.body
      ? window.getComputedStyle(document.body).font
      : '16px sans-serif';
    ctx.font = bodyFont || '16px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';

    // Draw the Riyal symbol
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillText(RIYAL_SYMBOL, 4, SIZE / 2);
    const riyalPixels = ctx.getImageData(0, 0, SIZE, SIZE).data;

    // Draw a known-unsupported codepoint (unassigned in Unicode)
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillText('\u0378', 4, SIZE / 2);
    const unsupportedPixels = ctx.getImageData(0, 0, SIZE, SIZE).data;

    // Compare pixel data — if identical, the Riyal rendered as the same
    // fallback glyph (tofu box) as the unsupported character
    let identical = true;
    for (let i = 0; i < riyalPixels.length; i++) {
      if (riyalPixels[i] !== unsupportedPixels[i]) {
        identical = false;
        break;
      }
    }

    supportsRiyalSymbolCache = !identical;
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
