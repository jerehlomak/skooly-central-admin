'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { School, SubscriptionPlan } from '@/types'
import { formatDate, STATUS_COLORS } from '@/lib/utils'
import { ArrowLeft, Ban, CheckCircle, Zap, Pencil, X, Save } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SchoolDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [school, setSchool] = useState<School | null>(null)
    const [adminUser, setAdminUser] = useState<{ email: string, loginUrl: string } | null>(null)
    const [resetCreds, setResetCreds] = useState<{ email: string, password: string, loginUrl: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
    const [editForm, setEditForm] = useState({
        name: '', email: '', phone: '', address: '', country: 'Nigeria', adminEmail: '', planId: '',
        studentCount: 0, teacherCount: 0, groupId: ''
    })

    const load = useCallback(async () => {
        try {
            const [schoolRes, credsRes] = await Promise.all([
                api.get(`/schools/${id}`),
                api.get(`/schools/${id}/credentials`).catch(() => ({ data: { admin: null } }))
            ])
            const s = schoolRes.data.school
            setSchool(s)
            setEditForm({
                name: s.name || '',
                email: s.email || '',
                phone: s.phone || '',
                address: s.address || '',
                country: s.country || 'Nigeria',
                adminEmail: s.adminEmail || '',
                planId: s.planId || '',
                studentCount: s.studentCount || 0,
                teacherCount: s.teacherCount || 0,
                groupId: s.groupId || '',
            })
            if (credsRes.data?.admin) {
                setAdminUser({ email: credsRes.data.admin.email, loginUrl: credsRes.data.loginUrl })
            }
        } catch { toast.error('Failed to load school') } finally { setLoading(false) }
    }, [id])

    useEffect(() => { if (id) load() }, [id, load])
    useEffect(() => {
        api.get('/plans').then(r => setPlans(r.data.plans || []))
        api.get('/groups').then(r => setGroups(r.data.groups || []))
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.put(`/schools/${id}`, {
                ...editForm,
                groupId: editForm.groupId || null,
                planId: editForm.planId || null,
            })
            toast.success('School updated successfully!')
            setIsEditing(false)
            load()
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            toast.error(err.response?.data?.message || 'Failed to save changes')
        } finally {
            setSaving(false)
        }
    }

    const handleResetPassword = async () => {
        if (!confirm('Are you sure you want to reset the admin password?')) return
        try {
            const res = await api.post(`/schools/${id}/credentials/reset`)
            setResetCreds(res.data.credentials)
            toast.success('Password reset successfully')
        } catch { toast.error('Failed to reset password') }
    }

    const suspend = async () => {
        if (!confirm('Suspend this school?')) return
        try { await api.post(`/schools/${id}/suspend`, { reason: 'Admin action' }); toast.success('Suspended'); load() }
        catch { toast.error('Failed') }
    }

    const activate = async () => {
        try { await api.post(`/schools/${id}/activate`); toast.success('Activated'); load() }
        catch { toast.error('Failed') }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!school) return <div className="p-6 text-slate-500">School not found.</div>

    const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none placeholder-slate-600 focus:ring-1 focus:ring-blue-500/50 transition-all"
    const inputStyle = { background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }

    return (
        <div className="min-h-screen flex flex-col">
            <Header title={school.name} subtitle={school.email} />
            <div className="p-6 max-w-4xl mx-auto w-full space-y-5">
                {/* Toolbar */}
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="flex-1" />

                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                {saving ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-white/10 text-slate-400 hover:bg-white/5 transition-colors">
                                <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            {school.status === 'ACTIVE' ? (
                                <button onClick={suspend} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Ban className="w-4 h-4" /> Suspend
                                </button>
                            ) : (
                                <button onClick={activate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                                    <CheckCircle className="w-4 h-4" /> Activate
                                </button>
                            )}
                            <Link href={`/features?school=${id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                                <Zap className="w-4 h-4" /> Features
                            </Link>
                        </>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Students', value: school.studentCount.toLocaleString() },
                        { label: 'Teachers', value: school.teacherCount },
                        { label: 'Plan', value: (school as unknown as { plan?: { name: string } }).plan?.name || 'None' },
                        { label: 'Status', value: school.status },
                    ].map(c => (
                        <div key={c.label} className="glass-card p-4">
                            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
                            {c.label === 'Status' ? (
                                <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[c.value]}`}>{c.value}</span>
                            ) : (
                                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{c.value}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Edit / View Panel */}
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                        {isEditing ? 'Edit School Details' : 'School Information'}
                    </h3>

                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">School Name *</label>
                                    <input className={inputCls} style={inputStyle} value={editForm.name}
                                        onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Email Address *</label>
                                    <input type="email" className={inputCls} style={inputStyle} value={editForm.email}
                                        onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Phone</label>
                                    <input className={inputCls} style={inputStyle} value={editForm.phone}
                                        onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Country</label>
                                    <input className={inputCls} style={inputStyle} value={editForm.country}
                                        onChange={e => setEditForm(p => ({ ...p, country: e.target.value }))} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs text-slate-400 mb-1">Address</label>
                                    <input className={inputCls} style={inputStyle} value={editForm.address}
                                        onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Admin Login Email</label>
                                    <input type="email" className={inputCls} style={inputStyle} value={editForm.adminEmail}
                                        onChange={e => setEditForm(p => ({ ...p, adminEmail: e.target.value }))}
                                        placeholder="The email used to log into the school admin dashboard" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Subscription Plan</label>
                                    <select className={inputCls} style={inputStyle} value={editForm.planId}
                                        onChange={e => setEditForm(p => ({ ...p, planId: e.target.value }))}>
                                        <option value="">No Plan</option>
                                        {plans.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price}/mo)</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">School Group</label>
                                    <select className={inputCls} style={inputStyle} value={editForm.groupId}
                                        onChange={e => setEditForm(p => ({ ...p, groupId: e.target.value }))}>
                                        <option value="">Independent (No Group)</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Student Count</label>
                                    <input type="number" min="0" className={inputCls} style={inputStyle} value={editForm.studentCount}
                                        onChange={e => setEditForm(p => ({ ...p, studentCount: Number(e.target.value) }))} />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Teacher Count</label>
                                    <input type="number" min="0" className={inputCls} style={inputStyle} value={editForm.teacherCount}
                                        onChange={e => setEditForm(p => ({ ...p, teacherCount: Number(e.target.value) }))} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {/* School ID — highlighted at the top */}
                            <div className="col-span-2">
                                <p className="text-xs text-slate-500 mb-1">School ID (required for login)</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                                    style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }}>
                                    <span className="text-base font-mono font-bold text-blue-400 tracking-widest select-all">
                                        {(school as unknown as { schoolCode?: string }).schoolCode || '—'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const code = (school as unknown as { schoolCode?: string }).schoolCode
                                            if (code) { navigator.clipboard.writeText(code); }
                                        }
                                        }
                                        className="text-xs text-slate-400 hover:text-blue-400 transition-colors ml-1"
                                        title="Copy School ID">
                                        Copy
                                    </button>
                                </div>
                            </div>
                            {[
                                { label: 'Email', value: school.email },
                                { label: 'Phone', value: school.phone || '—' },
                                { label: 'Address', value: school.address || '—' },
                                { label: 'Country', value: school.country || '—' },
                                { label: 'Admin Email', value: (school as unknown as { adminEmail?: string }).adminEmail || '—' },
                                { label: 'Joined', value: formatDate(school.createdAt) },
                            ].map(f => (
                                <div key={f.label}>
                                    <p className="text-xs text-slate-500 mb-0.5">{f.label}</p>
                                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                                </div>
                            ))}
                            {school.suspendReason && (
                                <div className="col-span-2 mt-2 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
                                    <p className="text-xs text-red-400 font-medium">Suspension Reason</p>
                                    <p className="text-sm text-slate-400">{school.suspendReason}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Admin Access */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Admin Access</h3>
                        <button onClick={handleResetPassword} disabled={!adminUser}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50">
                            Reset Password
                        </button>
                    </div>

                    {adminUser ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Admin Login URL</p>
                                <a href={adminUser.loginUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline break-all">
                                    {adminUser.loginUrl}
                                </a>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Admin Email</p>
                                <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{adminUser.email}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No admin account provisioned for this school.</p>
                    )}
                </div>

                {/* Reset Credentials Modal */}
                {resetCreds && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
                        <div className="glass-card p-6 w-full max-w-md rounded-2xl relative border-blue-500/30">
                            <h2 className="text-lg font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>Password Reset Successful</h2>
                            <p className="text-sm text-slate-400 text-center mb-6">
                                <strong>Save this password — it will only be shown once!</strong>
                            </p>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 border-b border-white/5 pb-1">Email</label>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{resetCreds.email}</p>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1 border-b border-blue-500/20 pb-1">New Password</label>
                                    <p className="text-lg font-mono font-bold text-blue-400 tracking-wider select-all">{resetCreds.password}</p>
                                </div>
                            </div>
                            <button onClick={() => setResetCreds(null)}
                                className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                I have saved the new password
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
