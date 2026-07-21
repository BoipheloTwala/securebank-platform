import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import useUIStore from '../../store/uiStore'

export default function Header({ title, subtitle }) {
  const { user } = useAuthStore()
  const { notifications, removeNotification } = useUIStore()
  const [showNotifs, setShowNotifs] = useState(false)

  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Notifications</p>
                <button
                  onClick={() => setShowNotifs(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Close
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications</p>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50">
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{n.message}</p>
                        {n.time && <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>}
                      </div>
                      <button onClick={() => removeNotification(n.id)} className="text-slate-300 hover:text-slate-500 mt-0.5">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center">
            <span className="text-xs font-bold text-brand-700">
              {user?.full_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user?.full_name || 'User'}</p>
            <p className="text-xs text-slate-400 leading-tight">{user?.role || ''}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
