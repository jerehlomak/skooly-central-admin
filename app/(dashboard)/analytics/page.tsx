'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { MonthlyData } from '@/types'
import { TrendingUp, School, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

export default function AnalyticsPage() {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
    const [planDistribution, setPlanDistribution] = useState<Array<{ name: string; _count: { schools: number } }>>([])
    const [months, setMonths] = useState('6')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const r = await api.get(`/analytics?months=${months}`)
                setMonthlyData(r.data.monthlyData || [])
                setPlanDistribution(r.data.planDistribution || [])
            } catch { } finally { setLoading(false) }
        }
        load()
    }, [months])

    const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0)
    const totalNewSchools = monthlyData.reduce((s, d) => s + d.newSchools, 0)
    const pieData = planDistribution.map(p => ({ name: p.name, value: p._count?.schools || 0 }))

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Platform Analytics" subtitle="Growth trends and revenue metrics" />
            <div className="p-6 space-y-6">

                {/* Period selector */}
                <div className="flex items-center gap-3">
                    {['3', '6', '12'].map(m => (
                        <button key={m} onClick={() => setMonths(m)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${months === m ? 'text-white' : 'text-slate-400 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                            style={months === m ? { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' } : {}}>
                            {m} Months
                        </button>
                    ))}
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: 'Period Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: '#10b981' },
                        { label: 'New Schools', value: totalNewSchools, icon: School, color: '#3b82f6' },
                        { label: 'Avg Revenue/School', value: totalNewSchools ? formatCurrency(totalRevenue / totalNewSchools) : '$0', icon: TrendingUp, color: '#8b5cf6' },
                    ].map(c => (
                        <div key={c.label} className="glass-card p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `${c.color}22`, border: `1px solid ${c.color}44` }}>
                                <c.icon className="w-5 h-5" style={{ color: c.color }} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">{c.label}</p>
                                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{c.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Revenue Area Chart */}
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Over Time</h3>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#rev)" name="Revenue ($)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* School + Student Growth Bar */}
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>School Growth</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                        <Bar dataKey="newSchools" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="New Schools" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Plan Distribution Pie */}
                            <div className="glass-card p-5">
                                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Plan Distribution</h3>
                                {pieData.length === 0 ? (
                                    <div className="flex items-center justify-center h-48 text-slate-600 text-sm">No plan data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                            <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Student Growth */}
                        <div className="glass-card p-5">
                            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Cumulative Student Growth</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="stud" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                    <Area type="monotone" dataKey="totalStudents" stroke="#10b981" strokeWidth={2} fill="url(#stud)" name="Students" />
                                    <Area type="monotone" dataKey="totalTeachers" stroke="#f59e0b" strokeWidth={2} fill="none" name="Teachers" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
