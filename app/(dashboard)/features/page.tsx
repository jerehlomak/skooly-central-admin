'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { School, FeatureFlag } from '@/types'
import { Zap, Search } from 'lucide-react'
import { toast } from 'sonner'

const ALL_FEATURES = [
    { key: 'students', label: 'Student Management' },
    { key: 'teachers', label: 'Teacher Management' },
    { key: 'classes', label: 'Class Management' },
    { key: 'timetable', label: 'Timetable' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'results', label: 'Results & Grades' },
    { key: 'finance', label: 'Finance Module' },
    { key: 'messaging', label: 'Internal Messaging' },
    { key: 'sms', label: 'Bulk SMS' },
    { key: 'analytics', label: 'Analytics Reports' },
]

export default function FeaturesPage() {
    const [schools, setSchools] = useState<School[]>([])
    const [selected, setSelected] = useState<School | null>(null)
    const [flags, setFlags] = useState<Record<string, boolean>>({})
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        api.get('/schools?limit=100').then(r => setSchools(r.data.schools))
    }, [])

    const selectSchool = async (school: School) => {
        setSelected(school)
        setLoading(true)
        try {
            const r = await api.get(`/features/${school.id}`)
            const map: Record<string, boolean> = {}
            ALL_FEATURES.forEach(f => { map[f.key] = false })
            r.data.flags.forEach((flag: FeatureFlag) => { map[flag.feature] = flag.enabled })
            setFlags(map)
        } catch { toast.error('Failed to load feature flags') }
        finally { setLoading(false) }
    }

    const toggle = async (feature: string, enabled: boolean) => {
        if (!selected) return
        setFlags(prev => ({ ...prev, [feature]: enabled }))
        try {
            await api.post(`/features/${selected.id}`, { feature, enabled })
            toast.success(`${feature} ${enabled ? 'enabled' : 'disabled'}`)
        } catch {
            setFlags(prev => ({ ...prev, [feature]: !enabled }))
            toast.error('Failed to update feature flag')
        }
    }

    const filtered = schools.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Feature Management" subtitle="Enable or disable features per school" />
            <div className="p-6 flex gap-5 h-[calc(100vh-4rem)]">

                {/* School list */}
                <div className="w-72 glass-card flex flex-col overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Search className="w-3.5 h-3.5 text-slate-600" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search schools…"
                                className="bg-transparent outline-none text-xs text-slate-300 placeholder-slate-600 flex-1" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        {filtered.map(s => (
                            <button key={s.id} onClick={() => selectSchool(s)}
                                className={`w-full px-4 py-3 text-left hover:bg-white/[0.03] transition-colors ${selected?.id === s.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''}`}>
                                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                                <p className="text-xs text-slate-500 truncate">{s.email}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feature flags panel */}
                <div className="flex-1 glass-card flex flex-col overflow-hidden">
                    {!selected ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-600">
                            <Zap className="w-10 h-10 opacity-30" />
                            <p className="text-sm">Select a school to manage features</p>
                        </div>
                    ) : (
                        <>
                            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                                <div>
                                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.name}</h3>
                                    <p className="text-xs text-slate-500">{selected.email}</p>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs border ${selected.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'
                                    }`}>{selected.status}</span>
                            </div>

                            {loading ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto p-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {ALL_FEATURES.map(({ key, label }) => (
                                            <div key={key} className="flex items-center justify-between p-4 rounded-xl border hover:border-blue-500/20 transition-all"
                                                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${flags[key] ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                                                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
                                                </div>
                                                <button
                                                    onClick={() => toggle(key, !flags[key])}
                                                    className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${flags[key] ? 'bg-blue-500' : 'bg-slate-700'}`}
                                                >
                                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${flags[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
