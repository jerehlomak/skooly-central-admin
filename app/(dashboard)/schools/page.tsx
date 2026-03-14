'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { School, SubscriptionPlan } from '@/types'
import { formatDate, STATUS_COLORS } from '@/lib/utils'
import { Plus, Search, Ban, CheckCircle, Trash2, ChevronRight, Filter } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function SchoolsPage() {
    const [schools, setSchools] = useState<School[]>([])
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [showCreate, setShowCreate] = useState(false)
    const [credentials, setCredentials] = useState<{ email: string, password: string, loginUrl: string } | null>(null)
    const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', country: 'Nigeria', planId: '', adminEmail: '', groupId: '' })

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '15' })
            if (search) params.set('search', search)
            if (statusFilter) params.set('status', statusFilter)
            const res = await api.get(`/schools?${params}`)
            setSchools(res.data.schools)
            setTotal(res.data.total)
        } catch { toast.error('Failed to load schools') } finally { setLoading(false) }
    }, [page, search, statusFilter])

    useEffect(() => { load() }, [load])
    useEffect(() => {
        api.get('/plans').then(r => setPlans(r.data.plans))
        api.get('/groups').then(r => setGroups(r.data.groups))
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await api.post('/schools', form)
            toast.success('School created!')
            setShowCreate(false)
            setForm({ name: '', email: '', phone: '', address: '', country: 'Nigeria', planId: '', adminEmail: '', groupId: '' })
            if (res.data.credentials) {
                setCredentials(res.data.credentials)
            }
            load()
        } catch { toast.error('Failed to create school') }
    }

    const suspend = async (id: string) => {
        if (!confirm('Suspend this school?')) return
        try { await api.post(`/schools/${id}/suspend`, { reason: 'Admin action' }); toast.success('School suspended'); load() }
        catch { toast.error('Failed') }
    }

    const activate = async (id: string) => {
        try { await api.post(`/schools/${id}/activate`); toast.success('School activated'); load() }
        catch { toast.error('Failed') }
    }

    const del = async (id: string) => {
        if (!confirm('Mark school as deleted?')) return
        try { await api.delete(`/schools/${id}`); toast.success('School deleted'); load() }
        catch { toast.error('Failed') }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Schools Management" subtitle={`${total} schools on the platform`} />
            <div className="p-6 space-y-5">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl max-w-sm"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                            placeholder="Search by name or email…"
                            className="bg-transparent outline-none text-sm text-slate-300 placeholder-slate-600 w-full" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                            className="px-3 py-2 rounded-xl text-sm text-slate-300 outline-none"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <option value="">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        <Plus className="w-4 h-4" />
                        Add School
                    </button>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                                    {['School', 'Plan', 'Students', 'Teachers', 'Status', 'Joined', 'Actions'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                {loading ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">Loading…</td></tr>
                                ) : schools.length === 0 ? (
                                    <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">No schools found.</td></tr>
                                ) : schools.map(s => (
                                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                                                    style={{ background: 'linear-gradient(135deg, #3b82f640, #8b5cf640)' }}>
                                                    {s.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                                                    <p className="text-xs text-slate-500">{s.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-400">{s.plan?.name || <span className="text-slate-600">—</span>}</td>
                                        <td className="px-4 py-3 text-sm text-slate-400">{s.studentCount.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-sm text-slate-400">{s.teacherCount}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs border ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{formatDate(s.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <Link href={`/schools/${s.id}`}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" title="View">
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </Link>
                                                {s.status === 'ACTIVE' ? (
                                                    <button onClick={() => suspend(s.id)}
                                                        className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-colors" title="Suspend">
                                                        <Ban className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : (
                                                    <button onClick={() => activate(s.id)}
                                                        className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-slate-400 hover:text-emerald-400 transition-colors" title="Activate">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button onClick={() => del(s.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {total > 15 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                            <p className="text-xs text-slate-500">Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:bg-white/10 disabled:opacity-30 transition-colors">Prev</button>
                                <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total}
                                    className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:bg-white/10 disabled:opacity-30 transition-colors">Next</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
                        <div className="glass-card p-6 w-full max-w-lg rounded-2xl">
                            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add New School</h2>
                            <form onSubmit={handleCreate} className="space-y-3">
                                {[
                                    { label: 'School Name', key: 'name', type: 'text', req: true },
                                    { label: 'Email', key: 'email', type: 'email', req: true },
                                    { label: 'Phone', key: 'phone', type: 'text', req: false },
                                    { label: 'Address', key: 'address', type: 'text', req: false },
                                    { label: 'Admin Email', key: 'adminEmail', type: 'email', req: false },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs text-slate-400 mb-1">{f.label}{f.req && ' *'}</label>
                                        <input type={f.type} required={f.req}
                                            value={form[f.key as keyof typeof form]}
                                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Subscription Plan</label>
                                    <select value={form.planId} onChange={e => setForm(p => ({ ...p, planId: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                        <option value="">No Plan</option>
                                        {plans.map(p => <option key={p.id} value={p.id}>{p.name} (${p.monthlyPrice}/mo)</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">School Group (Optional)</label>
                                    <select value={form.groupId} onChange={e => setForm(p => ({ ...p, groupId: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                        <option value="">Independent School (No Group)</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreate(false)}
                                        className="flex-1 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit"
                                        className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>Create School</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Credentials Modal */}
                {credentials && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
                        <div className="glass-card p-6 w-full max-w-md rounded-2xl relative border-emerald-500/30">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 mx-auto">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>School Created Successfully!</h2>
                            <p className="text-sm text-slate-400 text-center mb-6">
                                Here are the admin login credentials for this school. <br />
                                <strong>Save this password securely — it will only be shown once!</strong>
                            </p>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 border-b border-white/5 pb-1">Admin Login URL</label>
                                    <div className="flex bg-blue-500/5 rounded-lg border border-blue-500/20 p-3 text-sm font-mono break-all font-medium select-all" style={{ color: 'var(--text-primary)' }}>
                                        {credentials.loginUrl}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs text-slate-400 mb-1 border-b border-white/5 pb-1">Email</label>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{credentials.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-slate-400 mb-1 border-b border-emerald-500/20 pb-1">One-Time Password</label>
                                        <p className="text-lg font-mono font-bold text-emerald-400 tracking-wider select-all">{credentials.password}</p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setCredentials(null)}
                                className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors">
                                I have saved these credentials
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
