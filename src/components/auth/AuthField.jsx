import { useState } from "react";

export default function AuthField({
  id,
  label,
  type = "text",
  disabled = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <div className='auth-field'>
      <label className='auth-label' htmlFor={id}>
        {label}
      </label>

      <div className='auth-input-wrap'>
        <input
          id={id}
          type={resolvedType}
          className='auth-input'
          disabled={disabled}
          {...props}
        />

        {isPassword && (
          <button
            type='button'
            className='auth-password-toggle'
            tabIndex={-1}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? (
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path
                  d='M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7M9.9 4.2A10.6 10.6 0 0112 4c5.5 0 9 5 9 5a16.9 16.9 0 01-3.1 3.5M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5a9.8 9.8 0 003.1-.5'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.7'
                  strokeLinecap='round'
                />
              </svg>
            ) : (
              <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path
                  d='M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.7'
                />

                <circle
                  cx='12'
                  cy='12'
                  r='2.4'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.7'
                />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
