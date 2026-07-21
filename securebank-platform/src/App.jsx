import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Login          from './pages/Login'
import Dashboard      from './pages/Dashboard'
import Risks          from './pages/Risks'
import RiskHeatMap    from './pages/RiskHeatMap'
import Controls       from './pages/Controls'
import Evidence       from './pages/Evidence'
import ReportsPage    from './pages/ReportsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/risks"        element={<Risks />} />
          <Route path="/risk-heatmap" element={<RiskHeatMap />} />
          <Route path="/controls"     element={<Controls />} />
          <Route path="/evidence"     element={<Evidence />} />
          <Route path="/reports"      element={<ReportsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
