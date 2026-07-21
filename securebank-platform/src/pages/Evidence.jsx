import { useEffect, useState, useRef, useCallback } from 'react'
import useEvidenceStore from '../store/evidenceStore'
import useControlStore from '../store/controlStore'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import useAuthStore from '../store/authStore'

const STATUSES = ['PENDING', 'REVIEW', 'APPROVED', 'REJECTED']
const TYPE_ICON = {
  DOCUMENT:   '📄',
  IMAGE:      '🖼',
  REPORT:     '📊',
  LOG:        '📋',
  SCREENSHOT: '🖥',
  OTHER:      '📎',
}
const STATUS_BADGE = {
  PENDING:  'pending',
  REVIEW:   'review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

function UploadForm({ onSave, onCancel, saving, uploadProgress, controls = [] }) {
  const [file, setFile]         = useState(null)
  const [title, setTitle]       = useState('')
  const [notes, setNotes]       = useState('')
  const [controlId, setCtrlId]  = useState('')
  const fileRef = useRef()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', title || file.name)
    if (notes)     fd.append('notes', notes)
    if (controlId) fd.append('controlId', controlId)
    onSave(fd)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.gif,.webp" />
        {file ? (
          <div>
            <p className="text-brand-600 font-semibold">{file.name}</p>
            <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <svg className="h-10 w-10 text-slate-300 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <p className="text-sm text-slate-600 font-medium">Click to choose a file</p>
            <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, images, CSV — max 50 MB</p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
        <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder={file?.name || 'Evidence title'} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Link to Control (optional)</label>
        <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" value={controlId} onChange={(e) => setCtrlId(e.target.value)}>
          <option value="">— None —</option>
          {controls.map((c) => (
            <option key={c.id} value={c.id}>{c.controlRef} — {c.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 resize-none" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {saving && uploadProgress > 0 && (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Uploading…</span><span>{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving} disabled={!file}>Upload Evidence</Button>
      </div>
    </form>
  )
}

export default function Evidence() {
  const {
    evidence, pagination, isLoading, isUploading, uploadProgress, error, filters,
    fetchEvidence, setFilters, upload, updateEvidence, deleteEvidence, downloadEvidence,
  } = useEvidenceStore()

  const { controls, fetchControls } = useControlStore()
  const { user } = useAuthStore()
  const canUpload = ['ANALYST', 'GRC_ANALYST', 'ADMIN'].includes(user?.role)
  const canApprove = ['GRC_ANALYST', 'AUDITOR', 'ADMIN'].includes(user?.role)
  const canDelete = ['ANALYST', 'ADMIN'].includes(user?.role)

  const [showUpload, setShowUpload] = useState(false)

  const load = useCallback(() => {
    const p = {}
    if (filters.search)    p.search    = filters.search
    if (filters.status)    p.status    = filters.status
    if (filters.controlId) p.controlId = filters.controlId
    fetchEvidence(p)
  }, [filters, fetchEvidence])

  useEffect(() => {
    load()
    fetchControls({ limit: 100 })
  }, [load, fetchControls])

  const handleUpload = async (fd) => {
    await upload(fd)
    setShowUpload(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this evidence file?')) return
    await deleteEvidence(id)
  }

  const handleStatusChange = async (id, status) => {
    await updateEvidence(id, { status })
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Evidence Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total} files uploaded</p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowUpload(true)}>
            <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
            Upload Evidence
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="py-3">
        <div className="flex flex-wrap gap-3">
          <input className="flex-1 min-w-[180px] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="Search evidence…" value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} />
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={filters.controlId} onChange={(e) => setFilters({ controlId: e.target.value })}>
            <option value="">All Controls</option>
            {controls.map((c) => <option key={c.id} value={c.id}>{c.controlRef} — {c.title}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={() => setFilters({ search: '', status: '', controlId: '' })}>Reset</Button>
        </div>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><PageLoader /></div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : evidence.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">No evidence files found. {canUpload && 'Upload your first file.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {evidence.map((ev) => (
            <Card key={ev.id} padding={false} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{TYPE_ICON[ev.type] ?? '📎'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{ev.title}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{ev.fileName}</p>
                  </div>
                  <Badge label={ev.status} variant={STATUS_BADGE[ev.status] ?? 'default'} />
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  {ev.control && (
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Control:</span>
                      <span className="font-medium text-slate-700">{ev.control.controlRef}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>{formatSize(ev.fileSize)}</span>
                    <span>{new Date(ev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>by {ev.uploadedBy.firstName} {ev.uploadedBy.lastName}</div>
                  {ev.notes && <p className="italic text-slate-400">{ev.notes}</p>}
                </div>
              </div>

              <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between gap-2">
                <button
                  className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1"
                  onClick={() => downloadEvidence(ev.id, ev.fileName)}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Download
                </button>
                <div className="flex gap-2">
                  {canApprove && ev.status === 'PENDING' && (
                    <button className="text-xs text-emerald-600 hover:underline" onClick={() => handleStatusChange(ev.id, 'APPROVED')}>Approve</button>
                  )}
                  {canApprove && ev.status === 'PENDING' && (
                    <button className="text-xs text-amber-600 hover:underline" onClick={() => handleStatusChange(ev.id, 'REVIEW')}>Review</button>
                  )}
                  {canDelete && (
                    <button className="text-xs text-red-500 hover:underline" onClick={() => handleDelete(ev.id)}>Delete</button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Upload Evidence" size="lg">
        <UploadForm
          onSave={handleUpload}
          onCancel={() => setShowUpload(false)}
          saving={isUploading}
          uploadProgress={uploadProgress}
          controls={controls}
        />
      </Modal>
    </div>
  )
}
