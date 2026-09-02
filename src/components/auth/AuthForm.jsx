import AuthField from "./AuthField";

const AUTH_CONTENT = {
  signup: {
    title: "Create your account",
    description: "Join us and get started.",
    button: "Create account",
    question: "Already have an account?",
    switchLabel: "Login",
  },

  login: {
    title: "Welcome back",
    description: "Login to continue.",
    button: "Login",
    question: "Don't have an account?",
    switchLabel: "Sign up",
  },
};

function AuthMascot() {
  return (
    <div
      className='auth-mascot'
      data-auth-mascot
      data-auth-item
      aria-hidden='true'
    >
      <div className='auth-mascot-head'>
        <div className='auth-mascot-face'>
          <div className='auth-mascot-eye auth-mascot-eye--left'>
            <span />
          </div>

          <div className='auth-mascot-eye auth-mascot-eye--right'>
            <span />
          </div>

          <div className='auth-mascot-mouth' />
        </div>
      </div>

      <div className='auth-mascot-body'>
        <div className='auth-mascot-arm auth-mascot-arm--left' />
        <div className='auth-mascot-arm auth-mascot-arm--right' />
      </div>
    </div>
  );
}

export default function AuthForm({ mode, onSwitch, disabled = false }) {
  const safeMode = mode === "login" ? "login" : "signup";

  const copy = AUTH_CONTENT[safeMode] || AUTH_CONTENT.signup;

  const isSignup = safeMode === "signup";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }
  };

  return (
    <form className='auth-form' onSubmit={handleSubmit} noValidate>
      <AuthMascot />

      <header className='auth-header' data-auth-item>
        <div className='auth-eyebrow'>
          <span className='auth-eyebrow-dot' />
          Secure access
        </div>

        <h1 className='auth-title'>{copy.title}</h1>

        <p className='auth-description'>{copy.description}</p>
      </header>

      <div className='auth-fields'>
        {isSignup && (
          <div data-auth-item>
            <AuthField
              id='signup-name'
              name='name'
              label='Name'
              type='text'
              autoComplete='name'
              placeholder='Your name'
              disabled={disabled}
            />
          </div>
        )}

        <div data-auth-item>
          <AuthField
            id={`${safeMode}-email`}
            name='email'
            label='Email'
            type='email'
            autoComplete='email'
            placeholder='name@example.com'
            disabled={disabled}
          />
        </div>

        <div data-auth-item>
          <AuthField
            id={`${safeMode}-password`}
            name='password'
            label='Password'
            type='password'
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder='••••••••'
            disabled={disabled}
          />
        </div>
      </div>

      <div data-auth-item>
        <button type='submit' className='auth-submit' disabled={disabled}>
          <span>{copy.button}</span>

          <svg viewBox='0 0 24 24' aria-hidden='true'>
            <path
              d='M5 12h14M13 6l6 6-6 6'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </div>

      <div className='auth-switch' data-auth-item>
        <span>{copy.question}</span>

        <button
          type='button'
          className='auth-switch-button'
          onClick={onSwitch}
          disabled={disabled}
        >
          {copy.switchLabel}
        </button>
      </div>
    </form>
  );
}
