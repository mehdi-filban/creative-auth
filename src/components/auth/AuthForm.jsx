import { useState } from "react";

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

const MASCOT_MESSAGES = {
  signup: {
    name: "Oooh, let's get to know you 👋",

    email: "Nice! Where can we reach you? ✉️",

    password: "Make it strong. I'll keep your secret 🔐",
  },

  login: {
    email: "Hey, welcome back! Good to see you 👀",

    password: "Secret time... I promise I won't peek 🙈",
  },
};

function AuthMascot({ message, eyesClosed }) {
  return (
    <div
      className={`auth-mascot ${eyesClosed ? "auth-mascot--eyes-closed" : ""}`}
      data-auth-mascot
      data-auth-item
      aria-hidden='true'
    >
      <div
        key={message || "empty-bubble"}
        className={`auth-mascot-bubble ${
          message ? "auth-mascot-bubble--visible" : ""
        }`}
      >
        <span className='auth-mascot-bubble-text'>{message}</span>
      </div>

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

export default function AuthForm({
  mode = "signup",
  onSwitch,
  disabled = false,
}) {
  const [focusedField, setFocusedField] = useState(null);

  const safeMode = mode === "login" ? "login" : "signup";

  const copy = AUTH_CONTENT[safeMode] ?? AUTH_CONTENT.signup;

  const isSignup = safeMode === "signup";

  const mascotMessage = MASCOT_MESSAGES[safeMode]?.[focusedField] ?? "";

  const isPasswordFocused = focusedField === "password";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (disabled) {
      return;
    }
  };

  const handleSwitch = () => {
    setFocusedField(null);

    onSwitch?.();
  };

  return (
    <form className='auth-form' onSubmit={handleSubmit} noValidate>
      <AuthMascot message={mascotMessage} eyesClosed={isPasswordFocused} />

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
              placeholder='Your name'
              autoComplete='name'
              disabled={disabled}
              onFocus={() => {
                setFocusedField("name");
              }}
              onBlur={() => {
                setFocusedField(null);
              }}
            />
          </div>
        )}

        <div data-auth-item>
          <AuthField
            id={`${safeMode}-email`}
            name='email'
            label='Email'
            type='email'
            placeholder='name@example.com'
            autoComplete='email'
            disabled={disabled}
            onFocus={() => {
              setFocusedField("email");
            }}
            onBlur={() => {
              setFocusedField(null);
            }}
          />
        </div>

        <div data-auth-item>
          <AuthField
            id={`${safeMode}-password`}
            name='password'
            label='Password'
            type='password'
            placeholder='••••••••'
            autoComplete={isSignup ? "new-password" : "current-password"}
            disabled={disabled}
            onFocus={() => {
              setFocusedField("password");
            }}
            onBlur={() => {
              setFocusedField(null);
            }}
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
          disabled={disabled}
          onClick={handleSwitch}
        >
          {copy.switchLabel}
        </button>
      </div>
    </form>
  );
}
