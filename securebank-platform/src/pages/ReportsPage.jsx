import { useEffect, useState, useRef, useCallback } from 'react'
import { reportsApi } from '../api/reports'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import useAuthStore from '../store/authStore'

const REPORT_TYPES   = ['RISK', 'COMPLIANCE', 'CONTROLS', 'EVIDENCE', 'AUDIT']
const REPORT_FORMATS = ['PDF', 'XLSX', 'CSV']
const STATUS_BADGE   = { GENERATING: 'generating', READY: 'ready', FAILED: 'rejected' }

const TYPE_INFO = {
  RISK:        { label: 'Risk Report',       icon: '⚠', desc: 'Full list of tracked risks with scores and status' },
  COMPLIANCE:  { label: 'Compliance Report', icon: '✓', desc: 'Framework compliance scores and gap analysis' },
  CONTROLS:    { label: 'Controls Report',   icon: '🛡', desc: 'Control effectiveness and implementation status' },
  EVIDENCE:    { label: 'Evidence Report',   icon: '📎', desc: 'Evidence inventory and approval status' },
  AUDIT:       { label: 'Audit Trail',       icon: '📋', desc: 'Complete audit log of platform activities' },
}

function GenerateForm({ onSave, onCancel, saving }) {
  const [type, setType]     = useState('RISK')
  const [format, setFormat] = useState('PDF')
  const [title, setTitle]   = useState('')

  const info = TYPE_INFO[type]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Report Type</p>
        <div className="grid grid-cols-1 gap-2">
          {REPORT_TYPES.map((t) => (
            <label
              key={t}
              className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-all ${type === t ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="accent-brand-600" />
              <span className="text-lg">{TYPE_INFO[t].icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-800">{TYPE_INFO[t].label}</p>
                <p className="text-xs text-slate-500">{TYPE_INFO[t].desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
          <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" value={format} onChange={(e) => setFormat(e.target.value)}>
            {REPORT_FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Custom Title (optional)</label>
          <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder={`${TYPE_INFO[type].label}…`} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave({ type, format, title })} loading={saving}>Generate Report</Button>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { user } = useAuthStore()
  const canGenerate = ['GRC_ANALYST', 'AUDITOR', 'ADMIN'].includes(user?.role)
  const canDelete   = user?.role === 'ADMIN'

  const [reports, setReports]           = useState([])
  const [isLoading, setIsLoading]       = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  const [saving, setSaving]             = useState(false)
  const pollRef                         = useRef(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await reportsApi.list()
      setReports(data.data ?? [])
      return data.data ?? []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Poll every 2s while any report is GENERATING, stop when all are READY/FAILED
  const startPolling = useCallback(() => {
    if (pollRef.current) return
    pollRef.current = setInterval(async () => {
      const list = await reportsApi.list().then((r) => r.data.data ?? [])
      setReports(list)
      const stillGenerating = list.some((r) => r.status === 'GENERATING')
      if (!stillGenerating) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }, 2000)
  }, [])

  useEffect(() => {
    load()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [load])

  const handleGenerate = async (payload) => {
    setSaving(true)
    try {
      await reportsApi.generate(payload)
      setShowGenerate(false)
      await load()
      startPolling()
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async (r) => {
    try {
      const { data } = await reportsApi.download(r.id)
      const url = URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `${r.title.replace(/[^a-z0-9]/gi, '_')}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Report file is not ready for download yet.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return
    await reportsApi.remove(id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate and manage security &amp; compliance reports</p>
        </div>
        {canGenerate && (
          <Button onClick={() => setShowGenerate(true)}>
            <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            Generate Report
          </Button>
        )}
      </div>

      <Card padding={false}>
        {isLoading ? (
          <div className="flex justify-center py-16"><PageLoader /></div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">No reports yet. {canGenerate && 'Generate your first report.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">Title</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Format</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Generated by</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm">{TYPE_INFO[r.type]?.icon}</span>
                      <span className="ml-1 text-slate-600">{r.type}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.format}</td>
                    <td className="px-4 py-3">
                      <Badge label={r.status} variant={STATUS_BADGE[r.status] ?? 'default'} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.generatedBy?.firstName} {r.generatedBy?.lastName}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === 'READY' && (
                          <button className="text-xs text-brand-600 hover:underline" onClick={() => handleDownload(r)}>Download</button>
                        )}
                        {canDelete && (
                          <button className="text-xs text-red-500 hover:underline" onClick={() => handleDelete(r.id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate New Report" size="lg">
        <GenerateForm onSave={handleGenerate} onCancel={() => setShowGenerate(false)} saving={saving} />
      </Modal>
    </div>
  )
}
