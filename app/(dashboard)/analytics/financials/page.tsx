'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid,
} from 'recharts'
import {
    TrendingUp, AlertCircle, Wallet, DollarSign,
    Mail, Phone, RefreshCw, Send
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthData { month: string; revenue: number }
interface Debtor {
    id: string; name: string; email: string; phone: string; amountDue: number
}
interface FinancialsData {
    monthlyData: MonthData[]
    debtorSchools: Debtor[]
}
interface OverviewStats {
    monthlyRevenue: number
    totalReceivables: number
    walletLiabilities: number
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
    label, value, icon: Icon, color, subtitle
}: { label: string; value: string; icon: React.ElementType; color: string; subtitle?: string }) {
    return (
        <div className="glass-card p-5 flex items-start gap-4 hover:border-blue-500/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinancialAnalyticsPage() {
    const [financials, setFinancials] = useState<FinancialsData | null>(null)
    const [overview, setOverview] = useState<OverviewStats | null>(null)
    const [months, setMonths] = useState(6)
    const [loading, setLoading] = useState(true)
    const [sendingReminderId, setSendingReminderId] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const [finRes, ovRes] = await Promise.all([
                api.get(`/analytics/financials?months=${months}`),
                api.get('/overview'),
            ])
            setFinancials(finRes.data)
            setOverview(ovRes.data.stats)
        } catch {
            toast.error('Failed to load financial analytics')
        } finally {
            setLoading(false)
        }
    }, [months])

    useEffect(() => { load() }, [load])

    const sendReminder = async (schoolId: string, schoolName: string) => {
        setSendingReminderId(schoolId)
        try {
            // Find the relevant invoice to send reminder for
            const invoicesRes = await api.get(`/invoices?schoolId=${schoolId}&status=UNPAID,OVERDUE`)
            const invoices: Array<{ id: string }> = invoicesRes.data.invoices || []
            if (invoices.length === 0) {
                toast.error('No outstanding invoices found to send a reminder for.')
                return
            }
            await api.post(`/invoices/${invoices[0].id}/reminder`)
            toast.success(`Reminder sent to ${schoolName}`)
        } catch {
            toast.error('Failed to send reminder')
        } finally {
            setSendingReminderId(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header title="Financial Analytics" subtitle="Revenue, receivables & wallet liabilities" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        )
    }

    const totalRevenue = financials?.monthlyData.reduce((s, m) => s + m.revenue, 0) ?? 0

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                title="Financial Analytics"
                subtitle="Platform revenue, receivables and wallet liabilities"
            />

            <div className="p-6 flex-1 space-y-6">

                {/* ── KPI Row ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KPICard
                        label="Revenue (Last 30 Days)"
                        value={formatCurrency(overview?.monthlyRevenue ?? 0)}
                        icon={DollarSign}
                        color="#10b981"
                        subtitle="Completed payments in rolling 30-day window"
                    />
                    <KPICard
                        label="Total Receivables"
                        value={formatCurrency(overview?.totalReceivables ?? 0)}
                        icon={AlertCircle}
                        color="#f59e0b"
                        subtitle="Outstanding unpaid & overdue invoices"
                    />
                    <KPICard
                        label="Wallet Liabilities"
                        value={formatCurrency(overview?.walletLiabilities ?? 0)}
                        icon={Wallet}
                        color="#8b5cf6"
                        subtitle="Total balance held across all school wallets"
                    />
                </div>

                {/* ── Revenue Chart ── */}
                <div className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div>
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                                Revenue Over Time
                            </h3>
                            <p className="text-xs text-slate-500">
                                {months}-month rolling window · Total: {formatCurrency(totalRevenue)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {[3, 6, 12].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMonths(m)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${months === m
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                >
                                    {m}M
                                </button>
                            ))}
                            <button
                                onClick={load}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={financials?.monthlyData ?? []}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                            tickFormatter={v => {
                                const n = v as number
                                if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
                                if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
                                return `$${n}`
                            }}
                            />
                            <Tooltip
                                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                                formatter={(v) => [formatCurrency(v as number), 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* ── Debtors Table ── */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                        <div>
                            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                Top Debtors — Outstanding Receivables
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">Schools with unpaid or overdue invoices, sorted by amount owed</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            {financials?.debtorSchools.length ?? 0} Schools
                        </span>
                    </div>

                    {financials?.debtorSchools.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All Clear!</p>
                            <p className="text-xs text-slate-500">No outstanding receivables from any school.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                                        {['School', 'Contact', 'Amount Due', 'Actions'].map(h => (
                                            <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                    {financials?.debtorSchools.map((debtor, i) => (
                                        <tr key={debtor.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                        style={{ background: `hsl(${(i * 47) % 360}, 60%, 45%)` }}>
                                                        {debtor.name[0]}
                                                    </div>
                                                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{debtor.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="space-y-0.5">
                                                    <p className="text-xs flex items-center gap-1.5 text-slate-400">
                                                        <Mail className="w-3 h-3" />{debtor.email || '—'}
                                                    </p>
                                                    <p className="text-xs flex items-center gap-1.5 text-slate-500">
                                                        <Phone className="w-3 h-3" />{debtor.phone || '—'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-amber-400 text-base">
                                                    {formatCurrency(debtor.amountDue)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <button
                                                    id={`send-reminder-${debtor.id}`}
                                                    onClick={() => sendReminder(debtor.id, debtor.name)}
                                                    disabled={sendingReminderId === debtor.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                        bg-blue-500/10 text-blue-400 border border-blue-500/20
                                                        hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {sendingReminderId === debtor.id
                                                        ? <RefreshCw className="w-3 h-3 animate-spin" />
                                                        : <Send className="w-3 h-3" />}
                                                    {sendingReminderId === debtor.id ? 'Sending…' : 'Send Reminder'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
