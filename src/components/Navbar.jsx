import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

const NAV_LINKS = [
  { to: '/',             label: 'Home'         },
  { to: '/races',        label: 'Races'        },
  { to: '/drivers',      label: 'Drivers'      },
  { to: '/constructors', label: 'Constructors' },
  { to: '/circuits',     label: 'Circuits'     },
  { to: '/garage',       label: 'Garage'       },
  { to: '/prediction',   label: 'Prediction'   },
];

export default function Navbar() {
  const { user, logout }  = useAuth();
  const location          = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(232,0,45,0.15)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-f1-red rounded flex items-center justify-center text-xs font-black transition-all group-hover:shadow-[0_0_20px_rgba(232,0,45,0.6)]" style={{fontFamily:'JetBrains Mono'}}>
              PW
            </div>
            <span className="font-black text-lg tracking-tight" style={{letterSpacing:'-0.02em'}}>
              PIT<span style={{color:'#E8002D'}}>WALL</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-200"
                  style={{
                    color: active ? '#E8002D' : '#C0C0C8',
                    background: active ? 'rgba(232,0,45,0.08)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#F5F5F5'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#C0C0C8'; }}
                >
                  {label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-f1-red rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-f1-silver">
                  👋 <strong className="text-f1-white">{user.username}</strong>
                </span>
                <button onClick={logout} className="btn-ghost text-xs py-2 px-4">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/prediction" className="btn-primary text-sm py-2 px-5">
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
            {[0,1,2].map(i => (
              <span key={i} className="block w-6 h-0.5 bg-f1-white rounded transition-all duration-200" />
            ))}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass mx-4 mb-4 rounded-xl overflow-hidden">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="block px-5 py-3.5 text-sm font-medium border-b border-white/5 last:border-0"
              style={{ color: location.pathname === to ? '#E8002D' : '#C0C0C8' }}
            >
              {label}
            </Link>
          ))}
          <div className="p-4">
            {user ? (
              <button onClick={logout} className="btn-ghost w-full justify-center text-sm">Logout</button>
            ) : (
              <Link to="/prediction" className="btn-primary w-full justify-center text-sm">Login / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
