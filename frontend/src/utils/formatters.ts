/**
 * Formatting Utilities
 * Common formatters for dates, currency, numbers, and other data types
 * Used across components for consistent display formatting
 * Date: 2025-09-14
 */

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

export const formatCurrency = (
  amount: number,
  currency: string = 'IDR',
  locale: string = 'id-ID'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies or locales
    return `${currency} ${amount.toLocaleString()}`;
  }
};

export const formatNumber = (
  value: number,
  locale: string = 'id-ID',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// ============================================================================
// DATE FORMATTING
// ============================================================================

export const formatDate = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return dateObj.toLocaleDateString('en-US', defaultOptions);
};

export const formatDateTime = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return dateObj.toLocaleDateString('en-US', defaultOptions);
};

export const formatTime = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options,
  };

  return dateObj.toLocaleTimeString('en-US', defaultOptions);
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

// ============================================================================
// TEXT FORMATTING
// ============================================================================

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check for Indonesian phone numbers
  if (cleaned.startsWith('62')) {
    // +62 format
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 9)} ${cleaned.substring(9)}`;
  } else if (cleaned.startsWith('0')) {
    // 0xxx format
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 8)}-${cleaned.substring(8)}`;
  }
  
  // Default format
  return phone;
};

export const truncateText = (
  text: string,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatTitle = (text: string): string => {
  if (!text) return '';
  
  return text
    .split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const formatSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============================================================================
// FILE SIZE FORMATTING
// ============================================================================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ============================================================================
// BUSINESS SPECIFIC FORMATTERS
// ============================================================================

export const formatSKU = (sku: string): string => {
  return sku.toUpperCase();
};

export const formatBarcode = (barcode: string): string => {
  // Format barcode with spaces for readability
  if (barcode.length === 13) {
    // EAN-13 format: 1 234567 890123
    return `${barcode.substring(0, 1)} ${barcode.substring(1, 7)} ${barcode.substring(7)}`;
  } else if (barcode.length === 12) {
    // UPC-A format: 123456 789012
    return `${barcode.substring(0, 6)} ${barcode.substring(6)}`;
  }
  
  return barcode;
};

export const formatTaxRate = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`;
};

export const formatDiscount = (
  discount: number,
  type: 'percentage' | 'fixed' = 'percentage',
  currency: string = 'IDR'
): string => {
  if (type === 'percentage') {
    return formatPercentage(discount);
  } else {
    return formatCurrency(discount, currency);
  }
};

export const formatStockLevel = (
  current: number,
  minimum?: number,
  unit?: string
): { text: string; status: 'high' | 'medium' | 'low' | 'out' } => {
  const unitText = unit ? ` ${unit}` : '';
  
  if (current === 0) {
    return {
      text: `Out of stock`,
      status: 'out'
    };
  }
  
  if (minimum && current <= minimum) {
    return {
      text: `${current}${unitText} (Low stock)`,
      status: 'low'
    };
  }
  
  if (minimum && current <= minimum * 2) {
    return {
      text: `${current}${unitText} (Medium stock)`,
      status: 'medium'
    };
  }
  
  return {
    text: `${current}${unitText}`,
    status: 'high'
  };
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // Currency
  formatCurrency,
  formatNumber,
  formatPercentage,
  
  // Date/Time
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  
  // Text
  formatPhoneNumber,
  truncateText,
  capitalizeFirst,
  formatTitle,
  formatSlug,
  
  // File
  formatFileSize,
  
  // Business
  formatSKU,
  formatBarcode,
  formatTaxRate,
  formatDiscount,
  formatStockLevel,
  
  // Validation
  isValidEmail,
  isValidPhoneNumber,
  isValidUrl,
};