import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import NewFitting from './pages/NewFitting';
import FittingResult from './pages/FittingResult';
import FittingHistory from './pages/FittingHistory';
import AdminDatabase from './pages/AdminDatabase';
import StrokesGained from './pages/StrokesGained';
import Training from './pages/Training';
import ShaftFitting from './pages/ShaftFitting';

// ── Authenticated shell ────────────────────────────────────────────────────
function AppShell() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7F5] flex items-center justify-center">
        <div className="text-gray-400 text-sm">Laden…</div>
      </div>
    );
  }

  if (!session) return <LoginPage />;

  return (
    <div className="min-h-screen bg-[#F5F7F5]">
      <Navbar />
      <main className="pt-[63px]">
        <Routes>
          <Route path="/"                      element={<Home />} />
          <Route path="/fitting/new"           element={<NewFitting />} />
          <Route path="/fitting/result"        element={<FittingResult />} />
          <Route path="/fitting/history"       element={<FittingHistory />} />
          <Route path="/admin"                 element={<AdminDatabase />} />
          <Route path="/tools/strokes-gained"  element={<StrokesGained />} />
          <Route path="/training"              element={<Training />} />
          <Route path="/shaft-fitting"         element={<ShaftFitting />} />
        </Routes>
      </main>
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
