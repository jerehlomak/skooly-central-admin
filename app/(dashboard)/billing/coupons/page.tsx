'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Tag, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CouponsManagementPage() {
    const [coupons, setCoupons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: 0, expiresAt: '', usageLimit: 0 })

    const load = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/billing/coupons')
            setCoupons(data.coupons)
        } catch { toast.error('Failed to load coupons') } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const payload = {
                ...form,
                usageLimit: form.usageLimit > 0 ? form.usageLimit : null,
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null
            }
            await api.post('/billing/coupons', payload)
            toast.success('Coupon created!')
            setShowForm(false)
            load()
        } catch { toast.error('Failed to create coupon') }
    }

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Delete coupon ${code}?`)) return
        try {
            await api.delete(`/billing/coupons/${id}`)
            toast.success('Coupon deleted')
            load()
        } catch { toast.error('Failed to delete coupon') }
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Header title="Coupons" subtitle="Manage discount codes for subscriptions" />

            <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

                <div className="flex justify-end">
                    <button onClick={() => { setForm({ code: '', discountType: 'PERCENTAGE', discountValue: 0, expiresAt: '', usageLimit: 0 }); setShowForm(true) }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        <Plus className="w-4 h-4" />Create Coupon
                    </button>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                                <tr>
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Discount</th>
                                    <th className="px-6 py-4">Usage</th>
                                    <th className="px-6 py-4">Expires</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                ) : coupons.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]"><Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />No coupons found.</td></tr>
                                ) : coupons.map(c => (
                                    <tr key={c.id} className="hover:bg-[var(--bg-hover)]">
                                        <td className="px-6 py-4 font-mono font-bold text-[var(--text-primary)]">{c.code}</td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                                            {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `$${c.discountValue} off`}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                                            {c.usedCount} / {c.usageLimit || '∞'}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">{c.expiresAt ? formatDate(new Date(c.expiresAt)) : 'Never'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                {c.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleDelete(c.id, c.code)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
                        <div className="bg-[var(--bg-card)] p-6 w-full max-w-md rounded-2xl border border-[var(--border-color)]">
                            <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Create Coupon</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Coupon Code</label>
                                    <input required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none uppercase bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)]" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Type</label>
                                        <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)]">
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FIXED">Fixed Amount ($)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Value</label>
                                        <input required type="number" min="1" max={form.discountType === 'PERCENTAGE' ? "100" : undefined} value={form.discountValue || ''} onChange={e => setForm(p => ({ ...p, discountValue: Number(e.target.value) }))}
                                            className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)]" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Usage Limit (0 for ∞)</label>
                                        <input type="number" min="0" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: Number(e.target.value) }))}
                                            className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)]" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Expiry Date (Optional)</label>
                                        <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                                            className="w-full px-3 py-2 rounded-xl text-sm outline-none bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-primary)]" />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]">
                                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl text-sm bg-[var(--bg-hover)] text-[var(--text-secondary)]">Cancel</button>
                                    <button type="submit" className="flex-1 py-2 rounded-xl text-sm font-medium text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>Create</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
