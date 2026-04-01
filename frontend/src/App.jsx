import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from './components/Toast'

// Pages
import LandingPage     from './pages/LandingPage'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import DashboardPage   from './pages/DashboardPage'
import DonationForm    from './pages/DonationForm'
import RequestForm     from './pages/RequestForm'
import MapPage         from './pages/MapPage'
import AdminPanel      from './pages/AdminPanel'
import ProfilePage     from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import TrackingPage    from './pages/TrackingPage'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <>
      {/* ✅ ToastContainer lives INSIDE BrowserRouter, OUTSIDE Routes */}
      <ToastContainer />
      <Routes>
        <Route path="/"            element={<LandingPage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"    element={<RegisterPage />} />
        <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/donate"      element={<ProtectedRoute><DonationForm /></ProtectedRoute>} />
        <Route path="/request"     element={<ProtectedRoute><RequestForm /></ProtectedRoute>} />
        <Route path="/map"         element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/admin"       element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/tracking"    element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}