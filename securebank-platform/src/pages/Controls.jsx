import { useEffect, useState, useCallback } from 'react'
import useControlStore from '../store/controlStore'
import useRiskStore from '../store/riskStore'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { PageLoader } from '../components/ui/Spinner'
import useAuthStore from '../store/authStore'

const FRAMEWORKS = ['ISO27001', 'PCIDSS', 'NISTCSF', 'SOX', 'ISO22301', 'GDPR']
const STATUSES   = ['NOT_STARTED', 'IN_PROGRESS', 'IMPLEMENTED', 'DEPRECATED']

const STATUS_BADGE = {
  NOT_STARTED:  'default',
  IN_PROGRESS:  'warning',
  IMPLEMENTED:  'success',
  DEPRECATED:   'danger',
}

const FRAMEWORK_COLORS = {
  ISO27001: 'bg-blue-100 text-blue-700',
  PCIDSS:   'bg-purple-100 text-purple-700',
  NISTCSF:  'bg-cyan-100 text-cyan-700',
  SOX:      'bg-amber-100 text-amber-700',
  ISO22301: 'bg-green-100 text-green-700',
  GDPR:     'bg-rose-100 text-rose-700',
}

function ControlForm({ initial = {}, onSave, onCancel, saving, risks = [] }) {
  const [form, setForm] = useState({
    title:         initial.title         ?? '',
    description:   initial.description   ?? '',
    framework:     initial.framework     ?? 'ISO27001',
    controlRef:    initial.controlRef    ?? '',
    status:        initial.status        ?? 'NOT_STARTED',
    effectiveness: initial.effectiveness ?? 0,
    riskIds:       initial.risks?.map((r) => r.id) ?? [],
  })
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }))

  const toggleRisk = (id) => {
    setForm((s) => ({
      ...s,
      riskIds: s.riskIds.includes(id) ? s.riskIds.filter((x) => x !== id) : [...s.riskIds, id],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, effectiveness: Number(form.effectiveness) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Title *" value={form.title} onChange={(e) => set('title', e.target.value)} required />
        <Input label="Control Ref *" placeholder="PR.AC-1" value={form.controlRef} onChange={(e) => set('controlRef', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 resize-none" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Framework</label>
          <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" value={form.framework} onChange={(e) => set('framework', e.target.value)}>
            {FRAMEWORKS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Effectiveness: {form.effectiveness}%</label>
        <input type="range" min={0} max={100} step={5} value={form.effectiveness} onChange={(e) => set('effectiveness', e.target.value)} className="w-full accent-brand-600" />
      </div>
      {risks.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Link to Risks</p>
          <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1">
            {risks.map((r) => (
              <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 px-2 py-1 rounded">
                <input type="checkbox" checked={form.riskIds.includes(r.id)} onChange={() => toggleRisk(r.id)} className="accent-brand-600" />
                <span className="font-medium text-slate-800">{r.title}</span>
                <span className="text-slate-400 text-xs">— score: {r.likelihood * r.impact}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>Save Control</Button>
      </div>
    </form>
  )
}

export default function Controls() {
  const {
    controls, frameworkSummary, pagination, isLoading, error, filters,
    fetchControls, fetchSummary, setFilters, createControl, updateControl, deleteControl,
  } = useControlStore()

  const { risks, fetchRisks } = useRiskStore()
  const { user } = useAuthStore()
  const canWrite = ['GRC_ANALYST', 'ADMIN'].includes(user?.role)

  const [showCreate, setShowCreate] = useState(false)
  const [editControl, setEditControl] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    const p = {}
    if (filters.search)    p.search    = filters.search
    if (filters.framework) p.framework = filters.framework
    if (filters.status)    p.status    = filters.status
    fetchControls(p)
  }, [filters, fetchControls])

  useEffect(() => {
    load()
    fetchSummary()
    fetchRisks({ limit: 100 })
  }, [load, fetchSummary, fetchRisks])

  const handleCreate = async (payload) => {
    setSaving(true)
    try { await createControl(payload); setShowCreate(false) }
    finally { setSaving(false) }
  }

  const handleUpdate = async (payload) => {
    setSaving(true)
    try { await updateControl(editControl.id, payload); setEditControl(null) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this control?')) return
    await deleteControl(id)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Control Mapping</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total} controls across {FRAMEWORKS.length} frameworks</p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowCreate(true)}>
            <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New Control
          </Button>
        )}
      </div>

      {/* Framework Summary Cards */}
      {frameworkSummary && frameworkSummary.byFramework?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {frameworkSummary.byFramework.map((fw) => (
            <Card key={fw.framework} className={`${FRAMEWORK_COLORS[fw.framework] ?? 'bg-slate-100 text-slate-700'} border-0 py-3 text-center`}>
              <p className="text-xs font-bold mb-1">{fw.framework}</p>
              <p className="text-2xl font-bold">{fw.avgEffectiveness}%</p>
              <p className="text-xs opacity-75 mt-0.5">{fw.count} controls</p>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="py-3">
        <div className="flex flex-wrap gap-3">
          <input className="flex-1 min-w-[180px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="Search controls…" value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} />
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={filters.framework} onChange={(e) => setFilters({ framework: e.target.value })}>
            <option value="">All Frameworks</option>
            {FRAMEWORKS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => setFilters({ search: '', framework: '', status: '' })}>Reset</Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-16"><PageLoader /></div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : controls.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No controls found. {canWrite && 'Add your first control to start mapping.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Ref</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Title</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Framework</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Effectiveness</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Linked Risks</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {controls.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.controlRef}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-xs">
                      <div className="truncate">{c.title}</div>
                      {c.description && <div className="text-xs text-slate-400 truncate">{c.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${FRAMEWORK_COLORS[c.framework] ?? 'bg-slate-100 text-slate-700'}`}>{c.framework}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[c.status]} size="sm">{c.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[80px]">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${c.effectiveness}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-600 w-8">{c.effectiveness}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{c.risks?.length ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      {canWrite && (
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-xs text-brand-600 hover:underline" onClick={() => setEditControl(c)}>Edit</button>
                          <button className="text-xs text-red-500 hover:underline" onClick={() => handleDelete(c.id)}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Control" size="xl">
        <ControlForm onSave={handleCreate} onCancel={() => setShowCreate(false)} saving={saving} risks={risks} />
      </Modal>

      <Modal isOpen={!!editControl} onClose={() => setEditControl(null)} title="Edit Control" size="xl">
        {editControl && <ControlForm initial={editControl} onSave={handleUpdate} onCancel={() => setEditControl(null)} saving={saving} risks={risks} />}
      </Modal>
    </div>
  )
}
