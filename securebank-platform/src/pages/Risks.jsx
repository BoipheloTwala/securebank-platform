import { useEffect, useState, useCallback } from 'react'
import useRiskStore from '../store/riskStore'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { PageLoader } from '../components/ui/Spinner'
import useAuthStore from '../store/authStore'

const CATEGORIES = ['TECHNICAL', 'OPERATIONAL', 'COMPLIANCE', 'FINANCIAL', 'REPUTATIONAL', 'STRATEGIC']
const STATUSES   = ['OPEN', 'IN_PROGRESS', 'MITIGATED', 'ACCEPTED', 'CLOSED']

const STATUS_BADGE = {
  OPEN:        'danger',
  IN_PROGRESS: 'warning',
  MITIGATED:   'success',
  ACCEPTED:    'info',
  CLOSED:      'default',
}

const scoreBg = (s) => {
  if (s >= 20) return 'bg-red-600 text-white'
  if (s >= 12) return 'bg-orange-500 text-white'
  if (s >= 6)  return 'bg-yellow-400 text-slate-900'
  return 'bg-emerald-400 text-white'
}

function RiskForm({ initial = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    title:       initial.title       ?? '',
    description: initial.description ?? '',
    category:    initial.category    ?? 'TECHNICAL',
    likelihood:  initial.likelihood  ?? 3,
    impact:      initial.impact      ?? 3,
    status:      initial.status      ?? 'OPEN',
    dueDate:     initial.dueDate     ? initial.dueDate.slice(0, 10) : '',
  })
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      likelihood: Number(form.likelihood),
      impact:     Number(form.impact),
      dueDate:    form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title *" value={form.title} onChange={(e) => set('title', e.target.value)} required />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          rows={3}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Likelihood (1–5): {form.likelihood}</label>
          <input type="range" min={1} max={5} value={form.likelihood} onChange={(e) => set('likelihood', e.target.value)} className="w-full accent-brand-600" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Impact (1–5): {form.impact}</label>
          <input type="range" min={1} max={5} value={form.impact} onChange={(e) => set('impact', e.target.value)} className="w-full accent-brand-600" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Risk Score</label>
        <span className={`inline-block px-3 py-1 rounded-lg font-bold text-lg ${scoreBg(form.likelihood * form.impact)}`}>
          {form.likelihood * form.impact} / 25
        </span>
      </div>
      <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>Save Risk</Button>
      </div>
    </form>
  )
}

function RiskDetail({ risk, onEdit, onDelete, onClose }) {
  const score = risk.likelihood * risk.impact
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg">{risk.title}</h3>
          {risk.description && <p className="text-sm text-slate-600 mt-1">{risk.description}</p>}
        </div>
        <Badge variant={STATUS_BADGE[risk.status]}>{risk.status.replace('_', ' ')}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Likelihood</p>
          <p className="text-xl font-bold text-slate-900">{risk.likelihood}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Impact</p>
          <p className="text-xl font-bold text-slate-900">{risk.impact}</p>
        </div>
        <div className={`rounded-lg p-3 ${scoreBg(score)}`}>
          <p className="text-xs opacity-80 mb-1">Score</p>
          <p className="text-xl font-bold">{score}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-slate-500">Category:</span> <span className="font-medium text-slate-800">{risk.category}</span></div>
        {risk.dueDate && <div><span className="text-slate-500">Due:</span> <span className="font-medium text-slate-800">{new Date(risk.dueDate).toLocaleDateString()}</span></div>}
        {risk.owner && <div><span className="text-slate-500">Owner:</span> <span className="font-medium text-slate-800">{risk.owner.firstName} {risk.owner.lastName}</span></div>}
        <div><span className="text-slate-500">Created by:</span> <span className="font-medium text-slate-800">{risk.createdBy?.firstName} {risk.createdBy?.lastName}</span></div>
      </div>
      {risk.controls?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Linked Controls</p>
          <div className="flex flex-wrap gap-2">
            {risk.controls.map((c) => (
              <span key={c.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{c.controlRef} — {c.title}</span>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button variant="danger" size="sm" onClick={() => { onDelete(risk.id); onClose() }}>Delete</Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(risk)}>Edit</Button>
        <Button size="sm" onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}

export default function Risks() {
  const {
    risks, pagination, isLoading, error, filters,
    fetchRisks, setFilters, createRisk, updateRisk, deleteRisk,
  } = useRiskStore()

  const { user } = useAuthStore()
  const canWrite = ['ANALYST', 'GRC_ANALYST', 'ADMIN'].includes(user?.role)
  const canDelete = ['ANALYST', 'ADMIN'].includes(user?.role)

  const [showCreate, setShowCreate] = useState(false)
  const [editRisk,   setEditRisk]   = useState(null)
  const [viewRisk,   setViewRisk]   = useState(null)
  const [saving,     setSaving]     = useState(false)

  const load = useCallback(() => {
    const p = {}
    if (filters.search)     p.search     = filters.search
    if (filters.status)     p.status     = filters.status
    if (filters.category)   p.category   = filters.category
    if (filters.likelihood) p.likelihood = filters.likelihood
    if (filters.impact)     p.impact     = filters.impact
    p.page  = pagination.page
    p.limit = pagination.limit
    fetchRisks(p)
  }, [filters, pagination.page, pagination.limit, fetchRisks])

  useEffect(() => { load() }, [load])

  const handleCreate = async (payload) => {
    setSaving(true)
    try { await createRisk(payload); setShowCreate(false) }
    finally { setSaving(false) }
  }

  const handleUpdate = async (payload) => {
    setSaving(true)
    try { await updateRisk(editRisk.id, payload); setEditRisk(null) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this risk? This cannot be undone.')) return
    await deleteRisk(id)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Risk Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total} risks tracked</p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowCreate(true)}>
            <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            New Risk
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="py-3">
        <div className="flex flex-wrap gap-3">
          <input
            className="flex-1 min-w-[180px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            placeholder="Search risks…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={filters.category} onChange={(e) => setFilters({ category: e.target.value })}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => setFilters({ search: '', status: '', category: '' })}>Reset</Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-16"><PageLoader /></div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : risks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No risks found. {canWrite && 'Create your first risk to get started.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Title</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Score</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Owner</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {risks.map((risk) => {
                  const score = risk.likelihood * risk.impact
                  return (
                    <tr key={risk.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <button className="text-left font-medium text-slate-900 hover:text-brand-600" onClick={() => setViewRisk(risk)}>
                          {risk.title}
                        </button>
                        {risk.controls?.length > 0 && (
                          <span className="ml-2 text-xs text-slate-400">{risk.controls.length} control{risk.controls.length !== 1 ? 's' : ''}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 capitalize">{risk.category.toLowerCase()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${scoreBg(score)}`}>{score}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[risk.status]} size="sm">{risk.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {risk.owner ? `${risk.owner.firstName} ${risk.owner.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canWrite && (
                            <button className="text-xs text-brand-600 hover:underline" onClick={() => setEditRisk(risk)}>Edit</button>
                          )}
                          {canDelete && (
                            <button className="text-xs text-red-500 hover:underline" onClick={() => handleDelete(risk.id)}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-2">
              <Button size="xs" variant="outline" disabled={pagination.page <= 1} onClick={() => setFilters({ page: pagination.page - 1 })}>Prev</Button>
              <Button size="xs" variant="outline" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters({ page: pagination.page + 1 })}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Risk" size="lg">
        <RiskForm onSave={handleCreate} onCancel={() => setShowCreate(false)} saving={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editRisk} onClose={() => setEditRisk(null)} title="Edit Risk" size="lg">
        {editRisk && <RiskForm initial={editRisk} onSave={handleUpdate} onCancel={() => setEditRisk(null)} saving={saving} />}
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewRisk} onClose={() => setViewRisk(null)} title="Risk Details" size="lg">
        {viewRisk && (
          <RiskDetail
            risk={viewRisk}
            onEdit={(r) => { setViewRisk(null); setEditRisk(r) }}
            onDelete={handleDelete}
            onClose={() => setViewRisk(null)}
          />
        )}
      </Modal>
    </div>
  )
}
