'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Receipt, Search, Plus, Send, BellRing, Wallet, X } from 'lucide-react'
import { toast } from 'sonner'

import { Invoice, School } from '@/types'

export default function InvoicesManagementPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [schools, setSchools] = useState<School[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modals
    const [showCreate, setShowCreate] = useState(false)
    const [showPayment, setShowPayment] = useState<Invoice | null>(null)
    const [showReminder, setShowReminder] = useState<Invoice | null>(null)

    // Create Form State
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        schoolId: '',
        title: '',
        dueDate: '',
        items: [{ itemName: '', quantity: 1, unitPrice: 0 }]
    })

    const load = async () => {
        setLoading(true)
        try {
            const [invRes, schRes] = await Promise.all([
                api.get('/invoices'),
                api.get('/schools')
            ])
            setInvoices(invRes.data.invoices || [])
            setSchools(schRes.data.schools || [])
        } catch {
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    // Actions
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.schoolId || !formData.dueDate || !formData.title || formData.items.length === 0) {
            return toast.error('Please fill all required fields')
        }
        setSubmitting(true)
        try {
            await api.post('/invoices', formData)
            toast.success('Invoice created successfully')
            setShowCreate(false)
            setFormData({ schoolId: '', title: '', dueDate: '', items: [{ itemName: '', quantity: 1, unitPrice: 0 }] })
            load()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || 'Failed to create invoice')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSend = async (id: string, invoiceNumber: string) => {
        if (!confirm(`Send invoice ${invoiceNumber} to the school now?`)) return
        try {
            await api.post(`/invoices/${id}/send`)
            toast.success('Invoice sent')
            load()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || 'Failed to send invoice')
        }
    }

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!showPayment) return
        const amount = new FormData(e.currentTarget as HTMLFormElement).get('amount') as string
        setSubmitting(true)
        try {
            await api.post(`/invoices/${showPayment.id}/payment`, { amount: Number(amount) })
            toast.success('Payment recorded')
            setShowPayment(null)
            load()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || 'Failed to record payment')
        } finally {
            setSubmitting(false)
        }
    }

    const handleSendReminder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!showReminder) return
        const message = new FormData(e.currentTarget as HTMLFormElement).get('message') as string
        setSubmitting(true)
        try {
            await api.post(`/invoices/${showReminder.id}/reminder`, { message })
            toast.success('Reminder sent')
            setShowReminder(null)
            load()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || 'Failed to send reminder')
        } finally {
            setSubmitting(false)
        }
    }

    const filtered = invoices.filter(i =>
        i.school?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[var(--bg-main)] pb-20">
            <Header title="Invoices" subtitle="Manage billing and receivables across all schools" />
            <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input type="text" placeholder="Search school or invoice #..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500" />
                    </div>
                    <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4" /> Create Invoice
                    </button>
                </div>

                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[var(--bg-main)] border-b border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                                <tr>
                                    <th className="px-6 py-4">Invoice #</th>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Due</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-[var(--text-muted)]"><Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />No invoices found.</td></tr>
                                ) : filtered.map(inv => (
                                    <tr key={inv.id} className="hover:bg-[var(--bg-hover)]">
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-xs">{inv.invoiceNumber}</div>
                                            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{inv.title}</div>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-primary)] font-medium">{inv.school?.name}</td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">{formatDate(new Date(inv.dueDate))}</td>
                                        <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">{formatCurrency(inv.totalAmount, inv.currency)}</td>
                                        <td className="px-6 py-4 font-semibold text-red-500">{formatCurrency(inv.amountDue ?? 0, inv.currency)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    inv.status === 'PARTIALLY_PAID' ? 'bg-amber-500/10 text-amber-500' :
                                                        inv.status === 'DRAFT' ? 'bg-slate-500/10 text-slate-500' :
                                                            'bg-blue-500/10 text-blue-500'}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {inv.status === 'DRAFT' && (
                                                    <button onClick={() => handleSend(inv.id, inv.invoiceNumber)} title="Send Invoice" className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10">
                                                        <Send className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {(inv.status === 'SENT' || inv.status === 'PARTIALLY_PAID' || inv.status === 'OVERDUE') && (
                                                    <button onClick={() => setShowReminder(inv)} title="Send Reminder" className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10">
                                                        <BellRing className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                                                    <button onClick={() => setShowPayment(inv)} title="Record Manual Payment" className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10">
                                                        <Wallet className="w-4 h-4" />
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

            {/* CREATE MODAL */}
            {showCreate && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Create Invoice</h2>
                            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-[var(--bg-hover)] rounded-lg text-[var(--text-muted)]"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">Target School</label>
                                    <select required value={formData.schoolId} onChange={e => setFormData({ ...formData, schoolId: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[var(--text-primary)] outline-none">
                                        <option value="">Select a school...</option>
                                        {schools.map(s => <option key={s.id} value={s.id}>{s.name} ({s.schoolCode})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">Invoice Title</label>
                                    <input required type="text" placeholder="e.g. Platform Subscription" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-blue-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-[var(--text-secondary)]">Due Date</label>
                                    <input required type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-blue-500" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--border-color)]">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Line Items</h3>
                                    <button type="button" onClick={() => setFormData(f => ({ ...f, items: [...f.items, { itemName: '', quantity: 1, unitPrice: 0 }] }))}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors">
                                        + Add Item
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.items.map((item, i) => (
                                        <div key={i} className="flex gap-2 items-start">
                                            <input required type="text" placeholder="Description" value={item.itemName} onChange={e => {
                                                const newItems = [...formData.items]; newItems[i].itemName = e.target.value; setFormData({ ...formData, items: newItems })
                                            }} className="flex-1 px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none" />
                                            <input required type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => {
                                                const newItems = [...formData.items]; newItems[i].quantity = Number(e.target.value); setFormData({ ...formData, items: newItems })
                                            }} className="w-20 px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none" />
                                            <input required type="number" min="0" placeholder="Price" value={item.unitPrice} onChange={e => {
                                                const newItems = [...formData.items]; newItems[i].unitPrice = Number(e.target.value); setFormData({ ...formData, items: newItems })
                                            }} className="w-32 px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] outline-none" />
                                            {formData.items.length > 1 && (
                                                <button type="button" onClick={() => setFormData(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))}
                                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 rounded-xl font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]">Cancel</button>
                                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 transition-colors">
                                    {submitting ? 'Creating...' : 'Create Draft'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PAYMENT MODAL */}
            {showPayment && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Record Payment</h2>
                            <button onClick={() => setShowPayment(null)} className="p-1 hover:bg-[var(--bg-hover)] rounded-lg text-[var(--text-muted)]"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">Amount Due: <span className="font-bold text-red-500">{formatCurrency(showPayment.amountDue ?? 0, 'NGN')}</span></p>
                        <form onSubmit={handleRecordPayment} className="space-y-4">
                            <div>
                                <label className="text-sm text-[var(--text-secondary)] mb-1 block">Payment Amount Received</label>
                                <input name="amount" type="number" required min="1" max={showPayment.amountDue ?? undefined} defaultValue={showPayment.amountDue ?? undefined}
                                    className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-lg font-bold text-[var(--text-primary)] outline-none focus:border-emerald-500" />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors">
                                {submitting ? 'Saving...' : 'Confirm Payment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* REMINDER MODAL */}
            {showReminder && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-card)] rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">Send Reminder</h2>
                            <button onClick={() => setShowReminder(null)} className="p-1 hover:bg-[var(--bg-hover)] rounded-lg text-[var(--text-muted)]"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">Sending to <strong>{showReminder.school?.name}</strong> for invoice {showReminder.invoiceNumber}</p>
                        <form onSubmit={handleSendReminder} className="space-y-4">
                            <div>
                                <label className="text-sm text-[var(--text-secondary)] mb-1 block">Custom Message (optional)</label>
                                <textarea name="message" rows={3} placeholder="Please remember to settle your outstanding balance..."
                                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] outline-none focus:border-amber-500" />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors">
                                {submitting ? 'Sending...' : 'Send Reminder'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}
