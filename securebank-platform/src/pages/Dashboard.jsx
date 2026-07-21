import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import useRiskStore from '../store/riskStore'
import { dashboardApi } from '../api/dashboard'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'

const KPI_CARDS = [
  { key: 'total_risks',      label: 'Total Risks',      color: 'text-slate-800', bg: 'bg-slate-50',   icon: '⚠' },
  { key: 'critical_risks',   label: 'Critical Risks',   color: 'text-red-700',   bg: 'bg-red-50',     icon: '🔴' },
  { key: 'open_controls',    label: 'Open Controls',    color: 'text-blue-700',  bg: 'bg-blue-50',    icon: '🛡' },
  { key: 'compliance_score', label: 'Compliance Score', color: 'text-emerald-700',bg:'bg-emerald-50', icon: '📈', suffix: '%' },
  { key: 'evidence_pending', label: 'Evidence Pending', color: 'text-amber-700', bg: 'bg-amber-50',   icon: '📎' },
]

const TREND_COLORS   = { critical: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#16a34a' }
const COMPLIANCE_CLR = ['#1d4ed8', '#0891b2', '#7c3aed', '#be185d', '#16a34a', '#d97706']
const ACTIVITY_ICONS = {
  risk_created:    { bg: 'bg-red-100',    color: 'text-red-600',    icon: '⚠' },
  evidence_added:  { bg: 'bg-blue-100',   color: 'text-blue-600',   icon: '📎' },
  control_updated: { bg: 'bg-purple-100', color: 'text-purple-600', icon: '🛡' },
  report_ready:    { bg: 'bg-green-100',  color: 'text-green-600',  icon: '📊' },
}

export default function Dashboard() {
  const { trend, fetchTrend } = useRiskStore()

  const [kpis,       setKpis]       = useState(null)
  const [activity,   setActivity]   = useState([])
  const [compliance, setCompliance] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [k, a, c] = await Promise.all([
          dashboardApi.kpis(),
          dashboardApi.activity(8),
          dashboardApi.complianceScore(),
        ])
        setKpis(k.data.data)
        setActivity(a.data.data ?? [])
        setCompliance(c.data.data ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
    fetchTrend()
  }, [fetchTrend])

  if (loading && !kpis) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPI_CARDS.map((card) => {
          const value = kpis?.[card.key] ?? '—'
          return (
            <Card key={card.key} className={`${card.bg} border-0`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>
                {value}{card.suffix || ''}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{card.label}</p>
            </Card>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Risk Trend */}
        <Card className="xl:col-span-2" padding={false}>
          <div className="p-5 pb-2">
            <CardHeader title="Risk Trend (6 months)" subtitle="Open risks by severity over time" />
          </div>
          <div className="px-2 pb-4">
            {trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trend} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    {Object.entries(TREND_COLORS).map(([key, color]) => (
                      <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  {Object.entries(TREND_COLORS).map(([key, color]) => (
                    <Area key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} fill={`url(#grad-${key})`} dot={{ r: 3, fill: color }} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400 text-sm">No risk data yet — create risks to see trends</div>
            )}
          </div>
        </Card>

        {/* Compliance Scores */}
        <Card padding={false}>
          <div className="p-5 pb-2">
            <CardHeader title="Compliance by Framework" subtitle="Current compliance score" />
          </div>
          {compliance.length > 0 ? (
            <>
              <div className="px-5 pb-4 space-y-3">
                {compliance.map((item, i) => (
                  <div key={item.framework}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{item.framework}</span>
                      <span className="text-xs font-bold text-slate-900">{item.score}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.score}%`, backgroundColor: COMPLIANCE_CLR[i % COMPLIANCE_CLR.length] }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={compliance} dataKey="score" nameKey="framework" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {compliance.map((_, i) => <Cell key={i} fill={COMPLIANCE_CLR[i % COMPLIANCE_CLR.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v, name) => [`${v}%`, name]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm px-5 text-center">Add controls with framework tags to see compliance scores</div>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Risk distribution */}
        <Card padding={false}>
          <div className="p-5 pb-2">
            <CardHeader title="Risk Distribution" subtitle="By severity level" />
          </div>
          <div className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { level: 'Critical', count: kpis?.critical_risks ?? 0, fill: '#dc2626' },
                  { level: 'High',     count: kpis?.high_risks    ?? 0, fill: '#ea580c' },
                ]}
                margin={{ top: 5, right: 20, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {[{ fill: '#dc2626' }, { fill: '#ea580c' }].map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card padding={false}>
          <div className="p-5 pb-2">
            <CardHeader title="Recent Activity" subtitle="Latest platform events" />
          </div>
          {activity.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {activity.map((item) => {
                const meta = ACTIVITY_ICONS[item.type] ?? { bg: 'bg-slate-100', color: 'text-slate-600', icon: '·' }
                return (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className={`shrink-0 h-8 w-8 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center text-sm`}>{meta.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{item.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.user} · {item.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No activity yet</div>
          )}
        </Card>
      </div>
    </div>
  )
}
