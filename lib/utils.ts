import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RIYAL_SIGN = '\u20C1';

export function formatPrice(price: number) {
    const formattedNumber = new Intl.NumberFormat('ar-SA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(price);

    return `\u200E${RIYAL_SIGN}\u00A0${formattedNumber}`;
}
