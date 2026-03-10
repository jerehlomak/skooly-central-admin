'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { SupportTicket } from '@/types'
import { TicketCheck, MessageSquare } from 'lucide-react'
import { formatRelativeTime, STATUS_COLORS } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'

export default function TicketsPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('')
    const [priorityFilter, setPriorityFilter] = useState('')
    const [page, setPage] = useState(1)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' })
            if (statusFilter) params.set('status', statusFilter)
            if (priorityFilter) params.set('priority', priorityFilter)
            const r = await api.get(`/tickets?${params}`)
            setTickets(r.data.tickets || [])
            setTotal(r.data.total || 0)
        } catch { toast.error('Failed to load tickets') } finally { setLoading(false) }
    }, [page, statusFilter, priorityFilter])

    useEffect(() => { load() }, [load])

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Support Tickets" subtitle={`${total} tickets total`} />
            <div className="p-6 space-y-5">

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    {[
                        { label: 'All Status', key: 'status', value: statusFilter, set: setStatusFilter, options: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
                        { label: 'All Priority', key: 'priority', value: priorityFilter, set: setPriorityFilter, options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                    ].map(f => (
                        <select key={f.key} value={f.value} onChange={e => { f.set(e.target.value); setPage(1) }}
                            className="px-3 py-2 rounded-xl text-sm text-slate-300 outline-none"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <option value="">{f.label}</option>
                            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ))}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />Open: {tickets.filter(t => t.status === 'OPEN').length}
                        <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" />In Progress: {tickets.filter(t => t.status === 'IN_PROGRESS').length}
                        <span className="w-2 h-2 rounded-full bg-emerald-500 ml-2" />Resolved: {tickets.filter(t => t.status === 'RESOLVED').length}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="glass-card p-12 text-center text-slate-600">
                        <TicketCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No tickets found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map(t => (
                            <Link key={t.id} href={`/tickets/${t.id}`}
                                className="glass-card p-4 flex items-center gap-4 hover:border-blue-500/20 transition-all cursor-pointer block">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.subject}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[t.priority]}`}>{t.priority}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                                        <span>{t.school?.name}</span>
                                        <span>·</span>
                                        <span>{t.submittedBy}</span>
                                        <span>·</span>
                                        <span>{formatRelativeTime(t.createdAt)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {t.replies && t.replies.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            {t.replies.length}
                                        </div>
                                    )}
                                    <div className="w-6 h-6 flex items-center justify-center text-slate-500">›</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {total > 20 && (
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:bg-white/10 disabled:opacity-30">Prev</button>
                            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
                                className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:bg-white/10 disabled:opacity-30">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
