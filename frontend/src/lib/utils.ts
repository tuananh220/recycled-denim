import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency as Vietnamese Dong: "350.000 VNĐ"
 * (dot as thousand separator, "VNĐ" as suffix)
 */
export function formatCurrency(amount: number | string, _currency = 'VND'): string {
  const n = Number(amount);
  if (Number.isNaN(n)) return '0 VNĐ';
  const formatted = new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
  return `${formatted} VNĐ`;
}

export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

export const formatDateLong = (d: string | Date) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(new Date(d));
