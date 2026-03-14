'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FileText, Search, Ban, ArrowUpCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function SubscriptionsManagementPage() {
    const [subscriptions, setSubscriptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const load = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/billing/subscriptions')
            setSubscriptions(data.subscriptions)
        } catch (error) {
            toast.error('Failed to load subscriptions')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this subscription? This will suspend their access.')) return
        try {
            await api.patch(`/billing/subscriptions/${id}/cancel`)
            toast.success('Subscription cancelled')
            load()
        } catch {
            toast.error('Failed to cancel subscription')
        }
    }

    const filtered = subscriptions.filter(s =>
        s.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.plan?.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Header title="Subscriptions Management" subtitle="View and manage school billing subscriptions" />

            <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input type="text" placeholder="Search school or plan..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                                <tr>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Billing Cycle</th>
                                    <th className="px-6 py-4">Next Billing</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-[var(--text-muted)]">
                                            <div className="flex justify-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            No subscriptions found.
                                        </td>
                                    </tr>
                                ) : filtered.map(sub => (
                                    <tr key={sub.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-[var(--text-primary)]">{sub.school?.name}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{sub.school?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-1 rounded-md bg-blue-500/10 text-blue-500 font-medium text-xs">
                                                {sub.plan?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border
                                                ${sub.status === 'ACTIVE' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' :
                                                    sub.status === 'TRIAL' ? 'border-purple-500/30 bg-purple-500/10 text-purple-500' :
                                                        sub.status === 'PAST_DUE' ? 'border-orange-500/30 bg-orange-500/10 text-orange-500' :
                                                            'border-red-500/30 bg-red-500/10 text-red-500'}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)] capitalize">{sub.billingCycle?.toLowerCase()}</td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                                            {sub.nextBillingDate ? formatDate(new Date(sub.nextBillingDate)) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button title="Change Plan"
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-colors">
                                                    <ArrowUpCircle className="w-4 h-4" />
                                                </button>
                                                {sub.status !== 'CANCELLED' && (
                                                    <button onClick={() => handleCancel(sub.id)} title="Cancel Subscription"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
