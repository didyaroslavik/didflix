import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import Layout from './components/Layout';
import PublicProfilePage from './pages/PublicProfilePage';
import FindUsersPage from './pages/FindUsersPage';


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/collection" element={<ProtectedRoute><CollectionPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

      {/* Public route - no auth needed */}
      <Route path="/u/:token" element={<PublicProfilePage />} />

      {/* Protected route */}
      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <FindUsersPage />
          </ProtectedRoute>
        }
    />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}