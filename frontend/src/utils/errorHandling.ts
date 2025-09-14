/**
 * Error Handling Utilities for ERP System
 * Provides database-specific error handling, retry logic, and user-friendly messages
 * Integrates with Supabase error patterns and multi-tenant isolation
 * Date: 2025-09-14
 */

import React from 'react';

// ============================================================================
// ERROR TYPES & INTERFACES
// ============================================================================

export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
  userMessage: string;
  isRetryable: boolean;
  isConnectionError: boolean;
  isPermissionError: boolean;
  isValidationError: boolean;
}

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: DatabaseError) => boolean;
}

export interface ErrorContext {
  operation: string;
  table?: string;
  userId?: string;
  companyId?: string;
  timestamp: Date;
  additionalInfo?: Record<string, any>;
}

// ============================================================================
// ERROR MAPPING & CLASSIFICATION
// ============================================================================

const errorMappings: Record<string, Partial<DatabaseError>> = {
  // Connection errors
  'ECONNREFUSED': {
    userMessage: 'Unable to connect to the database. Please check your internet connection.',
    isRetryable: true,
    isConnectionError: true,
  },
  'ENOTFOUND': {
    userMessage: 'Database server not found. Please try again later.',
    isRetryable: true,
    isConnectionError: true,
  },
  'ETIMEDOUT': {
    userMessage: 'Database connection timed out. Please try again.',
    isRetryable: true,
    isConnectionError: true,
  },

  // Authentication errors
  '401': {
    userMessage: 'Your session has expired. Please log in again.',
    isRetryable: false,
    isPermissionError: true,
  },
  'invalid_jwt': {
    userMessage: 'Your session is invalid. Please log in again.',
    isRetryable: false,
    isPermissionError: true,
  },
  'jwt_expired': {
    userMessage: 'Your session has expired. Please log in again.',
    isRetryable: false,
    isPermissionError: true,
  },

  // Permission errors
  '403': {
    userMessage: 'You do not have permission to perform this action.',
    isRetryable: false,
    isPermissionError: true,
  },
  'insufficient_privilege': {
    userMessage: 'You do not have sufficient privileges for this operation.',
    isRetryable: false,
    isPermissionError: true,
  },
  'row_level_security_violated': {
    userMessage: 'Access denied. You can only access data for your organization.',
    isRetryable: false,
    isPermissionError: true,
  },

  // Validation errors
  '23505': { // unique_violation
    userMessage: 'This record already exists. Please use a different value.',
    isRetryable: false,
    isValidationError: true,
  },
  '23503': { // foreign_key_violation
    userMessage: 'This operation would create invalid data relationships.',
    isRetryable: false,
    isValidationError: true,
  },
  '23502': { // not_null_violation
    userMessage: 'Required fields are missing. Please fill in all required information.',
    isRetryable: false,
    isValidationError: true,
  },
  '23514': { // check_violation
    userMessage: 'The data provided does not meet the required constraints.',
    isRetryable: false,
    isValidationError: true,
  },

  // Rate limiting
  '429': {
    userMessage: 'Too many requests. Please wait a moment and try again.',
    isRetryable: true,
    isConnectionError: false,
  },

  // Server errors
  '500': {
    userMessage: 'A server error occurred. Please try again later.',
    isRetryable: true,
    isConnectionError: false,
  },
  '502': {
    userMessage: 'Service temporarily unavailable. Please try again.',
    isRetryable: true,
    isConnectionError: true,
  },
  '503': {
    userMessage: 'Service is currently under maintenance. Please try again later.',
    isRetryable: true,
    isConnectionError: true,
  },

  // Supabase specific errors
  'PGRST116': { // row not found
    userMessage: 'The requested record was not found.',
    isRetryable: false,
    isValidationError: true,
  },
  'PGRST301': { // RLS policy violation
    userMessage: 'Access denied. You can only access data for your organization.',
    isRetryable: false,
    isPermissionError: true,
  },
};

export function parseError(error: any, context?: ErrorContext): DatabaseError {
  const defaultError: DatabaseError = {
    code: 'UNKNOWN',
    message: 'An unexpected error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
    isRetryable: false,
    isConnectionError: false,
    isPermissionError: false,
    isValidationError: false,
  };

  if (!error) return defaultError;

  let parsedError: DatabaseError = { ...defaultError };

  // Handle PostgrestError (Supabase)
  if (error.code || error.message) {
    parsedError = {
      ...parsedError,
      code: error.code || 'SUPABASE_ERROR',
      message: error.message || error.toString(),
      details: error.details,
      hint: error.hint,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    parsedError = {
      ...parsedError,
      code: error.name || 'ERROR',
      message: error.message,
    };
  }

  // Handle HTTP errors
  if (error.status) {
    parsedError.code = error.status.toString();
  }

  // Apply error mappings
  const mapping = errorMappings[parsedError.code];
  if (mapping) {
    parsedError = { ...parsedError, ...mapping };
  }

  // Log error with context
  logError(parsedError, context);

  return parsedError;
}

function logError(error: DatabaseError, context?: ErrorContext): void {
  const logData = {
    error,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Database Error:', logData);
  }

  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
}

export function isNetworkError(error: DatabaseError): boolean {
  return error.isConnectionError || ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(error.code);
}

export function isAuthenticationError(error: DatabaseError): boolean {
  return error.isPermissionError || ['401', '403', 'invalid_jwt', 'jwt_expired'].includes(error.code);
}

export function isValidationError(error: DatabaseError): boolean {
  return error.isValidationError || error.code.startsWith('23');
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
  context?: ErrorContext
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = (error) => error.isRetryable,
  } = options;

  let lastError: DatabaseError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const fullContext: ErrorContext = {
        operation: context?.operation || 'unknown',
        timestamp: new Date(),
        ...context,
        additionalInfo: { ...context?.additionalInfo, attempt },
      };

      lastError = parseError(error, fullContext);

      // Don't retry if it's the last attempt or if error is not retryable
      if (attempt === maxAttempts || !retryCondition(lastError)) {
        throw lastError;
      }

      // Wait before retrying
      await sleep(Math.min(delay, maxDelay));
      delay *= backoffMultiplier;
    }
  }

  throw lastError!;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// CONNECTION RECOVERY
// ============================================================================

class ConnectionRecoveryManager {
  private isOnline = true;
  private reconnectAttempts = 0;
  private listeners: Array<(isOnline: boolean) => void> = [];

  init(): void {
    if (typeof window === 'undefined') return;

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Initial state
    this.isOnline = navigator.onLine;
  }

  addListener(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private handleOnline(): void {
    this.isOnline = true;
    this.reconnectAttempts = 0;
    this.notifyListeners();
  }

  private handleOffline(): void {
    this.isOnline = false;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.isOnline));
  }

  async waitForConnection(): Promise<void> {
    if (this.isOnline) return;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 30000); // 30 seconds timeout

      const unsubscribe = this.addListener((isOnline) => {
        if (isOnline) {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        }
      });
    });
  }

  getStatus(): { isOnline: boolean; reconnectAttempts: number } {
    return {
      isOnline: this.isOnline,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

export const connectionRecovery = new ConnectionRecoveryManager();

// ============================================================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================================================

const operationMessages: Record<string, string> = {
  'select': 'loading data',
  'insert': 'creating record',
  'update': 'updating record',
  'delete': 'deleting record',
  'auth': 'authenticating',
};

export function formatErrorForUser(error: DatabaseError, operation?: string): string {
  let message = error.userMessage;

  // Add context about what operation failed
  if (operation && operationMessages[operation]) {
    message = `Error ${operationMessages[operation]}: ${message}`;
  }

  // Add helpful hints for specific error types
  if (error.isValidationError) {
    message += ' Please check your input and try again.';
  } else if (error.isConnectionError) {
    message += ' Please check your internet connection and try again.';
  } else if (error.isPermissionError) {
    message += ' Please contact your administrator if you believe this is incorrect.';
  }

  return message;
}

export function getRetryMessage(error: DatabaseError): string {
  if (error.isRetryable) {
    return 'This error might be temporary. Would you like to try again?';
  }
  return 'This error requires attention before you can continue.';
}

export function getSuggestedActions(error: DatabaseError): string[] {
  const actions: string[] = [];

  if (error.isConnectionError) {
    actions.push('Check your internet connection');
    actions.push('Try refreshing the page');
  }

  if (error.isPermissionError) {
    actions.push('Log out and log back in');
    actions.push('Contact your administrator');
  }

  if (error.isValidationError) {
    actions.push('Check all required fields are filled');
    actions.push('Verify data format is correct');
  }

  if (error.isRetryable) {
    actions.push('Wait a moment and try again');
  }

  return actions;
}

// ============================================================================
// HOOKS FOR ERROR HANDLING
// ============================================================================

export function useErrorHandler() {
  const handleError = (error: any, context?: Partial<ErrorContext>) => {
    const fullContext: ErrorContext = {
      operation: 'unknown',
      timestamp: new Date(),
      ...context,
    };

    return parseError(error, fullContext);
  };

  const retryOperation = async <T>(
    operation: () => Promise<T>,
    retryOptions?: RetryOptions,
    context?: Partial<ErrorContext>
  ): Promise<T> => {
    const fullContext: ErrorContext = {
      operation: 'unknown',
      timestamp: new Date(),
      ...context,
    };

    return withRetry(operation, retryOptions, fullContext);
  };

  return {
    handleError,
    withRetry: retryOperation,
    formatError: formatErrorForUser,
    getRetryMessage,
    getSuggestedActions,
  };
}

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [reconnectAttempts, setReconnectAttempts] = React.useState(0);

  React.useEffect(() => {
    connectionRecovery.init();
    
    const unsubscribe = connectionRecovery.addListener((online) => {
      setIsOnline(online);
      const status = connectionRecovery.getStatus();
      setReconnectAttempts(status.reconnectAttempts);
    });

    return unsubscribe;
  }, []);

  return {
    isOnline,
    reconnectAttempts,
    waitForConnection: connectionRecovery.waitForConnection.bind(connectionRecovery),
  };
}