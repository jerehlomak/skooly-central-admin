'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { format } from 'date-fns'
import { 
    Mail, Phone, MapPin, Calendar, MessageSquare, 
    CheckCircle2, Clock, XCircle, Search, Filter, MoreHorizontal,
    Building2, User
} from 'lucide-react'
import { toast } from 'sonner'

interface Lead {
    id: string
    schoolName: string
    contactPerson: string
    phoneNumber: string
    emailAddress: string
    stateLga: string
    preferredPlan?: { name: string }
    notes: string
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST'
    createdAt: string
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    const loadLeads = async () => {
        setLoading(true)
        try {
            const r = await api.get('/leads', { params: { status: statusFilter } })
            setLeads(r.data.leads)
        } catch {
            toast.error('Failed to load leads')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLeads()
    }, [statusFilter])

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/leads/${id}/status`, { status })
            toast.success(`Status updated to ${status}`)
            loadLeads()
        } catch {
            toast.error('Failed to update status')
        }
    }

    const filteredLeads = leads.filter(l => 
        l.schoolName.toLowerCase().includes(search.toLowerCase()) ||
        l.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        l.emailAddress.toLowerCase().includes(search.toLowerCase())
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            case 'CONTACTED': return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            case 'QUALIFIED': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
            case 'CONVERTED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            case 'LOST': return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
            <Header title="School Leads" subtitle="Manage incoming school inquiries and conversion pipeline" />
            
            <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)]">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input 
                            type="text" 
                            placeholder="Search by school, contact or email..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] text-sm focus:border-blue-500 transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-[var(--text-muted)]" />
                        <select 
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="NEW">New Inquiries</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="QUALIFIED">Qualified</option>
                            <option value="CONVERTED">Converted</option>
                            <option value="LOST">Lost</option>
                        </select>
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--bg-hover)] border-b border-[var(--border-color)]">
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">School & Contact</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Location & Plan</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Date</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-[var(--text-muted)] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8">
                                                <div className="h-4 bg-[var(--bg-hover)] rounded w-3/4 mx-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                                                <Building2 className="w-12 h-12 opacity-20" />
                                                <p className="font-bold text-lg">No leads found</p>
                                                <p className="text-sm">When schools express interest, they will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-[var(--bg-hover)] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[var(--text-primary)] group-hover:text-blue-500 transition-colors">{lead.schoolName}</span>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-secondary)]">
                                                        <User className="w-3 h-3" /> {lead.contactPerson}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <a href={`mailto:${lead.emailAddress}`} className="p-1.5 rounded-lg bg-[var(--bg-main)] hover:bg-blue-500/10 text-[var(--text-muted)] hover:text-blue-500 transition-all">
                                                            <Mail className="w-3.5 h-3.5" />
                                                        </a>
                                                        <a href={`tel:${lead.phoneNumber}`} className="p-1.5 rounded-lg bg-[var(--bg-main)] hover:bg-emerald-500/10 text-[var(--text-muted)] hover:text-emerald-500 transition-all">
                                                            <Phone className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                                                        <MapPin className="w-3.5 h-3.5 text-rose-500/70" /> {lead.stateLga || 'Not specified'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> {lead.preferredPlan?.name || 'No Plan Selected'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(lead.status)}`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
                                                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                                                    {format(new Date(lead.createdAt), 'MMM dd, yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <select 
                                                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                                                        className="text-[10px] font-black uppercase bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                                                        value={lead.status}
                                                    >
                                                        <option value="NEW">New</option>
                                                        <option value="CONTACTED">Contacted</option>
                                                        <option value="QUALIFIED">Qualified</option>
                                                        <option value="CONVERTED">Converted</option>
                                                        <option value="LOST">Lost</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
