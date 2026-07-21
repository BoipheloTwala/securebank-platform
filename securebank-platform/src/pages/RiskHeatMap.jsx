import { useEffect, useState } from 'react'
import useRiskStore from '../store/riskStore'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

const LIKELIHOOD_LABELS = { 1: 'Rare', 2: 'Unlikely', 3: 'Possible', 4: 'Likely', 5: 'Almost Certain' }
const IMPACT_LABELS     = { 1: 'Negligible', 2: 'Minor', 3: 'Moderate', 4: 'Major', 5: 'Catastrophic' }

const STATUS_BADGE = {
  OPEN:        'danger',
  IN_PROGRESS: 'warning',
  MITIGATED:   'success',
  ACCEPTED:    'info',
  CLOSED:      'default',
}

function cellColor(l, i) {
  const s = l * i
  if (s >= 20) return 'bg-red-600 text-white'
  if (s >= 12) return 'bg-orange-500 text-white'
  if (s >= 6)  return 'bg-yellow-400 text-slate-900'
  if (s >= 3)  return 'bg-green-400 text-slate-900'
  return 'bg-cyan-200 text-slate-800'
}

function cellLabel(l, i) {
  const s = l * i
  if (s >= 20) return 'Critical'
  if (s >= 12) return 'High'
  if (s >= 6)  return 'Medium'
  if (s >= 3)  return 'Low'
  return 'Minimal'
}

function riskLevel(s) {
  if (s >= 20) return { label: 'Critical', color: 'bg-red-100 text-red-700' }
  if (s >= 12) return { label: 'High',     color: 'bg-orange-100 text-orange-700' }
  if (s >= 6)  return { label: 'Medium',   color: 'bg-yellow-100 text-yellow-700' }
  return               { label: 'Low',     color: 'bg-green-100 text-green-700' }
}

export default function RiskHeatMap() {
  const { risks, isLoading, fetchRisks } = useRiskStore()
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchRisks({ limit: 200 }) }, [fetchRisks])

  const getRisksForCell = (l, i) => risks.filter((r) => r.likelihood === l && r.impact === i)

  const openCell = (l, i) => {
    const cellRisks = getRisksForCell(l, i)
    if (cellRisks.length > 0) setSelected({ likelihood: l, impact: i, risks: cellRisks })
  }

  if (isLoading && risks.length === 0) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Heat map */}
        <Card className="xl:col-span-2" padding={false}>
          <div className="p-5 pb-3">
            <CardHeader title="Risk Heat Map" subtitle="Click a cell to view risks at that position" />
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { label: 'Critical (20–25)', color: 'bg-red-600' },
                { label: 'High (12–19)',     color: 'bg-orange-500' },
                { label: 'Medium (6–11)',    color: 'bg-yellow-400' },
                { label: 'Low (3–5)',        color: 'bg-green-400' },
                { label: 'Minimal (1–2)',    color: 'bg-cyan-200' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`h-3 w-3 rounded-sm ${item.color}`} />
                  <span className="text-xs text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 pb-6 overflow-x-auto">
            <div className="min-w-[540px]">
              <div className="flex gap-2 mb-2">
                <div className="w-32 shrink-0" />
                {[1, 2, 3, 4, 5].map((impact) => (
                  <div key={impact} className="flex-1 text-center">
                    <p className="text-xs font-semibold text-slate-700">{impact}</p>
                    <p className="text-xs text-slate-400 leading-tight">{IMPACT_LABELS[impact]}</p>
                  </div>
                ))}
              </div>
              {[5, 4, 3, 2, 1].map((likelihood) => (
                <div key={likelihood} className="flex gap-2 mb-2">
                  <div className="w-32 shrink-0 flex flex-col justify-center pr-2">
                    <p className="text-xs font-semibold text-slate-700 leading-tight">{likelihood} — {LIKELIHOOD_LABELS[likelihood]}</p>
                  </div>
                  {[1, 2, 3, 4, 5].map((impact) => {
                    const count = getRisksForCell(likelihood, impact).length
                    return (
                      <button
                        key={impact}
                        onClick={() => openCell(likelihood, impact)}
                        className={`flex-1 h-16 rounded-xl flex flex-col items-center justify-center gap-0.5 font-medium text-xs transition-all duration-150 ${cellColor(likelihood, impact)} ${count > 0 ? 'ring-2 ring-offset-1 ring-slate-400 cursor-pointer hover:scale-105' : 'opacity-70 cursor-default'}`}
                        title={`L${likelihood} × I${impact} = ${likelihood * impact} (${cellLabel(likelihood, impact)})`}
                      >
                        {count > 0 && <><span className="text-lg font-bold leading-none">{count}</span><span className="opacity-75 text-[10px]">risk{count !== 1 ? 's' : ''}</span></>}
                      </button>
                    )
                  })}
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <div className="w-32 shrink-0" />
                <p className="text-xs text-slate-400 flex-1 text-center">Impact →</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Risk list */}
        <Card padding={false}>
          <div className="p-5 pb-3">
            <CardHeader title="All Risks" subtitle={`${risks.length} total`} />
          </div>
          {risks.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400">No risks yet. Create risks to populate the heatmap.</div>
          ) : (
            <div className="divide-y divide-slate-50 overflow-y-auto max-h-[480px]">
              {risks.map((risk) => {
                const score = risk.likelihood * risk.impact
                const level = riskLevel(score)
                return (
                  <button
                    key={risk.id}
                    onClick={() => setSelected({ likelihood: risk.likelihood, impact: risk.impact, risks: [risk] })}
                    className="w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{risk.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {risk.category} · {risk.owner ? `${risk.owner.firstName} ${risk.owner.lastName}` : 'Unassigned'}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${level.color}`}>{level.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Risks — L${selected.likelihood} × I${selected.impact} = ${selected.likelihood * selected.impact}` : ''}
        size="md"
      >
        {selected && (
          <div className="space-y-3">
            <div className="flex gap-6 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
              <div><span className="font-semibold">Likelihood:</span> {selected.likelihood} — {LIKELIHOOD_LABELS[selected.likelihood]}</div>
              <div><span className="font-semibold">Impact:</span> {selected.impact} — {IMPACT_LABELS[selected.impact]}</div>
            </div>
            {selected.risks.map((risk) => (
              <div key={risk.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{risk.title}</p>
                  <Badge variant={STATUS_BADGE[risk.status]} size="sm">{risk.status.replace('_', ' ')}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span><strong>Category:</strong> {risk.category}</span>
                  <span><strong>Score:</strong> {risk.likelihood * risk.impact}</span>
                  <span><strong>Owner:</strong> {risk.owner ? `${risk.owner.firstName} ${risk.owner.lastName}` : '—'}</span>
                  <span><strong>Created:</strong> {new Date(risk.createdAt).toLocaleDateString()}</span>
                </div>
                {risk.description && <p className="text-xs text-slate-500 italic">{risk.description}</p>}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
