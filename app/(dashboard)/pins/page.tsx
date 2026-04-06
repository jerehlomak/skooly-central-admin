'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { KeyRound, Plus, Hash, Clock, School as SchoolIcon, Layers, FileDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface PinBatch {
    id: string;
    batchNumber: string;
    quantity: number;
    _count?: { pins: number };
    pinType: string;
    admin?: { name: string };
    createdAt: string;
    school?: { name: string };
}

export default function PinManagerPage() {
    const [batches, setBatches] = useState<PinBatch[]>([])
    const [schools, setSchools] = useState<Array<{ id: string; name: string; status: string; }>>([])
    const [totalPins, setTotalPins] = useState(0)
    const [loading, setLoading] = useState(true)

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ quantity: 100, pricePerPin: 0, schoolId: '', pinType: 'RESULT_CHECKING' })

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const [bRes, sRes] = await Promise.all([
                api.get('/pins/batches'),
                api.get('/schools')
            ])
            setBatches(bRes.data.batches || [])
            setTotalPins(bRes.data.totalPins || 0)
            setSchools(sRes.data.schools || [])
        } catch { toast.error('Failed to load PIN data') } finally { setLoading(false) }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/pins/batches', {
                quantity: Number(form.quantity),
                pricePerPin: Number(form.pricePerPin),
                schoolId: form.schoolId || null,
                pinType: form.pinType
            })
            toast.success('PIN batch generated successfully!')
            setShowForm(false)
            setForm({ quantity: 100, pricePerPin: 0, schoolId: '', pinType: 'RESULT_CHECKING' })
            loadData()
        } catch { toast.error('Failed to generate PINs') }
    }

    const unassignedSchools = schools.filter(s => s.status === 'ACTIVE')

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="PIN Manager" subtitle={`${totalPins.toLocaleString()} total PINs generated`} />
            <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 flex flex-col gap-2">
                        <div className="p-3 w-max rounded-xl bg-indigo-500/10 text-indigo-400 mb-2">
                            <Layers className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-[var(--text-primary)]">{batches.length}</p>
                        <p className="text-sm text-[var(--text-muted)]">Total Batches</p>
                    </div>
                    <div className="glass-card p-6 flex flex-col gap-2">
                        <div className="p-3 w-max rounded-xl bg-emerald-500/10 text-emerald-400 mb-2">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-[var(--text-primary)]">{totalPins.toLocaleString()}</p>
                        <p className="text-sm text-[var(--text-muted)]">Total PINs</p>
                    </div>
                    <div className="glass-card p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:border-blue-500/50 transition-all"
                        onClick={() => setShowForm(true)}
                        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))' }}>
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-500/20">
                            <Plus className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-[var(--text-primary)]">Generate New Batch</h3>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Create PINs for schools</p>
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center">
                        <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-400" /> Recent PIN Batches
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#0b1120]/50 border-b border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                                <tr>
                                    <th className="px-6 py-4">Batch Number</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Pin Type</th>
                                    <th className="px-6 py-4">Assigned To</th>
                                    <th className="px-6 py-4">Generated By</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                ) : batches.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No batches generated yet.</td></tr>
                                ) : batches.map(b => (
                                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-blue-400 font-semibold">{b.batchNumber}</td>
                                        <td className="px-6 py-4 text-[var(--text-primary)] font-medium">{(b._count?.pins || b.quantity).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)] capitalize">{String(b.pinType || 'RESULT_CHECKING').replace('_', ' ').toLowerCase()}</td>
                                        <td className="px-6 py-4">
                                            {b.school ? (
                                                <span className="flex items-center gap-2 text-[var(--text-primary)]">
                                                    <SchoolIcon className="w-3 h-3 text-emerald-400" /> {b.school.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">{b.admin?.name || 'System'}</td>
                                        <td className="px-6 py-4 flex items-center gap-2 text-[var(--text-secondary)]">
                                            <Clock className="w-3 h-3" /> {formatDate(b.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors tooltip"
                                                title="Export CSV (Coming Soon)">
                                                <FileDown className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="glass-card p-6 w-full max-w-md rounded-2xl border border-white/10">
                            <h2 className="text-lg font-bold mb-1 text-[var(--text-primary)]">Generate PINs</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Create a new batch of secure PIN codes.</p>

                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Quantity *</label>
                                    <input required type="number" min="1" max="5000"
                                        value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">PIN Type</label>
                                    <select value={form.pinType} onChange={e => setForm(p => ({ ...p, pinType: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-white">
                                        <option value="RESULT_CHECKING">Result Checking</option>
                                        <option value="ADMISSION_APPLICATION">Admission Application</option>
                                        <option value="EMPLOYMENT">Employment Verification</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Assign to School (Optional)</label>
                                    <select value={form.schoolId} onChange={e => setForm(p => ({ ...p, schoolId: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-white">
                                        <option value="">-- Keep Unassigned --</option>
                                        {unassignedSchools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Value / Price per PIN (Optional)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
                                        <input type="number" min="0" step="100"
                                            value={form.pricePerPin} onChange={e => setForm(p => ({ ...p, pricePerPin: Number(e.target.value) }))}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-white" />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit"
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>Generate</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
