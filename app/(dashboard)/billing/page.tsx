'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
    Wallet, TrendingUp, Users, AlertTriangle, Building2
} from 'lucide-react'

export default function BillingOverviewPage() {
    const [stats, setStats] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const { data } = await api.get('/billing/analytics')
            setStats(data)
        } catch (error) {
            console.error('Failed to load billing analytics:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <div className="p-8"><div className="animate-pulse flex space-x-4">Loading billing analytics...</div></div>
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Header title="Billing Overview" />

            <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* MRR */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--text-muted)]">Monthly Recurring Revenue</p>
                                <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                                    {formatCurrency(stats?.mrr || 0, 'USD')}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500/10 text-green-500">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* ARR */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--text-muted)]">Annual Recurring Revenue</p>
                                <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                                    {formatCurrency(stats?.arr || 0, 'USD')}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500">
                                <Wallet className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Active Subscriptions */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--text-muted)]">Active Subscriptions</p>
                                <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                                    {stats?.activeSubscriptions || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-500">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Past Due */}
                    <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-[var(--text-muted)]">Past Due Accounts</p>
                                <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">
                                    {stats?.pastDueAccounts || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)]">
                    <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Quick Limits Overview</h2>
                    <p className="text-[var(--text-secondary)]">Total Schools Registered on Platform: <span className="font-bold">{stats?.totalSchools || 0}</span></p>
                </div>

            </main>
        </div>
    )
}
