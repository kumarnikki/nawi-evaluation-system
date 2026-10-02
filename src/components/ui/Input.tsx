import React, { forwardRef } from 'react'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string
  error?: string
  hint?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, prefix, suffix, required, className = '', id, ...props },
  ref
) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 text-gray-400 pointer-events-none">
            {prefix}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`
            form-input
            ${prefix ? 'pl-10' : ''}
            ${suffix ? 'pr-10' : ''}
            ${error ? 'form-input-error' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 text-gray-400">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="form-error">{error}</p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="form-hint">{hint}</p>
      )}
    </div>
  )
})

export default Input
export { Input }
