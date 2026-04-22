import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Home as HomeIcon, PlusCircle, History, Settings, TrendingUp, LogOut, BookOpen, Gauge } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import NewFitting from './pages/NewFitting';
import FittingResult from './pages/FittingResult';
import FittingHistory from './pages/FittingHistory';
import AdminProducts from './pages/AdminProducts';
import StrokesGained from './pages/StrokesGained';
import Training from './pages/Training';
import ShaftFitting from './pages/ShaftFitting';

const NAV_ITEMS = [
  { to: '/',                     icon: HomeIcon,    label: 'Start' },
  { to: '/fitting/new',          icon: PlusCircle,  label: 'Neues Fitting' },
  { to: '/fitting/history',      icon: History,     label: 'Historie' },
  { to: '/training',             icon: BookOpen,    label: 'Training' },
  { to: '/shaft-fitting',        icon: Gauge,       label: 'Schaftberatung' },
  { to: '/tools/strokes-gained', icon: TrendingUp,  label: 'SG Tool' },
  { to: '/admin',                icon: Settings,    label: 'Produkte' },
];

// ── Desktop sidebar (lg+) ──────────────────────────────────────────────────
function Sidebar() {
  const { session, signOut } = useAuth();
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-gray-200 z-40">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="font-bold text-[#185FA5] text-base">⛳ Driver Fitting</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-[#185FA5]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-[#185FA5]' : 'text-gray-400'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {session && (
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="text-xs text-gray-400 px-3 mb-2 truncate">{session.user.email}</div>
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={17} />
            Abmelden
          </button>
        </div>
      )}
    </aside>
  );
}

// ── Tablet top navbar (md – lg) ────────────────────────────────────────────
function TopNav() {
  const { session, signOut } = useAuth();
  return (
    <nav className="hidden md:flex lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="w-full px-4 flex items-center gap-1 overflow-x-auto">
        <span className="font-bold text-[#185FA5] text-sm mr-3 whitespace-nowrap py-3">⛳ Fitting</span>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-[#185FA5] text-[#185FA5]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
        {session && (
          <button
            onClick={signOut}
            title={session.user.email}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 hover:text-red-500 transition-colors whitespace-nowrap"
          >
            <LogOut size={15} />
            Abmelden
          </button>
        )}
      </div>
    </nav>
  );
}

// ── Mobile bottom tab bar (< md) ──────────────────────────────────────────
function BottomNav() {
  const location = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            >
              <Icon
                size={22}
                className={isActive ? 'text-[#185FA5]' : 'text-gray-400'}
              />
              <span className={`text-[10px] font-medium leading-tight ${isActive ? 'text-[#185FA5]' : 'text-gray-400'}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// ── Authenticated shell ────────────────────────────────────────────────────
function AppShell() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Laden…</div>
      </div>
    );
  }

  if (!session) return <LoginPage />;

  return (
    <div className="min-h-screen bg-[#F8F8F6]">
      <Sidebar />
      <TopNav />
      {/* pb-20 keeps content above mobile bottom nav; lg:ml-56 clears the sidebar */}
      <main className="lg:ml-56 pb-20 md:pb-0">
        <Routes>
          <Route path="/"                      element={<Home />} />
          <Route path="/fitting/new"           element={<NewFitting />} />
          <Route path="/fitting/result"        element={<FittingResult />} />
          <Route path="/fitting/history"       element={<FittingHistory />} />
          <Route path="/admin"                 element={<AdminProducts />} />
          <Route path="/tools/strokes-gained"  element={<StrokesGained />} />
          <Route path="/training"              element={<Training />} />
          <Route path="/shaft-fitting"         element={<ShaftFitting />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
