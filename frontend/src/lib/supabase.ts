import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Supabase client configuration with enhanced options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enhanced authentication options
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    
    // Storage configuration for session persistence
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn('Failed to get item from localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('Failed to set item in localStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Failed to remove item from localStorage:', error);
        }
      },
    },
  },
  
  // Database options for better performance
  db: {
    schema: 'public',
  },
  
  // Global options
  global: {
    headers: {
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8', // Indonesian locale preference
      'Content-Type': 'application/json',
    },
  },
  
  // Real-time options
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting for real-time events
    },
  },
});

// Enhanced error handling types
export interface SupabaseError {
  message: string;
  code?: string;
  status?: number;
  details?: string;
  hint?: string;
}

// Authentication response types
export interface AuthResponse {
  user: any | null;
  session: any | null;
  error: SupabaseError | null;
}

// Helper function to handle Supabase errors with Indonesian messages
export const handleSupabaseError = (error: any): SupabaseError => {
  if (!error) {
    return {
      message: 'Terjadi kesalahan yang tidak diketahui',
      code: 'UNKNOWN_ERROR',
    };
  }

  // Map common Supabase errors to Indonesian messages
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Email atau password tidak valid',
    'Email not confirmed': 'Email belum dikonfirmasi. Silakan cek kotak masuk Anda',
    'Too many requests': 'Terlalu banyak percobaan login. Silakan coba lagi nanti',
    'Network error': 'Koneksi internet bermasalah. Silakan coba lagi',
    'Database connection error': 'Koneksi ke database bermasalah',
    'Row-level security policy violation': 'Akses tidak diizinkan',
    'Insufficient privileges': 'Hak akses tidak mencukupi',
    'JWT expired': 'Sesi telah berakhir. Silakan login kembali',
    'Invalid JWT': 'Sesi tidak valid. Silakan login kembali',
    'User not found': 'Pengguna tidak ditemukan',
    'Email already registered': 'Email sudah terdaftar',
    'Password too weak': 'Password terlalu lemah',
    'Invalid email format': 'Format email tidak valid',
    'PGRST301': 'Koneksi ke database terputus',
    '42501': 'Akses ditolak oleh sistem keamanan',
    '23505': 'Data sudah ada sebelumnya',
    '23503': 'Data yang dirujuk tidak ditemukan',
    '23502': 'Data wajib tidak boleh kosong',
  };

  const translatedMessage = 
    errorMessages[error.message] || 
    errorMessages[error.code] || 
    error.message || 
    'Terjadi kesalahan sistem';

  return {
    message: translatedMessage,
    code: error.code,
    status: error.status,
    details: error.details,
    hint: error.hint,
  };
};

// Helper function for authentication with enhanced error handling
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: handleSupabaseError(error),
      };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: handleSupabaseError(error),
    };
  }
};

// Helper function for user registration
export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          ...metadata,
          locale: 'id-ID',
          timezone: 'Asia/Jakarta',
        },
      },
    });

    if (error) {
      return {
        user: null,
        session: null,
        error: handleSupabaseError(error),
      };
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      session: null,
      error: handleSupabaseError(error),
    };
  }
};

// Helper function for logout
export const signOut = async (): Promise<{ error: SupabaseError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: handleSupabaseError(error) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleSupabaseError(error) };
  }
};

// Helper function to get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { user: null, error: handleSupabaseError(error) };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: handleSupabaseError(error) };
  }
};

// Helper function to get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      return { session: null, error: handleSupabaseError(error) };
    }

    return { session, error: null };
  } catch (error) {
    return { session: null, error: handleSupabaseError(error) };
  }
};

// Helper function for password reset
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      return { error: handleSupabaseError(error) };
    }

    return { error: null };
  } catch (error) {
    return { error: handleSupabaseError(error) };
  }
};

// Helper function for updating user metadata
export const updateUserMetadata = async (metadata: Record<string, any>) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });
    
    if (error) {
      return { user: null, error: handleSupabaseError(error) };
    }

    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error: handleSupabaseError(error) };
  }
};

// Database helper functions with enhanced error handling
export const executeQuery = async <T = any>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: SupabaseError | null }> => {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
};

// Real-time subscription helper with error handling
export const createRealtimeSubscription = (
  table: string,
  filter?: string,
  callback?: (payload: any) => void,
  errorCallback?: (error: SupabaseError) => void
) => {
  try {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          try {
            callback?.(payload);
          } catch (error) {
            const supabaseError = handleSupabaseError(error);
            errorCallback?.(supabaseError);
          }
        }
      )
      .subscribe((status, error) => {
        if (error) {
          const supabaseError = handleSupabaseError(error);
          errorCallback?.(supabaseError);
        }
      });

    return {
      channel,
      unsubscribe: () => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.warn('Failed to unsubscribe from channel:', error);
        }
      },
    };
  } catch (error) {
    const supabaseError = handleSupabaseError(error);
    errorCallback?.(supabaseError);
    return {
      channel: null,
      unsubscribe: () => {},
    };
  }
};

// Connection status checker
export const checkConnection = async (): Promise<{
  isConnected: boolean;
  error: SupabaseError | null;
}> => {
  try {
    // Try a simple query to check connection
    const { error } = await supabase.from('subscription_plans').select('id').limit(1);
    
    if (error) {
      return {
        isConnected: false,
        error: handleSupabaseError(error),
      };
    }

    return {
      isConnected: true,
      error: null,
    };
  } catch (error) {
    return {
      isConnected: false,
      error: handleSupabaseError(error),
    };
  }
};

// Indonesian locale configurations
export const INDONESIAN_CONFIG = {
  locale: 'id-ID',
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  numberFormat: {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  currencyFormat: {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  phoneFormat: /^(\+62|0)[0-9]{9,13}$/,
  npwpFormat: /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/,
  nikFormat: /^\d{16}$/,
} as const;

// Helper function to format Indonesian currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', INDONESIAN_CONFIG.currencyFormat).format(amount);
};

// Helper function to format Indonesian numbers
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID', INDONESIAN_CONFIG.numberFormat).format(value);
};

// Helper function to format Indonesian dates
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: INDONESIAN_CONFIG.timezone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

// Helper function to format Indonesian time
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: INDONESIAN_CONFIG.timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Helper function to validate Indonesian phone numbers
export const validatePhoneNumber = (phone: string): boolean => {
  return INDONESIAN_CONFIG.phoneFormat.test(phone);
};

// Helper function to validate NPWP
export const validateNPWP = (npwp: string): boolean => {
  return INDONESIAN_CONFIG.npwpFormat.test(npwp);
};

// Helper function to validate NIK
export const validateNIK = (nik: string): boolean => {
  return INDONESIAN_CONFIG.nikFormat.test(nik);
};

// Export configured client as default
export default supabase;