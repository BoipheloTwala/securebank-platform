import { useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { mockControls, mockRisks } from '../api/mock/data'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import MockDataBanner from '../components/ui/MockDataBanner'

const FRAMEWORKS = ['All', 'ISO 27001', 'PCI-DSS', 'NIST CSF', 'ISO 22301']

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'not_started', label: 'Not Started' },
]

function EffectivenessBar({ value }) {
  const color =
    value >= 80 ? 'bg-emerald-500' :
    value >= 60 ? 'bg-yellow-400' :
    value > 0   ? 'bg-orange-400' :
                  'bg-slate-200'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600 w-8 text-right">{value}%</span>
    </div>
  )
}

const radarData = [
  { subject: 'ISO 27001',  score: 84 },
  { subject: 'PCI-DSS',   score: 79 },
  { subject: 'NIST CSF',  score: 91 },
  { subject: 'SOX',       score: 88 },
  { subject: 'ISO 22301', score: 55 },
]

export default function ControlMapping() {
  const [framework, setFramework] = useState('All')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = mockControls.filter((c) => {
    if (framework !== 'All' && c.framework !== framework) return false
    if (statusFilter && c.status !== statusFilter) return false
    return true
  })

  const linkedRisks = selected
    ? mockRisks.filter((r) => selected.risk_ids.includes(r.id))
    : []

  const columns = [
    {
      key: 'control_id',
      label: 'Control ID',
      className: 'font-mono text-xs text-slate-500 whitespace-nowrap',
    },
    { key: 'title', label: 'Control Title' },
    {
      key: 'framework',
      label: 'Framework',
      render: (v) => (
        <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
          {v}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v.replace('_', ' ')} variant={v} />,
    },
    {
      key: 'effectiveness',
      label: 'Effectiveness',
      className: 'min-w-[140px]',
      render: (v) => <EffectivenessBar value={v} />,
    },
    {
      key: 'risk_ids',
      label: 'Linked Risks',
      render: (v) => (
        <span className="text-xs text-slate-500">{v.length} risk{v.length !== 1 ? 's' : ''}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <MockDataBanner />
      {/* Framework tabs + status filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {FRAMEWORKS.map((f) => (
            <button
              key={f}
              onClick={() => setFramework(f)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                framework === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-44"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Controls table */}
        <div className="xl:col-span-2 space-y-4">
          <Card padding={false}>
            <div className="p-5 pb-3">
              <CardHeader
                title="Controls"
                subtitle={`${filtered.length} control${filtered.length !== 1 ? 's' : ''} · click a row for details`}
              />
            </div>
            <div className="px-5 pb-5">
              <Table
                columns={columns}
                data={filtered}
                onRowClick={setSelected}
                emptyMessage="No controls match the selected filters."
              />
            </div>
          </Card>
        </div>

        {/* Radar chart */}
        <Card padding={false}>
          <div className="p-5 pb-2">
            <CardHeader
              title="Framework Coverage"
              subtitle="Radar of compliance scores"
            />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <Radar
                dataKey="score"
                stroke="#1d4ed8"
                fill="#1d4ed8"
                fillOpacity={0.18}
                strokeWidth={2}
                dot={{ r: 4, fill: '#1d4ed8' }}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, 'Score']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 11 }}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="px-5 pb-5 space-y-2">
            {radarData.map((d) => (
              <div key={d.subject} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{d.subject}</span>
                <span className={`font-semibold ${d.score >= 80 ? 'text-emerald-600' : d.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {d.score}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Control detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title}
        size="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected && (
          <div className="space-y-5">
            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Control ID</p>
                <p className="font-mono font-medium text-slate-800">{selected.control_id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Framework</p>
                <p className="font-medium text-slate-800">{selected.framework}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Status</p>
                <Badge label={selected.status.replace('_', ' ')} variant={selected.status} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Effectiveness</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${selected.effectiveness >= 80 ? 'bg-emerald-500' : selected.effectiveness >= 60 ? 'bg-yellow-400' : 'bg-orange-400'}`}
                      style={{ width: `${selected.effectiveness}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-800">{selected.effectiveness}%</span>
                </div>
              </div>
            </div>

            {/* Linked risks */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-3">
                Linked Risks ({linkedRisks.length})
              </h4>
              {linkedRisks.length === 0 ? (
                <p className="text-sm text-slate-400">No linked risks.</p>
              ) : (
                <div className="space-y-2">
                  {linkedRisks.map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{risk.title}</p>
                        <p className="text-xs text-slate-400">{risk.category} · {risk.owner}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge label={risk.status} variant={risk.status} />
                        <span className="text-xs font-bold text-slate-500">
                          {risk.likelihood * risk.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
