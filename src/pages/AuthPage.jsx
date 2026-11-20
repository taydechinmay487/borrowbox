import { useEffect, useState } from 'react';
import Icon from '../components/Icons';
import { useApp } from '../context/AppContext';
import { navigate, useRoute } from '../lib/router';

export default function AuthPage() {
  const { path } = useRoute();
  const { user, signIn } = useApp();
  const isSignup = path === '/signup';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setErrors({});
  }, [path]);

  function submit(event) {
    event.preventDefault();
    const next = {};
    if (isSignup && name.trim().length < 2) next.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = 'Enter a valid email address.';
    if (password.length < 6) next.password = 'Use at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    signIn({
      name: isSignup ? name.trim() : email.trim().split('@')[0].replace(/[._]/g, ' '),
      email: email.trim(),
    });
    navigate('/');
  }

  return (
    <div className="auth-page">
      <div className="container auth-grid">
        <div className="auth-aside">
          <span className="eyebrow">
            <span className="dot" /> Join 2,400+ students
          </span>
          <h1>
            Borrow smarter.
            <br />
            <span>Buy less.</span>
          </h1>
          <p>
            One student email gets you access to projectors, drills, suitcases and
            more — all within walking distance of campus.
          </p>
          <ul className="check-list">
            <li>
              <Icon name="check" size={16} /> No membership fee, ever
            </li>
            <li>
              <Icon name="check" size={16} /> Refundable deposits only
            </li>
            <li>
              <Icon name="check" size={16} /> Verified hosts in your neighbourhood
            </li>
          </ul>
          <div className="auth-quote">
            <p>
              “I needed a projector for one presentation. Renting cost less than
              a pizza, and the pickup was across the road.”
            </p>
            <span>Priya N. · 3rd year, Bengaluru</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <a className={!isSignup ? 'is-active' : ''} href="#/login">
              Login
            </a>
            <a className={isSignup ? 'is-active' : ''} href="#/signup">
              Sign up
            </a>
          </div>

          <h2>{isSignup ? 'Create your account' : 'Welcome back'}</h2>
          <p className="auth-sub">
            {isSignup
              ? 'Takes less than a minute. No card required.'
              : 'Sign in to see your bookings and pick up where you left off.'}
          </p>

          {user && (
            <p className="auth-note">
              <Icon name="info" size={14} /> You are signed in as{' '}
              <strong>{user.email}</strong>.
            </p>
          )}

          <form className="auth-form" onSubmit={submit} noValidate>
            {isSignup && (
              <label className="field">
                <span>Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Aarav Sharma"
                  autoComplete="name"
                />
                {errors.name && <em className="field-error">{errors.name}</em>}
              </label>
            )}

            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@college.edu"
                autoComplete="email"
              />
              {errors.email && <em className="field-error">{errors.email}</em>}
            </label>

            <label className="field">
              <span>Password</span>
              <span className="password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
              {errors.password && (
                <em className="field-error">{errors.password}</em>
              )}
            </label>

            {isSignup && (
              <label className="checkbox-row">
                <input type="checkbox" defaultChecked />
                <span>
                  I agree to the rental terms and the refundable deposit policy.
                </span>
              </label>
            )}

            <button className="btn btn--primary btn--lg btn--block" type="submit">
              {isSignup ? 'Create account' : 'Login'}
              <Icon name="arrowRight" size={16} />
            </button>
          </form>

          <p className="auth-foot">
            {isSignup ? 'Already have an account? ' : 'New to BorrowBox? '}
            <a href={isSignup ? '#/login' : '#/signup'}>
              {isSignup ? 'Login' : 'Create one'}
            </a>
          </p>
          <p className="fine-print fine-print--center">
            <Icon name="info" size={14} /> Prototype login — any valid-looking
            details work. Nothing is sent anywhere.
          </p>
        </div>
      </div>
    </div>
  );
}
