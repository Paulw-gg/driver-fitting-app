import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const NAV_ITEMS = [
  { to: '/',                     label: 'Start' },
  { to: '/fitting/new',          label: 'Neues Fitting' },
  { to: '/fitting/history',      label: 'Historie' },
  { to: '/training',             label: 'Training' },
  { to: '/shaft-fitting',        label: 'Schaftberatung' },
  { to: '/tools/strokes-gained', label: 'SG Tool' },
  { to: '/admin',                label: 'Datenbank' },
];

export default function Navbar() {
  const { session, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        style={{
          backgroundColor: '#1E4D2B',
          borderBottom: '3px solid #C9A84C',
          height: '60px',
        }}
        className="fixed top-0 inset-x-0 z-50 flex items-center px-4"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mr-6 shrink-0">
          <img
            src="/logo.png"
            alt="Golf Götze"
            className="h-8 w-auto"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="font-bold text-white text-base tracking-wide">Golf Götze</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[#C9A84C] bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* Desktop sign-out */}
        {session && (
          <button
            onClick={signOut}
            title={session.user.email}
            className="hidden md:flex items-center gap-1.5 ml-auto shrink-0 px-3 py-1.5 rounded text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={15} />
            Abmelden
          </button>
        )}

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden ml-auto text-white p-1.5 rounded hover:bg-white/10 transition-colors"
          aria-label="Menü"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div
          style={{ backgroundColor: '#1E4D2B', top: '63px' }}
          className="md:hidden fixed inset-x-0 z-40 shadow-lg"
        >
          <div className="flex flex-col py-2">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-5 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#C9A84C] bg-white/10'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            {session && (
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="flex items-center gap-2 px-5 py-3 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-1 border-t border-white/10"
              >
                <LogOut size={15} />
                Abmelden
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
