// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to Thai Baht currency string (e.g. ฿1,250.00 or ฿1,250)
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 2,
  }).format(absAmount);

  const sign = amount < 0 ? '-' : '';
  return `${sign}฿${formatted}`;
}

/**
 * Formats a number without currency symbol
 */
export function formatNumber(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Formats date string to Thai formatted date
 * e.g. "19 ก.ย. 2569" or "19 กันยายน 2569"
 */
export function formatThaiDate(dateStr: string | Date, style: 'short' | 'medium' | 'long' = 'medium'): string {
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    const christianYear = date.getFullYear();
    const buddhistYear = christianYear + 543;

    if (style === 'short') {
      const formatted = format(date, 'd MMM', { locale: th });
      return `${formatted} ${buddhistYear.toString().slice(-2)}`;
    } else if (style === 'long') {
      const formatted = format(date, 'd MMMM', { locale: th });
      return `${formatted} พ.ศ. ${buddhistYear}`;
    }

    const formatted = format(date, 'd MMM', { locale: th });
    return `${formatted} ${buddhistYear}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Generates an accessible UUIDv4
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
