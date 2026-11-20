import { useEffect, useState } from 'react';
import Icon from './Icons';
import { useApp } from '../context/AppContext';
import { useRoute } from '../lib/router';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Browse Items' },
  { to: '/bookings', label: 'My Bookings', withCount: true },
  { to: '/how-it-works', label: 'How It Works' },
];

export default function Navbar() {
  const { path } = useRoute();
  const { user, bookings, signOut } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const isActive = (to) => (to === '/' ? path === '/' : path.startsWith(to));

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#/" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <Icon name="box" size={20} />
          </span>
          <span className="brand-text">
            Borrow<span>Box</span>
          </span>
        </a>

        <nav className={`nav ${open ? 'is-open' : ''}`}>
          {LINKS.map((link) => (
            <a
              key={link.to}
              className={`nav-link ${isActive(link.to) ? 'is-active' : ''}`}
              href={`#${link.to}`}
            >
              {link.label}
              {link.withCount && bookings.length > 0 && (
                <span className="nav-badge">{bookings.length}</span>
              )}
            </a>
          ))}

          <div className="nav-mobile-actions">
            {user ? (
              <button className="btn btn--ghost btn--sm btn--block" onClick={signOut}>
                <Icon name="logout" size={16} /> Sign out
              </button>
            ) : (
              <a className="btn btn--primary btn--sm btn--block" href="#/login">
                Login
              </a>
            )}
          </div>
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-chip">
              <span className="avatar">{user.name.charAt(0).toUpperCase()}</span>
              <span className="user-chip-name">{user.name.split(' ')[0]}</span>
              <button
                className="icon-btn"
                onClick={signOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <Icon name="logout" size={16} />
              </button>
            </div>
          ) : (
            <a className="btn btn--primary btn--sm login-btn" href="#/login">
              Login
            </a>
          )}
          <button
            className="icon-btn menu-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
