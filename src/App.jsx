import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useGroup } from './context/GroupContext';

import SplashPage from './pages/SplashPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CreateGroupPage from './pages/CreateGroupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import JoinGroupPage from './pages/JoinGroupPage';
import MemberDashboardPage from './pages/MemberDashboardPage';
import ViewGroupPage from './pages/ViewGroupPage';
import PreviousTripsPage from './pages/PreviousTripsPage';
import SettingsPage from './pages/SettingsPage';

// Guard: only accessible when logged in
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050810' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
        </div>
        <p style={{ color: '#8b949e' }}>Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
}

// Guard: redirect logged-in users away from auth
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Splash */}
      <Route path="/" element={<SplashPage />} />

      {/* Auth */}
      <Route path="/auth" element={
        <PublicRoute><AuthPage /></PublicRoute>
      } />

      {/* Private routes */}
      <Route path="/dashboard" element={
        <PrivateRoute><DashboardPage /></PrivateRoute>
      } />

      <Route path="/create-group" element={
        <PrivateRoute><CreateGroupPage /></PrivateRoute>
      } />

      <Route path="/admin-dashboard" element={
        <PrivateRoute><AdminDashboardPage /></PrivateRoute>
      } />

      <Route path="/join-group" element={
        <PrivateRoute><JoinGroupPage /></PrivateRoute>
      } />

      <Route path="/member-dashboard" element={
        <PrivateRoute><MemberDashboardPage /></PrivateRoute>
      } />

      <Route path="/view-group" element={
        <PrivateRoute><ViewGroupPage /></PrivateRoute>
      } />

      <Route path="/trips" element={
        <PrivateRoute><PreviousTripsPage /></PrivateRoute>
      } />

      <Route path="/settings" element={
        <PrivateRoute><SettingsPage /></PrivateRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
