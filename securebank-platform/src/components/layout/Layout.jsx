import Sidebar from './Sidebar'
import Header from './Header'
import { useLocation } from 'react-router-dom'

const pageMeta = {
  '/dashboard':    { title: 'Dashboard',           subtitle: 'Risk & Compliance Overview' },
  '/risk-heatmap': { title: 'Risk Heat Map',        subtitle: 'Visualise risk likelihood vs impact' },
  '/controls':     { title: 'Control Mapping',      subtitle: 'Frameworks, controls & risk links' },
  '/evidence':     { title: 'Evidence Management',  subtitle: 'Upload and manage compliance evidence' },
  '/reports':      { title: 'Reports',              subtitle: 'Generate and download compliance reports' },
}

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const meta = pageMeta[pathname] ?? { title: 'SecureBank Platform', subtitle: '' }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={meta.title} subtitle={meta.subtitle} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
