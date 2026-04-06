'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { Users, Plus, ShieldAlert, Mail, Clock, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function CompanyStaffPage() {
    const { admin } = useAuth()
    const [staff, setStaff] = useState<Array<{ id: string; name: string; email: string; role: string; isActive: boolean; lastLogin?: string }>>([])
    const [loading, setLoading] = useState(true)

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF', isActive: true })

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/staff')
            setStaff(data.staff || [])
        } catch { toast.error('Failed to load staff members') } finally { setLoading(false) }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingId) {
                const payload = { ...form }
                if (!payload.password) delete (payload as { password?: string }).password
                await api.put(`/staff/${editingId}`, payload)
                toast.success('Staff member updated')
            } else {
                await api.post('/staff', form)
                toast.success('Staff member added')
            }
            setShowForm(false)
            setEditingId(null)
            setForm({ name: '', email: '', password: '', role: 'STAFF', isActive: true })
            loadData()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to save staff member')
        }
    }

    const del = async (id: string) => {
        if (!confirm('Remove this staff member? They will lose access immediately.')) return
        try {
            await api.delete(`/staff/${id}`)
            toast.success('Staff member removed')
            loadData()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || 'Failed to remove staff')
        }
    }

    const openEdit = (s: { id: string; name: string; email: string; role: string; isActive: boolean }) => {
        setEditingId(s.id)
        setForm({ name: s.name, email: s.email, password: '', role: s.role, isActive: s.isActive })
        setShowForm(true)
    }

    if (admin?.role !== 'SUPER_ADMIN') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
                <p className="text-slate-400 max-w-md">Only Company Super Admins can manage internal staff accounts.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Company Staff" subtitle="Manage internal team access to Central Admin" />
            <div className="p-6 space-y-6 max-wxl mx-auto w-full">

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-bold text-[var(--text-primary)]">Internal Team</h2>
                            <p className="text-xs text-[var(--text-muted)]">{staff.length} active members</p>
                        </div>
                    </div>

                    <button onClick={() => { setEditingId(null); setForm({ name: '', email: '', password: '', role: 'STAFF', isActive: true }); setShowForm(true) }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        <Plus className="w-4 h-4" /> Add Member
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-12 flex justify-center">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : staff.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500">No staff found</div>
                    ) : staff.map(s => (
                        <div key={s.id} className="glass-card p-6 flex flex-col relative group overflow-hidden hover:border-blue-500/30 transition-all">
                            {!s.isActive && (
                                <div className="absolute top-0 right-0 bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-1 rounded-bl-xl border-b border-l border-red-500/20">
                                    SUSPENDED
                                </div>
                            )}
                            <div className="flex gap-4 items-center mb-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                    {s.name[0]}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-[var(--text-primary)] truncate">{s.name}</h3>
                                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider mt-1 ${s.role === 'SUPER_ADMIN' ? 'text-amber-400' : s.role === 'ADMIN' ? 'text-blue-400' : 'text-slate-400'
                                        }`}>
                                        <Shield className="w-3 h-3" /> {s.role}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    <span className="truncate">{s.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    <span>Last active: {s.lastLogin ? formatDate(s.lastLogin) : 'Never'}</span>
                                </div>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-2 border-t border-[var(--border-color)] pt-4">
                                <button onClick={() => openEdit(s)} className="py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    Edit
                                </button>
                                {s.id !== admin?.id ? (
                                    <button onClick={() => del(s.id)} className="py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                                        Remove
                                    </button>
                                ) : (
                                    <button disabled className="py-2 text-xs font-medium text-slate-600 rounded-lg cursor-not-allowed">
                                        Remove (You)
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="glass-card p-6 w-full max-w-sm rounded-2xl border border-white/10">
                            <h2 className="text-lg font-bold mb-1 text-[var(--text-primary)]">{editingId ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name *</label>
                                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address *</label>
                                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        {editingId ? 'New Password (leave blank to keep)' : 'Temporary Password *'}
                                    </label>
                                    <input type="password" required={!editingId} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">System Role *</label>
                                    <select required value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 text-white">
                                        <option value="STAFF">Staff (Limited Access)</option>
                                        <option value="ADMIN">Admin (Standard Access)</option>
                                        <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                                    </select>
                                </div>
                                {editingId && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                                            className="w-4 h-4 rounded accent-blue-500" />
                                        <label htmlFor="isActive" className="text-sm text-slate-300">Account Active</label>
                                    </div>
                                )}
                                <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit"
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                        {editingId ? 'Save Changes' : 'Invite Staff'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
