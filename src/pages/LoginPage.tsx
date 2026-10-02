import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ChevronDown, ChevronUp, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// ── Validation schema ─────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ── Demo credential rows ──────────────────────────────────────────────────
interface DemoCredential {
  role: string
  email: string
  password: string
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: 'Admin',       email: 'admin@nawi.gov.in',       password: 'Admin@123'   },
  { role: 'Technician',  email: 'technician@nawi.gov.in',  password: 'Tech@123'    },
  { role: 'Reviewer',    email: 'reviewer@nawi.gov.in',    password: 'Review@123'  },
  { role: 'Approver',    email: 'approver@nawi.gov.in',    password: 'Approve@123' },
  { role: 'Viewer',      email: 'viewer@nawi.gov.in',      password: 'View@123'    },
]

// ── Role badge colour map ─────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  Admin:      'bg-purple-100 text-purple-800',
  Technician: 'bg-blue-100 text-blue-800',
  Reviewer:   'bg-yellow-100 text-yellow-800',
  Approver:   'bg-green-100 text-green-800',
  Viewer:     'bg-gray-100 text-gray-700',
}

// ── DoCA mini-emblem ──────────────────────────────────────────────────────
function MiniEmblem() {
  return (
    <svg viewBox="0 0 48 48" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#FF9933" />
      <circle cx="24" cy="24" r="17" fill="#ffffff" />
      <circle cx="24" cy="24" r="12" fill="#138808" />
      <circle cx="24" cy="24" r="8"  fill="#0d2137" />
      <circle cx="24" cy="24" r="2"  fill="#FF9933" />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        return (
          <line
            key={i}
            x1={24 + 2.5 * Math.cos(angle)}
            y1={24 + 2.5 * Math.sin(angle)}
            x2={24 + 7.5 * Math.cos(angle)}
            y2={24 + 7.5 * Math.sin(angle)}
            stroke="#FF9933"
            strokeWidth="1"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}

// ── Login Page ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()

  const [serverError, setServerError] = useState<string | null>(null)
  const [showDemo, setShowDemo] = useState(true)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)
    const result = await login(data.email, data.password)
    if (result.error) {
      setServerError(result.error)
      return
    }
    navigate('/dashboard', { replace: true })
  }

  const fillCredential = (cred: DemoCredential) => {
    setValue('email', cred.email, { shouldValidate: true })
    setValue('password', cred.password, { shouldValidate: true })
    setServerError(null)
  }

  const instantLogin = async (cred: DemoCredential) => {
    setValue('email', cred.email, { shouldValidate: true })
    setValue('password', cred.password, { shouldValidate: true })
    setServerError(null)
    const result = await login(cred.email, cred.password)
    if (result.error) {
      setServerError(result.error)
      return
    }
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Tricolor strip */}
      <div
        className="h-2 w-full flex-shrink-0"
        style={{
          background: 'linear-gradient(to right, #FF9933 33%, #ffffff 33%, #ffffff 66%, #138808 66%)',
        }}
      />

      {/* Header */}
      <header className="bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MiniEmblem />
            <div>
              <p className="text-white font-semibold text-sm leading-tight">NAWI Report System</p>
              <p className="text-saffron-400 text-xs leading-tight">Department of Consumer Affairs</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-navy-200 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

        {/* Already logged in banner */}
        {user && (
          <div className="w-full max-w-md mb-4 bg-green-50 border border-green-200 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Signed in as <strong>{user.name}</strong> ({user.role})</span>
            </div>
            <Link to="/dashboard" className="btn btn-sm btn-primary text-xs whitespace-nowrap">
              Go to Dashboard →
            </Link>
          </div>
        )}

        {/* Login card */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">

            {/* Card header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-navy-900 rounded-full mb-4">
                <span className="text-2xl">⚖️</span>
              </div>
              <h1 className="text-navy-900 text-xl font-bold">Sign In to NAWI Portal</h1>
              <p className="text-gray-500 text-sm mt-1">Legal Metrology Test Report System</p>
            </div>

            {/* Error alert */}
            {serverError && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
                <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm">{serverError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@nawi.gov.in"
                  {...register('email')}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-saffron-400 transition-colors ${
                    errors.email
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-saffron-400 transition-colors ${
                    errors.password
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-saffron-400 focus:ring-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing In…
                  </>
                ) : (
                  'Sign In →'
                )}
              </button>
            </form>
          </div>

          {/* Demo credentials panel */}
          <div className="mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDemo((prev) => !prev)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-navy-800 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="text-base">🔑</span>
                Demo Accounts (Zero Setup)
              </span>
              {showDemo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showDemo && (
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                      <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                      <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {DEMO_CREDENTIALS.map((cred) => (
                      <tr key={cred.role} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                              ROLE_COLORS[cred.role] ?? 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {cred.role}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-gray-700 font-mono text-xs">{cred.email}</td>
                        <td className="px-4 py-2.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fillCredential(cred)}
                            className="text-xs text-navy-600 hover:text-navy-800 font-semibold hover:underline"
                          >
                            Fill
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            type="button"
                            onClick={() => instantLogin(cred)}
                            className="text-xs text-saffron-600 hover:text-saffron-700 font-bold hover:underline"
                          >
                            Login →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
