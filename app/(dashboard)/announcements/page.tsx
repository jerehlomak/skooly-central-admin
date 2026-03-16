'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { Announcement } from '@/types'
import { Plus, Send, Trash2, Globe } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

const TYPE_COLORS: Record<string, string> = {
    INFO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    WARNING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    MAINTENANCE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export default function AnnouncementsPage() {
    const [items, setItems] = useState<Announcement[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', body: '', type: 'INFO', targetGroup: 'ALL', isPublished: false })

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const r = await api.get('/announcements')
            setItems(r.data.announcements || [])
            setTotal(r.data.total || 0)
        } catch { toast.error('Failed to load announcements') } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/announcements', form)
            toast.success('Announcement published!')
            setShowForm(false)
            setForm({ title: '', body: '', type: 'INFO', targetGroup: 'ALL', isPublished: false })
            load()
        } catch { toast.error('Failed to create announcement') }
    }

    const del = async (id: string) => {
        if (!confirm('Delete this announcement?')) return
        try { await api.delete(`/announcements/${id}`); toast.success('Deleted'); load() }
        catch { toast.error('Failed') }
    }

    const publish = async (id: string) => {
        try { await api.put(`/announcements/${id}`, { isPublished: true }); toast.success('Published!'); load() }
        catch { toast.error('Failed') }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Global Announcements" subtitle={`${total} announcements total`} />
            <div className="p-6 space-y-5">

                <div className="flex justify-end">
                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        <Plus className="w-4 h-4" /> New Announcement
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.length === 0 && (
                            <div className="glass-card p-8 text-center text-slate-600">
                                <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No announcements yet. Create one to broadcast to all schools.</p>
                            </div>
                        )}
                        {items.map(a => (
                            <div key={a.id} className="glass-card p-5 flex gap-4 hover:border-blue-500/20 transition-all">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{a.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs border ${TYPE_COLORS[a.type] || TYPE_COLORS.INFO}`}>{a.type}</span>
                                        <span className="px-2 py-0.5 rounded-full text-xs border border-slate-700 text-slate-500">{a.targetGroup}</span>
                                        {a.isPublished && <span className="px-2 py-0.5 rounded-full text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">Published</span>}
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2">{a.body}</p>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                                        <span>By {a.admin?.name || 'Admin'}</span>
                                        <span>{formatRelativeTime(a.createdAt)}</span>
                                        {a.publishedAt && <span>Published {formatDate(a.publishedAt)}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    {!a.isPublished && (
                                        <button onClick={() => publish(a.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-emerald-500/20">
                                            <Send className="w-3 h-3" /> Publish
                                        </button>
                                    )}
                                    <button onClick={() => del(a.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20">
                                        <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
                        <div className="glass-card p-6 w-full max-w-lg rounded-2xl">
                            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>New Announcement</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Title *</label>
                                    <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Message *</label>
                                    <textarea required rows={4} value={form.body}
                                        onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Type', key: 'type', options: ['INFO', 'WARNING', 'MAINTENANCE'] },
                                        { label: 'Target', key: 'targetGroup', options: ['ALL', 'BASIC', 'PRO', 'ENTERPRISE'] },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                                            <select value={form[f.key as keyof typeof form] as string}
                                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isPublished}
                                        onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))}
                                        className="w-4 h-4 rounded accent-blue-500" />
                                    <span className="text-sm text-slate-400">Publish immediately</span>
                                </label>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="flex-1 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit"
                                        className="flex-1 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
