'use client'

import { useEffect, useState, useCallback } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { ClipboardList, Eye, CheckCircle, XCircle, Clock, School as SchoolIcon, Filter, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface Application {
    id: string;
    applicantName: string;
    applicantEmail: string;
    applicationType: string;
    status: string;
    createdAt: string;
    school: { name: string };
}

export default function CentralApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

    const loadApplications = useCallback(async () => {
        setLoading(true)
        try {
            // This endpoint needs to exist on the backend for central admins
            const response = await api.get('/applications/all') 
            setApplications(response.data.applications || [])
        } catch (error) {
            console.error('Failed to load applications:', error)
            // Fallback for demo if endpoint doesn't exist yet
            setApplications([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadApplications()
    }, [loadApplications])

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             app.school.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'text-emerald-400 bg-emerald-500/10'
            case 'REJECTED': return 'text-rose-400 bg-rose-500/10'
            default: return 'text-amber-400 bg-amber-500/10'
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Incoming Applications" subtitle="Review and track student & staff applications across all schools" />
            
            <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-card p-6 flex flex-col gap-2">
                        <p className="text-3xl font-bold text-[var(--text-primary)]">{applications.length}</p>
                        <p className="text-sm text-[var(--text-muted)]">Total Applications</p>
                    </div>
                    <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-amber-500/50">
                        <p className="text-3xl font-bold text-amber-400">
                            {applications.filter(a => a.status === 'PENDING').length}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Pending Review</p>
                    </div>
                    <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-emerald-500/50">
                        <p className="text-3xl font-bold text-emerald-400">
                            {applications.filter(a => a.status === 'APPROVED').length}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Approved</p>
                    </div>
                    <div className="glass-card p-6 flex flex-col gap-2 border-l-4 border-rose-500/50">
                        <p className="text-3xl font-bold text-rose-400">
                            {applications.filter(a => a.status === 'REJECTED').length}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">Rejected</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0b1120]/30 p-4 rounded-2xl border border-[var(--border-color)]">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search by name or school..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] outline-none focus:border-blue-500/50 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-[#0b1120]/50 border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Applicant Name</th>
                                    <th className="px-6 py-4 font-medium">School</th>
                                    <th className="px-6 py-4 font-medium">Type</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Date Submitted</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            No applications found matching your criteria.
                                        </td>
                                    </tr>
                                ) : filteredApplications.map(app => (
                                    <tr key={app.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{app.applicantName}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2">
                                                <SchoolIcon className="w-3 h-3 text-blue-400" /> {app.school.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)]">
                                            {app.applicationType === 'ADMISSION_APPLICATION' ? 'Student' : 'Staff'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${getStatusColor(app.status)}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--text-secondary)] flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> {formatDate(app.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors tooltip" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
