import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import Layout from './Layout'

export default function ProtectedRoute() {
  const { isAuthenticated, accessToken, logout } = useAuthStore()

  // If the store says authenticated but the token is gone (e.g. cleared from
  // another tab or storage was wiped), force a clean logout and redirect.
  if (isAuthenticated && !accessToken) {
    logout()
    return <Navigate to="/login" replace />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
