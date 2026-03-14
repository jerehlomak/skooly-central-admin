'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Receipt, Search, Download, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function InvoicesManagementPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const load = async () => {
        setLoading(true)
        try {
            const { data } = await api.get('/billing/invoices')
            setInvoices(data.invoices)
        } catch {
            toast.error('Failed to load invoices')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handleMarkPaid = async (id: string) => {
        if (!confirm('Mark this invoice as PAID manually? This will create a corresponding payment record.')) return
        try {
            await api.post(`/billing/invoices/${id}/pay`)
            toast.success('Invoice marked as paid')
            load()
        } catch {
            toast.error('Failed to update invoice')
        }
    }

    const filtered = invoices.filter(i =>
        i.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Header title="Invoices" subtitle="Manage and track billing invoices" />
            <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input type="text" placeholder="Search school or invoice #..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                                <tr>
                                    <th className="px-6 py-4">Invoice #</th>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-8 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--text-muted)]"><Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />No invoices found.</td></tr>
                                ) : filtered.map(inv => (
                                    <tr key={inv.id} className="hover:bg-[var(--bg-hover)]">
                                        <td className="px-6 py-4 font-mono text-xs">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-[var(--text-primary)] font-medium">{inv.school?.name}</td>
                                        <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">{formatCurrency(inv.totalAmount, inv.currency)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    inv.status === 'DRAFT' ? 'bg-slate-500/10 text-slate-500 border border-slate-500/20' :
                                                        inv.status === 'FAILED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">{formatDate(new Date(inv.dueDate))}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button title="Download PDF" className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-500/10"><Download className="w-4 h-4" /></button>
                                                {inv.status !== 'PAID' && (
                                                    <button onClick={() => handleMarkPaid(inv.id)} title="Mark as Paid" className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10"><CheckCircle2 className="w-4 h-4" /></button>
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
