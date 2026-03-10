'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { AuditLog } from '@/types'
import { formatDate } from '@/lib/utils'
import { ClipboardList, Search } from 'lucide-react'

const ACTION_COLORS: Record<string, string> = {
    CREATE: 'text-emerald-400 bg-emerald-500/10',
    SUSPEND: 'text-red-400 bg-red-500/10',
    ACTIVATE: 'text-blue-400 bg-blue-500/10',
    DELETE: 'text-red-500 bg-red-500/15',
    UPDATE: 'text-amber-400 bg-amber-500/10',
    ENABLE: 'text-emerald-400 bg-emerald-500/10',
    DISABLE: 'text-slate-400 bg-slate-500/10',
    REPLY: 'text-purple-400 bg-purple-500/10',
}

const getActionColor = (action: string) => {
    const key = Object.keys(ACTION_COLORS).find(k => action.startsWith(k))
    return key ? ACTION_COLORS[key] : 'text-slate-400 bg-slate-500/10'
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [entityType, setEntityType] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const params = new URLSearchParams({ page: String(page), limit: '50' })
                if (search) params.set('action', search)
                if (entityType) params.set('entityType', entityType)
                const r = await api.get(`/audit-logs?${params}`)
                setLogs(r.data.logs || [])
                setTotal(r.data.total || 0)
            } catch { } finally { setLoading(false) }
        }
        load()
    }, [page, search, entityType])

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Audit Logs" subtitle={`${total} events recorded`} />
            <div className="p-6 space-y-5">

                {/* Toolbar */}
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Search className="w-3.5 h-3.5 text-slate-500" />
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                            placeholder="Filter by action…"
                            className="bg-transparent outline-none text-sm text-slate-300 placeholder-slate-600 w-48" />
                    </div>
                    <select value={entityType} onChange={e => { setEntityType(e.target.value); setPage(1) }}
                        className="px-3 py-2 rounded-xl text-sm text-slate-300 outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <option value="">All Types</option>
                        <option value="School">School</option>
                        <option value="SubscriptionPlan">Plan</option>
                        <option value="FeatureFlag">Feature</option>
                        <option value="SupportTicket">Ticket</option>
                        <option value="Announcement">Announcement</option>
                    </select>
                </div>

                {/* Log Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                                    {['Timestamp', 'Action', 'Entity', 'Admin', 'IP Address'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                {loading ? (
                                    <tr><td colSpan={5} className="px-4 py-10 text-center"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">
                                            <ClipboardList className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600">No audit logs found.</p>
                                        </td>
                                    </tr>
                                ) : logs.map(log => (
                                    <tr key={log.id} className="hover:bg-white/[0.015] transition-colors">
                                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{log.entityType || '—'}</p>
                                            {log.entityId && <p className="text-xs text-slate-600 truncate max-w-[120px]">{log.entityId}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{log.admin?.name || '—'}</p>
                                            <p className="text-xs text-slate-500">{log.admin?.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{log.ipAddress || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {total > 50 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                            <p className="text-xs text-slate-500">Page {page} of {Math.ceil(total / 50)}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:bg-white/10 disabled:opacity-30">Prev</button>
                                <button onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}
                                    className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:bg-white/10 disabled:opacity-30">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
