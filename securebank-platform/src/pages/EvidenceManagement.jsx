import { useState, useRef } from 'react'
import { mockEvidence, mockControls } from '../api/mock/data'
import Card, { CardHeader } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input, { Select } from '../components/ui/Input'
import MockDataBanner from '../components/ui/MockDataBanner'

const TYPE_ICONS = {
  document: (
    <svg className="h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  image: (
    <svg className="h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  report: (
    <svg className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  log: (
    <svg className="h-8 w-8 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
}

const STATUS_FILTER = ['all', 'approved', 'pending', 'review', 'rejected']

export default function EvidenceManagement() {
  const [items, setItems] = useState(mockEvidence)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const [uploadForm, setUploadForm] = useState({
    title: '',
    control_id: '',
    notes: '',
  })

  const filtered = items.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const controlName = (id) => mockControls.find((c) => c.id === id)?.title ?? `Control #${id}`

  const handleUpload = async (e) => {
    e.preventDefault()
    setUploading(true)
    // Simulate upload progress
    for (let p = 0; p <= 100; p += 10) {
      await new Promise((r) => setTimeout(r, 80))
      setUploadProgress(p)
    }
    const newItem = {
      id: items.length + 1,
      title: uploadForm.title,
      type: 'document',
      control_id: parseInt(uploadForm.control_id) || 1,
      uploaded_by: 'Alex Johnson',
      uploaded_at: new Date().toISOString().split('T')[0],
      status: 'pending',
      file_size: '—',
    }
    setItems((prev) => [newItem, ...prev])
    setUploading(false)
    setUploadProgress(0)
    setUploadOpen(false)
    setUploadForm({ title: '', control_id: '', notes: '' })
  }

  const statusCounts = STATUS_FILTER.reduce((acc, s) => {
    acc[s] = s === 'all' ? items.length : items.filter((e) => e.status === s).length
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <MockDataBanner />
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Evidence', value: items.length, color: 'text-slate-800', bg: 'bg-white' },
          { label: 'Approved',       value: statusCounts.approved, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Pending Review', value: statusCounts.pending + statusCounts.review, color: 'text-yellow-700', bg: 'bg-yellow-50' },
          { label: 'Rejected',       value: statusCounts.rejected, color: 'text-red-700', bg: 'bg-red-50' },
        ].map((stat) => (
          <Card key={stat.label} className={`${stat.bg} border-0`}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_FILTER.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {s} ({statusCounts[s]})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search evidence..."
              className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-52"
            />
          </div>
          <Button onClick={() => setUploadOpen(true)} size="sm">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload Evidence
          </Button>
        </div>
      </div>

      {/* Evidence grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card
            key={item.id}
            hover
            className="cursor-pointer"
            onClick={() => setDetailItem(item)}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0">{TYPE_ICONS[item.type] ?? TYPE_ICONS.document}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {controlName(item.control_id)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge label={item.status} variant={item.status} />
                  <span className="text-xs text-slate-400">{item.file_size}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{item.uploaded_by}</span>
              <span>{item.uploaded_at}</span>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="sm:col-span-2 xl:col-span-3 py-16 text-center text-slate-400">
            <svg className="h-12 w-12 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm">No evidence items match your filters.</p>
          </div>
        )}
      </div>

      {/* Upload modal */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Evidence"
        size="md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setUploadOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button size="sm" loading={uploading} onClick={handleUpload}>
              Upload
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            label="Title"
            required
            placeholder="e.g. MFA Configuration Screenshot"
            value={uploadForm.title}
            onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Select
            label="Linked Control"
            required
            value={uploadForm.control_id}
            onChange={(e) => setUploadForm((f) => ({ ...f, control_id: e.target.value }))}
          >
            <option value="">Select a control…</option>
            {mockControls.map((c) => (
              <option key={c.id} value={c.id}>{c.control_id} – {c.title}</option>
            ))}
          </Select>

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors"
          >
            <svg className="h-8 w-8 mx-auto mb-2 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-slate-500">Click to select or drag & drop a file</p>
            <p className="text-xs text-slate-400 mt-1">PDF, DOCX, PNG, XLSX — max 50 MB</p>
            <input ref={fileRef} type="file" className="hidden" />
          </div>

          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-100"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        title={detailItem?.title}
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDetailItem(null)}>Close</Button>
            <Button size="sm" variant="ghost">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </Button>
          </div>
        }
      >
        {detailItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-4">
              {TYPE_ICONS[detailItem.type]}
              <div>
                <p className="text-sm font-semibold text-slate-800">{detailItem.title}</p>
                <p className="text-xs text-slate-400 capitalize">{detailItem.type} · {detailItem.file_size}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Status',        value: <Badge label={detailItem.status} variant={detailItem.status} /> },
                { label: 'Type',          value: <span className="capitalize">{detailItem.type}</span> },
                { label: 'Linked Control',value: controlName(detailItem.control_id) },
                { label: 'File Size',     value: detailItem.file_size },
                { label: 'Uploaded By',   value: detailItem.uploaded_by },
                { label: 'Upload Date',   value: detailItem.uploaded_at },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-xs text-slate-400 mb-0.5">{row.label}</p>
                  <div className="text-sm text-slate-700">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
