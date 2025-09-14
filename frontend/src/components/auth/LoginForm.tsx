import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { useAuthActions } from '@/stores/authStore'

// Login form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email harus diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password harus diisi')
    .min(6, 'Password minimal 6 karakter')
})

type LoginFormData = z.infer<typeof loginSchema>

export interface LoginFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  onRegisterClick?: () => void
  className?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  onRegisterClick,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn } = useAuthActions()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const result = await signIn(data.email, data.password)

      if (result.success) {
        reset()
        onSuccess?.()
      } else {
        onError?.(result.error || 'Login gagal')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan'
      onError?.(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-6 ${className}`}
      data-testid="login-form"
    >
      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="nama@email.com"
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
            ${errors.email ? 'border-red-500' : 'border-gray-300'}
          `}
          data-testid="email-input"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-600" data-testid="email-error">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Kata Sandi
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Masukkan password"
            className={`
              w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              ${errors.password ? 'border-red-500' : 'border-gray-300'}
            `}
            data-testid="password-input"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            data-testid="password-toggle"
            disabled={isSubmitting}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-600" data-testid="password-error">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
          }
        `}
        data-testid="submit-button"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Masuk...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 mr-2" />
            Masuk
          </>
        )}
      </button>

      {/* Register Link */}
      {onRegisterClick && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={onRegisterClick}
              className="font-medium text-primary hover:text-primary/80 focus:outline-none focus:underline"
              data-testid="register-link"
              disabled={isSubmitting}
            >
              Daftar sekarang
            </button>
          </p>
        </div>
      )}
    </form>
  )
}

export default LoginForm