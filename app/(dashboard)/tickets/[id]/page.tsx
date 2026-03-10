'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { SupportTicket, TicketReply } from '@/types'
import { formatDate, formatRelativeTime, STATUS_COLORS } from '@/lib/utils'
import { Send, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function TicketDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const [ticket, setTicket] = useState<SupportTicket | null>(null)
    const [loading, setLoading] = useState(true)
    const [reply, setReply] = useState('')
    const [newStatus, setNewStatus] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        api.get(`/tickets/${id}`)
            .then(r => { setTicket(r.data.ticket); setNewStatus(r.data.ticket.status) })
            .catch(() => toast.error('Failed to load ticket'))
            .finally(() => setLoading(false))
    }, [id])

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reply.trim()) return
        setSubmitting(true)
        try {
            await api.post(`/tickets/${id}/reply`, { message: reply, status: newStatus })
            toast.success('Reply sent!')
            setReply('')
            const r = await api.get(`/tickets/${id}`)
            setTicket(r.data.ticket)
        } catch { toast.error('Failed to send reply') }
        finally { setSubmitting(false) }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!ticket) return <div className="p-6 text-slate-500">Ticket not found.</div>

    return (
        <div className="min-h-screen flex flex-col">
            <Header title={ticket.subject} subtitle={`${ticket.school?.name} · ${ticket.submittedBy}`} />
            <div className="p-6 max-w-3xl mx-auto w-full space-y-5">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Tickets
                </button>

                {/* Ticket info */}
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs border ${STATUS_COLORS[ticket.status]}`}>{ticket.status}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs border ${STATUS_COLORS[ticket.priority]}`}>{ticket.priority}</span>
                        <span className="text-xs text-slate-500">Submitted {formatRelativeTime(ticket.createdAt)}</span>
                    </div>
                    <h2 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{ticket.subject}</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">{ticket.description}</p>
                </div>

                {/* Replies */}
                <div className="space-y-3">
                    {(ticket.replies as TicketReply[] || []).map(r => (
                        <div key={r.id} className="glass-card p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                    {r.admin?.name?.[0] || 'A'}
                                </div>
                                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.admin?.name || 'Admin'}</span>
                                <span className="text-xs text-slate-500">· {formatDate(r.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{r.message}</p>
                        </div>
                    ))}
                </div>

                {/* Reply form */}
                <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Reply to Ticket</h3>
                    <form onSubmit={handleReply} className="space-y-3">
                        <textarea
                            rows={4} required value={reply}
                            onChange={e => setReply(e.target.value)}
                            placeholder="Type your response…"
                            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none placeholder-slate-600"
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        />
                        <div className="flex items-center gap-3">
                            <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                                className="px-3 py-2 rounded-xl text-sm outline-none"
                                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button type="submit" disabled={submitting}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                <Send className="w-4 h-4" />
                                {submitting ? 'Sending…' : 'Send Reply'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
