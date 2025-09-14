// Error handling utilities for the ERP system
import { PostgrestError } from '@supabase/supabase-js'

// Error types
export interface AppError {
  code: string
  message: string
  details?: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: any
}

// Error codes
export const ERROR_CODES = {
  // Authentication
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE',
  
  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',
  UNIQUE_VIOLATION: 'UNIQUE_VIOLATION',
  
  // Business Logic
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INVALID_OPERATION: 'INVALID_OPERATION',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  
  // System
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const

// Error messages in Bahasa Indonesia
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Anda harus login terlebih dahulu',
  [ERROR_CODES.AUTH_INVALID]: 'Email atau password salah',
  [ERROR_CODES.AUTH_EXPIRED]: 'Sesi Anda telah berakhir, silakan login kembali',
  [ERROR_CODES.PERMISSION_DENIED]: 'Anda tidak memiliki izin untuk melakukan tindakan ini',
  
  [ERROR_CODES.VALIDATION_FAILED]: 'Data yang dimasukkan tidak valid',
  [ERROR_CODES.REQUIRED_FIELD]: 'Field ini wajib diisi',
  [ERROR_CODES.INVALID_FORMAT]: 'Format data tidak valid',
  [ERROR_CODES.DUPLICATE_VALUE]: 'Data sudah ada, tidak boleh duplikasi',
  
  [ERROR_CODES.DATABASE_ERROR]: 'Terjadi kesalahan pada database',
  [ERROR_CODES.RECORD_NOT_FOUND]: 'Data tidak ditemukan',
  [ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Data masih digunakan di tempat lain',
  [ERROR_CODES.UNIQUE_VIOLATION]: 'Data sudah ada, tidak boleh duplikasi',
  
  [ERROR_CODES.INSUFFICIENT_STOCK]: 'Stok tidak mencukupi',
  [ERROR_CODES.INVALID_OPERATION]: 'Operasi tidak valid',
  [ERROR_CODES.BUSINESS_RULE_VIOLATION]: 'Melanggar aturan bisnis',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Koneksi internet bermasalah',
  [ERROR_CODES.SERVER_ERROR]: 'Terjadi kesalahan pada server',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Terjadi kesalahan yang tidak diketahui'
} as const

/**
 * Create a standardized app error
 */
export function createAppError(
  code: keyof typeof ERROR_CODES,
  message?: string,
  details?: string,
  severity: AppError['severity'] = 'error'
): AppError {
  return {
    code: ERROR_CODES[code],
    message: message || ERROR_MESSAGES[ERROR_CODES[code]],
    details,
    severity
  }
}

/**
 * Handle Supabase PostgrestError and convert to AppError
 */
export function handleSupabaseError(error: PostgrestError): AppError {
  switch (error.code) {
    case 'PGRST116':
      return createAppError('RECORD_NOT_FOUND', 'Data tidak ditemukan')
    
    case '23505': // Unique violation
      return createAppError('UNIQUE_VIOLATION', 'Data sudah ada')
    
    case '23503': // Foreign key violation
      return createAppError('FOREIGN_KEY_VIOLATION', 'Data masih digunakan di tempat lain')
    
    case '42501': // Insufficient privilege
      return createAppError('PERMISSION_DENIED', 'Tidak memiliki izin')
    
    default:
      return createAppError(
        'DATABASE_ERROR',
        error.message,
        error.details,
        'error'
      )
  }
}

/**
 * Handle API errors
 */
export function handleApiError(error: any): AppError {
  if (error?.response) {
    // HTTP error response
    const status = error.response.status
    const message = error.response.data?.message || error.message
    
    switch (status) {
      case 401:
        return createAppError('AUTH_INVALID', message)
      case 403:
        return createAppError('PERMISSION_DENIED', message)
      case 404:
        return createAppError('RECORD_NOT_FOUND', message)
      case 422:
        return createAppError('VALIDATION_FAILED', message)
      case 500:
        return createAppError('SERVER_ERROR', message)
      default:
        return createAppError('UNKNOWN_ERROR', message)
    }
  }
  
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    return createAppError('NETWORK_ERROR', 'Periksa koneksi internet Anda')
  }
  
  return createAppError('UNKNOWN_ERROR', error?.message || 'Terjadi kesalahan')
}

/**
 * Validation error helper
 */
export function createValidationError(
  field: string,
  message: string,
  code: string = ERROR_CODES.VALIDATION_FAILED
): ValidationError {
  return { field, message, code }
}

/**
 * Handle form validation errors
 */
export function handleValidationErrors(errors: ValidationError[]): Record<string, string> {
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message
    return acc
  }, {} as Record<string, string>)
}

/**
 * Error boundary helper
 */
export function logError(error: Error, context?: string): void {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  
  // Here you could send to error reporting service like Sentry
  // sentry.captureException(error, { contexts: { operation: context } })
}

/**
 * Retry helper for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  defaultValue?: T
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    const appError = error instanceof Error 
      ? handleApiError(error)
      : createAppError('UNKNOWN_ERROR', 'Operasi gagal')
    
    return { 
      data: defaultValue || null, 
      error: appError 
    }
  }
}

/**
 * Format error message for display
 */
export function formatErrorMessage(error: AppError | Error | string): string {
  if (typeof error === 'string') {
    return error
  }
  
  if ('code' in error && 'message' in error) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'Terjadi kesalahan yang tidak diketahui'
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: AppError): boolean {
  const recoverableCodes = [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.SERVER_ERROR,
    ERROR_CODES.AUTH_EXPIRED
  ]
  
  return recoverableCodes.includes(error.code as any)
}

/**
 * Get error severity color for UI
 */
export function getErrorSeverityColor(severity: AppError['severity']): string {
  switch (severity) {
    case 'info':
      return 'blue'
    case 'warning':
      return 'yellow'
    case 'error':
      return 'red'
    case 'critical':
      return 'red'
    default:
      return 'gray'
  }
}