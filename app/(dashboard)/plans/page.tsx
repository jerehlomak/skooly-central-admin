'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { SubscriptionPlan } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, Check, Users, GraduationCap, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

const PLAN_COLORS = ['#3b82f6', '#8b5cf6', '#10b981']
const DEFAULT_FEATURES = ['accounts', 'fees', 'salary', 'timetable', 'homework', 'behaviour', 'store', 'whatsapp', 'messaging', 'sms', 'live-class', 'question-paper', 'exams']

export default function PlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<SubscriptionPlan | null>(null)
    const [form, setForm] = useState({ name: '', description: '', price: 0, maxStudents: 200, maxTeachers: 20, maxClasses: 15, trialDays: 0, features: [] as string[] })

    const load = async () => {
        setLoading(true)
        try { const r = await api.get('/plans'); setPlans(r.data.plans) }
        catch { toast.error('Failed to load plans') } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', description: '', price: 0, maxStudents: 200, maxTeachers: 20, maxClasses: 15, trialDays: 0, features: [] })
        setShowForm(true)
    }

    const openEdit = (p: SubscriptionPlan) => {
        setEditing(p)
        setForm({ name: p.name, description: p.description || '', price: p.price, maxStudents: p.maxStudents, maxTeachers: p.maxTeachers, maxClasses: p.maxClasses, trialDays: p.trialDays, features: p.features })
        setShowForm(true)
    }

    const toggleFeature = (f: string) => {
        setForm(prev => ({
            ...prev,
            features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f],
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editing) { await api.put(`/plans/${editing.id}`, form); toast.success('Plan updated!') }
            else { await api.post('/plans', form); toast.success('Plan created!') }
            setShowForm(false); load()
        } catch { toast.error('Failed to save plan') }
    }

    const delPlan = async (id: string) => {
        if (!confirm('Deactivate this plan?')) return
        try { await api.delete(`/plans/${id}`); toast.success('Plan deactivated'); load() }
        catch { toast.error('Failed') }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Subscription Plans" subtitle="Manage SaaS plan offerings" />
            <div className="p-6 space-y-6">

                <div className="flex justify-end">
                    <button onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        <Plus className="w-4 h-4" />New Plan
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {plans.map((p, i) => {
                            const color = PLAN_COLORS[i % PLAN_COLORS.length]
                            return (
                                <div key={p.id} className="glass-card p-5 relative overflow-hidden hover:border-blue-500/20 transition-all duration-300">
                                    {/* Glow top accent */}
                                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: color }} />

                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                                            <p className="text-sm text-slate-500 mt-0.5">{p.description || 'No description'}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => delPlan(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <span className="text-3xl font-bold" style={{ color }}>{formatCurrency(p.price)}</span>
                                        <span className="text-slate-500 text-sm">/month</span>
                                    </div>

                                    <div className="space-y-2 mb-5">
                                        {[
                                            { icon: Users, label: `${p.maxStudents.toLocaleString()} students` },
                                            { icon: GraduationCap, label: `${p.maxTeachers} teachers` },
                                            { icon: BookOpen, label: `${p.maxClasses} classes` },
                                        ].map(({ icon: Icon, label }) => (
                                            <div key={label} className="flex items-center gap-2 text-sm text-slate-400">
                                                <Icon className="w-3.5 h-3.5 text-slate-600" />{label}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {Array.isArray(p.features) && p.features.map(f => (
                                            <span key={f} className="px-2 py-0.5 rounded-full text-xs border border-blue-500/20 bg-blue-500/10 text-blue-400 capitalize">{f}</span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-600">
                                        <span>{p._count?.schools ?? 0} schools</span>
                                        <span className={`px-2 py-0.5 rounded-full border ${p.isActive ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                                            {p.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Plan Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.75)' }}>
                        <div className="glass-card p-6 w-full max-w-lg rounded-2xl my-4">
                            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{editing ? 'Edit Plan' : 'Create New Plan'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Plan Name', key: 'name', type: 'text' },
                                        { label: 'Trial Days', key: 'trialDays', type: 'number' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                                            <input type={f.type} value={form[f.key as keyof typeof form] as string | number}
                                                onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                                                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Description</label>
                                    <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Price (USD/mo)', key: 'price' },
                                        { label: 'Max Students', key: 'maxStudents' },
                                        { label: 'Max Teachers', key: 'maxTeachers' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                                            <input type="number" value={form[f.key as keyof typeof form] as number}
                                                onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                                                className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-2">Features</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DEFAULT_FEATURES.map(f => (
                                            <button key={f} type="button" onClick={() => toggleFeature(f)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${form.features.includes(f)
                                                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-500'
                                                    : 'border-slate-500/30 bg-slate-500/5 text-slate-500 hover:border-blue-500/30'
                                                    }`}>
                                                {form.features.includes(f) && <Check className="w-3 h-3" />}
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="flex-1 py-2 rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit"
                                        className="flex-1 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                        {editing ? 'Update Plan' : 'Create Plan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}
