'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { PlatformStats, School } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
    School as SchoolIcon, Users, GraduationCap,
    CreditCard, DollarSign, TicketCheck, TrendingUp, Activity, AlertCircle, Wallet
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

interface StatCardProps {
    label: string
    value: string | number
    icon: React.ElementType
    trend?: string
    color?: string
}

function StatCard({ label, value, icon: Icon, trend, color = '#3b82f6' }: StatCardProps) {
    return (
        <div className="glass-card p-5 flex items-start justify-between gap-4 hover:border-blue-500/20 transition-all duration-300">
            <div className="flex-1">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                {trend && <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{trend}</p>}
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
        </div>
    )
}

export default function OverviewPage() {
    const [stats, setStats] = useState<PlatformStats | null>(null)
    const [recentSchools, setRecentSchools] = useState<School[]>([])
    const [chartData, setChartData] = useState<Array<Record<string, unknown>>>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const [overviewRes, analyticsRes] = await Promise.all([
                    api.get('/overview'),
                    api.get('/analytics?months=6'),
                ])
                setStats(overviewRes.data.stats)
                setRecentSchools(overviewRes.data.recentSchools || [])
                setChartData(analyticsRes.data.monthlyData || [])
            } catch { /* handle */ } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return (
        <div className="min-h-screen flex flex-col">
            <Header title="Platform Overview" subtitle="Live platform statistics" />
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Platform Overview" subtitle="Live platform statistics and health metrics" />
            <div className="p-6 flex-1 space-y-6">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Schools" value={stats?.totalSchools ?? 0} icon={SchoolIcon} color="#3b82f6" trend="+2 this month" />
                    <StatCard label="Active Schools" value={stats?.activeSchools ?? 0} icon={Activity} color="#10b981" />
                    <StatCard label="Total Students" value={(stats?.totalStudents ?? 0).toLocaleString()} icon={Users} color="#8b5cf6" />
                    <StatCard label="Total Teachers" value={(stats?.totalTeachers ?? 0).toLocaleString()} icon={GraduationCap} color="#f59e0b" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Active Plans" value={stats?.totalPlans ?? 0} icon={CreditCard} color="#06b6d4" />
                    <StatCard label="Suspended" value={stats?.suspendedSchools ?? 0} icon={SchoolIcon} color="#ef4444" />
                    <StatCard label="Monthly Revenue" value={formatCurrency(stats?.monthlyRevenue ?? 0)} icon={DollarSign} color="#10b981" trend="Rolling 30 days" />
                    <StatCard label="Open Tickets" value={stats?.openTickets ?? 0} icon={TicketCheck} color="#f97316" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard label="Total Receivables" value={formatCurrency((stats as any)?.totalReceivables ?? 0)} icon={AlertCircle} color="#f59e0b" trend="Outstanding invoices" />
                    <StatCard label="Wallet Liabilities" value={formatCurrency((stats as any)?.walletLiabilities ?? 0)} icon={Wallet} color="#8b5cf6" trend="Funds held in school wallets" />
                </div>

                {/* Revenue + Growth Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                    <div className="glass-card p-4 w-full">
                        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Monthly Revenue</h3>
                        <p className="text-xs text-slate-500 mb-4">Last 6 months</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass-card p-4 w-full">
                        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>School Growth</h3>
                        <p className="text-xs text-slate-500 mb-4">New schools per month</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="schoolGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                <Area type="monotone" dataKey="newSchools" stroke="#8b5cf6" strokeWidth={2} fill="url(#schoolGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Schools */}
                <div className="glass-card overflow-hidden">
                    <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recently Joined Schools</h3>
                    </div>
                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        {recentSchools.length === 0 ? (
                            <p className="px-5 py-4 text-sm text-slate-500">No schools yet.</p>
                        ) : recentSchools.map((s) => (
                            <div key={s.id} className="flex items-center px-5 py-3 gap-4 hover:bg-white/[0.02] transition-colors">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                    {s.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                                    <p className="text-xs text-slate-500">{s.email}</p>
                                </div>
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs text-slate-400">{s.plan?.name || 'No Plan'}</p>
                                    <p className="text-xs text-slate-600">{formatDate(s.createdAt)}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs border ${s.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                                    s.status === 'SUSPENDED' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                                        'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    }`}>{s.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
