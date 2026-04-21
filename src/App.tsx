import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home as HomeIcon, PlusCircle, History, Settings, TrendingUp } from 'lucide-react';
import Home from './pages/Home';
import NewFitting from './pages/NewFitting';
import FittingResult from './pages/FittingResult';
import FittingHistory from './pages/FittingHistory';
import AdminProducts from './pages/AdminProducts';
import StrokesGained from './pages/StrokesGained';

const navItems = [
  { to: '/',                    icon: <HomeIcon size={16} />,    label: 'Start' },
  { to: '/fitting/new',         icon: <PlusCircle size={16} />,  label: 'Neues Fitting' },
  { to: '/fitting/history',     icon: <History size={16} />,     label: 'Historie' },
  { to: '/tools/strokes-gained',icon: <TrendingUp size={16} />,  label: 'SG Tool' },
  { to: '/admin',               icon: <Settings size={16} />,    label: 'Produkte' },
];

function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
        <span className="font-bold text-[#185FA5] text-sm mr-3 whitespace-nowrap py-3">⛳ Fitting</span>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-[#185FA5] text-[#185FA5]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`
            }
          >
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8F8F6]">
        <Navbar />
        <main>
          <Routes>
            <Route path="/"                     element={<Home />} />
            <Route path="/fitting/new"          element={<NewFitting />} />
            <Route path="/fitting/result"       element={<FittingResult />} />
            <Route path="/fitting/history"      element={<FittingHistory />} />
            <Route path="/admin"                element={<AdminProducts />} />
            <Route path="/tools/strokes-gained" element={<StrokesGained />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
