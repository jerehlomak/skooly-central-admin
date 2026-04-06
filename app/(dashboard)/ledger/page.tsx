'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { LineChart, Plus, ArrowUpRight, ArrowDownRight, Building2, Search, Filter } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { PlatformTransaction, School } from '@/types'

export default function PlatformLedgerPage() {
    const [transactions, setTransactions] = useState<PlatformTransaction[]>([])
    const [totals, setTotals] = useState({ INCOME: 0, EXPENSE: 0 })
    const [net, setNet] = useState(0)
    const [loading, setLoading] = useState(true)

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        type: 'INCOME', category: 'SUBSCRIPTION', amount: '', description: '', schoolId: '', reference: ''
    })
    const [schools, setSchools] = useState<School[]>([])

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const [lRes, sRes] = await Promise.all([
                api.get('/ledger'),
                api.get('/schools')
            ])
            setTransactions(lRes.data.transactions || [])
            setTotals(lRes.data.totals || { INCOME: 0, EXPENSE: 0 })
            setNet(lRes.data.net || 0)
            setSchools(sRes.data.schools || [])
        } catch { toast.error('Failed to load ledger data') } finally { setLoading(false) }
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/ledger', {
                ...form,
                amount: Number(form.amount)
            })
            toast.success('Transaction recorded successfully')
            setShowForm(false)
            setForm({ type: 'INCOME', category: 'SUBSCRIPTION', amount: '', description: '', schoolId: '', reference: '' })
            loadData()
        } catch { toast.error('Failed to record transaction') }
    }

    const del = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction from the ledger? This action cannot be reversed.')) return
        try {
            await api.delete(`/ledger/${id}`)
            toast.success('Transaction removed')
            loadData()
        } catch { toast.error('Failed to delete transaction') }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Company Ledger" subtitle="Platform-wide income and expense tracking" />
            <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ArrowUpRight className="w-24 h-24 text-emerald-500" />
                        </div>
                        <div className="p-3 w-max rounded-xl bg-emerald-500/10 text-emerald-400 mb-2 relative z-10">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold text-emerald-400 relative z-10">{formatCurrency(totals.INCOME, 'USD')}</p>
                        <p className="text-sm text-[var(--text-muted)] relative z-10">Total Income</p>
                    </div>

                    <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ArrowDownRight className="w-24 h-24 text-red-500" />
                        </div>
                        <div className="p-3 w-max rounded-xl bg-red-500/10 text-red-400 mb-2 relative z-10">
                            <ArrowDownRight className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold text-red-400 relative z-10">{formatCurrency(totals.EXPENSE, 'USD')}</p>
                        <p className="text-sm text-[var(--text-muted)] relative z-10">Total Expenses</p>
                    </div>

                    <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group" style={{
                        background: net >= 0
                            ? 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(59,130,246,0.05))'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(249,115,22,0.05))'
                    }}>
                        <div className="p-3 w-max rounded-xl mb-2 relative z-10" style={{ background: net >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: net >= 0 ? '#34d399' : '#f87171' }}>
                            <LineChart className="w-5 h-5" />
                        </div>
                        <p className="text-3xl font-bold relative z-10" style={{ color: net >= 0 ? '#34d399' : '#f87171' }}>{formatCurrency(net, 'USD')}</p>
                        <p className="text-sm text-[var(--text-muted)] relative z-10">Net Profitability</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" placeholder="Search transactions..."
                                className="pl-9 pr-4 py-2 w-64 rounded-xl text-sm border border-[var(--border-color)] bg-[var(--bg-card)] focus:border-blue-500 focus:outline-none text-[var(--text-primary)] transition-all" />
                        </div>
                        <button className="flex items-center justify-center p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-slate-400 hover:text-white transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>

                    <button onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-blue-500/25"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        <Plus className="w-4 h-4" /> Add Transaction
                    </button>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#0b1120]/50 border-b border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                                <tr>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">School / Client</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No transactions recorded yet.</td></tr>
                                ) : transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                            {tx.reference}
                                            {tx.description && <p className="text-[10px] text-slate-500 mt-1 max-w-[150px] truncate">{tx.description}</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                                                tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD')}
                                        </td>
                                        <td className="px-6 py-4">
                                            {tx.school ? (
                                                <span className="flex items-center gap-2 text-[var(--text-primary)]">
                                                    <Building2 className="w-3 h-3 text-slate-400" /> {tx.school.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 italic">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">{formatDate(new Date(tx.date))}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => del(tx.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Void</button>
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
                            <h2 className="text-lg font-bold mb-1 text-[var(--text-primary)]">Record Transaction</h2>
                            <p className="text-sm text-[var(--text-muted)] mb-6">Manually log a platform-wide income or expense.</p>
                            
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Type *</label>
                                        <select required value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 transition-all text-white">
                                            <option value="INCOME">Income</option>
                                            <option value="EXPENSE">Expense</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Category *</label>
                                        <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 transition-all text-white">
                                            {form.type === 'INCOME' ? (
                                                <>
                                                    <option value="SUBSCRIPTION">Subscription</option>
                                                    <option value="PIN_SALES">PIN Sales</option>
                                                    <option value="SETUP_FEE">Setup Fee</option>
                                                    <option value="OTHER">Other Income</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="HOSTING">Hosting Server</option>
                                                    <option value="MARKETING">Marketing/Ads</option>
                                                    <option value="SALARY">Staff Salary</option>
                                                    <option value="OTHER">Other Expense</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (USD) *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                        <input required type="number" min="0" step="0.01"
                                            value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 text-white" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">School / Client (Optional)</label>
                                    <select value={form.schoolId} onChange={e => setForm(p => ({ ...p, schoolId: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 text-white">
                                        <option value="">-- None --</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Description (Optional)</label>
                                    <input type="text" placeholder="e.g. AWS Invoice Jan 2026"
                                        value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] focus:border-blue-500 text-white" />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowForm(false)}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit"
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                                        style={{ background: form.type === 'INCOME' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                                        Record {form.type === 'INCOME' ? 'Income' : 'Expense'}
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
