'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CircleDollarSign, Search } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentsManagementPage() {
    const [payments, setPayments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const load = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/billing/payments')
            setPayments(data.payments)
        } catch {
            toast.error('Failed to load payments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const filtered = payments.filter(p =>
        p.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Header title="Payments" subtitle="Track all incoming platform transactions" />
            <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input type="text" placeholder="Search school, transaction ID or invoice #..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                                <tr>
                                    <th className="px-6 py-4">Txn ID</th>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]"><CircleDollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />No payments found.</td></tr>
                                ) : filtered.map(pay => (
                                    <tr key={pay.id} className="hover:bg-[var(--bg-hover)]">
                                        <td className="px-6 py-4 font-mono text-xs">{pay.transactionId || 'MANUAL'}</td>
                                        <td className="px-6 py-4 text-[var(--text-primary)] font-medium">
                                            {pay.school?.name}
                                            <div className="text-[10px] text-[var(--text-muted)] font-mono">{pay.invoice?.invoiceNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">{formatCurrency(pay.amount, pay.currency)}</td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)] text-xs font-semibold">{pay.paymentMethod.replace('_', ' ')}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                ${pay.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    pay.status === 'REFUNDED' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                                        pay.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                            'bg-slate-500/10 text-slate-500 border border-slate-500/20'}`}>
                                                {pay.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">{pay.paidAt ? formatDate(new Date(pay.paidAt)) : '-'}</td>
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
