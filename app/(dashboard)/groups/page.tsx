'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Plus, Building2, Copy, CheckCircle2, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

interface GroupAdmin {
    id: string
    name: string
    email: string
}

interface SchoolGroup {
    id: string
    name: string
    createdAt: string
    admins: GroupAdmin[]
    schools: { id: string; name: string; studentCount: number }[]
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<SchoolGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', ownerName: '', ownerEmail: '', ownerPhone: '' })
    const [credentials, setCredentials] = useState<{ email: string; password: string; loginUrl: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const [saving, setSaving] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const res = await api.get('/groups')
            setGroups(res.data.groups)
        } catch {
            toast.error('Failed to load school groups')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await api.post('/groups', form)
            toast.success('School Group created!')
            setShowCreate(false)
            setForm({ name: '', ownerName: '', ownerEmail: '', ownerPhone: '' })
            if (res.data.credentials) {
                setCredentials(res.data.credentials)
            }
            load()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err.response?.data?.message || 'Failed to create group')
        } finally {
            setSaving(false)
        }
    }

    const copyCreds = () => {
        if (!credentials) return
        const text = `Group Owner Dashboard: ${credentials.loginUrl}\nEmail: ${credentials.email}\nPassword: ${credentials.password}`
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
        toast.success('Credentials copied!')
    }

    const inputClass = "w-full px-3 py-2.5 rounded-xl text-sm outline-none placeholder-slate-600 focus:ring-1 focus:ring-blue-500/50 transition-all"
    const inputStyle = { background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="School Groups" subtitle={`${groups.length} group${groups.length !== 1 ? 's' : ''} registered`} />
            <div className="p-6 space-y-5">

                {/* Toolbar */}
                <div className="flex justify-end">
                    <button onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        <Plus className="w-4 h-4" /> Create Group
                    </button>
                </div>

                {/* Groups Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                                    {['', 'Group Name', 'Owner', 'Owner Email', 'Branches', 'Created'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                {loading ? (
                                    <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500 text-sm">Loading…</td></tr>
                                ) : groups.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <Building2 className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                            <p className="text-slate-500 text-sm">No school groups found. Create the first one!</p>
                                        </td>
                                    </tr>
                                ) : groups.map(g => (
                                    <>
                                        <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => setExpandedGroup(expandedGroup === g.id ? null : g.id)}
                                                    className="p-1 rounded hover:bg-white/10 text-slate-400 transition-colors"
                                                    title={expandedGroup === g.id ? 'Collapse' : 'View branches'}
                                                >
                                                    {expandedGroup === g.id
                                                        ? <ChevronUp className="w-4 h-4" />
                                                        : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ background: 'linear-gradient(135deg, #3b82f640, #8b5cf640)' }}>
                                                        <Building2 className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-400">
                                                {g.admins?.[0]?.name || <span className="text-slate-600">—</span>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-400">
                                                {g.admins?.[0]?.email || <span className="text-slate-600">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-400 font-medium">
                                                    <Users className="w-3 h-3" />
                                                    {g.schools?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{formatDate(g.createdAt)}</td>
                                        </tr>
                                        {/* Expanded branches */}
                                        {expandedGroup === g.id && (
                                            <tr key={`${g.id}-branches`} style={{ background: 'rgba(255,255,255,0.01)' }}>
                                                <td colSpan={6} className="px-8 py-4">
                                                    {g.schools?.length ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {g.schools.map(s => (
                                                                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                                    <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                                        style={{ background: 'linear-gradient(135deg, #3b82f640, #8b5cf640)' }}>
                                                                        {s.name[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                                                                        <p className="text-xs text-slate-500">{s.studentCount} students</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-500 italic">No branches linked yet. Assign a school to this group when creating a school.</p>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Group Modal */}
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
                        <div className="glass-card p-6 w-full max-w-lg rounded-2xl">
                            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Create School Group</h2>
                            <p className="text-xs text-slate-500 mb-5">The owner will use these credentials to log in at the Group Owner Dashboard in the client app.</p>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Group Name *</label>
                                    <input type="text" required value={form.name}
                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        className={inputClass} style={inputStyle} placeholder="e.g. Brightfield Schools" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Owner Full Name *</label>
                                        <input type="text" required value={form.ownerName}
                                            onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))}
                                            className={inputClass} style={inputStyle} placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Owner Phone (Optional)</label>
                                        <input type="text" value={form.ownerPhone}
                                            onChange={e => setForm(p => ({ ...p, ownerPhone: e.target.value }))}
                                            className={inputClass} style={inputStyle} placeholder="+234 800 000 0000" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Owner Email Address *</label>
                                    <input type="email" required value={form.ownerEmail}
                                        onChange={e => setForm(p => ({ ...p, ownerEmail: e.target.value }))}
                                        className={inputClass} style={inputStyle} placeholder="owner@schoolgroup.com" />
                                    <p className="text-xs text-slate-600 mt-1">This will be used for newsletters and login credentials.</p>
                                </div>
                                <div className="flex gap-3 justify-end pt-2">
                                    <button type="button" onClick={() => setShowCreate(false)}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving}
                                        className="px-5 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                        {saving ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating…</> : 'Create Group'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Credentials Modal */}
                {credentials && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-[#0f172a] border border-emerald-500/20 p-8 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Group Created!</h3>
                                <p className="text-xs text-slate-400 mt-1">Share these credentials with the Group Owner. <span className="font-semibold text-amber-400">They won&apos;t be shown again.</span></p>
                            </div>
                            <div className="space-y-3 mb-6">
                                {[
                                    { label: 'Login URL', value: credentials.loginUrl, color: 'text-blue-400' },
                                    { label: 'Email', value: credentials.email, color: 'text-white' },
                                    { label: 'Generated Password', value: credentials.password, color: 'text-emerald-400' },
                                ].map(({ label, value, color }) => (
                                    <div key={label}>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
                                        <div className={`p-3 rounded-lg text-sm font-mono break-all ${color}`}
                                            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                            {value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={copyCreds}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition-colors">
                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy All'}
                                </button>
                                <button onClick={() => setCredentials(null)}
                                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium text-sm transition-colors">
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
