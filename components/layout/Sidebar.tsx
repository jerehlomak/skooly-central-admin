'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useMobileMenu } from '@/app/(dashboard)/layout'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard, School, CreditCard, BarChart3,
    Zap, Megaphone, TicketCheck, ClipboardList, LogOut,
    Shield, ChevronRight, Building2, Receipt, CircleDollarSign,
    FileText, Tag, Wallet
} from 'lucide-react'

export const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'School Groups', href: '/groups', icon: Building2 },
    { label: 'Schools', href: '/schools', icon: School },
    { label: 'Billing Overview', href: '/billing', icon: Wallet },
    { label: 'Plans', href: '/billing/plans', icon: CreditCard },
    { label: 'Subscriptions', href: '/billing/subscriptions', icon: FileText },
    { label: 'Invoices', href: '/billing/invoices', icon: Receipt },
    { label: 'Payments', href: '/billing/payments', icon: CircleDollarSign },
    { label: 'Coupons', href: '/billing/coupons', icon: Tag },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Features', href: '/features', icon: Zap },
    { label: 'Announcements', href: '/announcements', icon: Megaphone },
    { label: 'Support Tickets', href: '/tickets', icon: TicketCheck },
    { label: 'Audit Logs', href: '/audit-logs', icon: ClipboardList },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { admin, logout } = useAuth()
    const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu()

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen w-64 flex-col z-50 transition-transform duration-300 ease-in-out",
            "md:translate-x-0 md:flex",
            isMobileMenuOpen ? "translate-x-0 flex shadow-2xl" : "-translate-x-full flex",
        )}
            style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-color)' }}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                    <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Skooly</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Central Admin</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
                    return (
                        <Link key={href} href={href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                            )}
                            style={isActive ? {
                                background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.08) 100%)',
                                borderLeft: '3px solid #3b82f6',
                                color: '#3b82f6',
                            } : {
                                color: 'var(--text-secondary)',
                            }}
                            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '' }}
                        >
                            <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-blue-400' : '')}
                                style={!isActive ? { color: 'var(--text-muted)' } : {}} />
                            <span className="flex-1">{label}</span>
                            {isActive && <ChevronRight className="w-3 h-3 text-blue-400" />}
                        </Link>
                    )
                })}
            </nav>

            {/* Admin info + logout */}
            <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        {admin?.name?.[0] || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{admin?.name || 'Admin'}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{admin?.role || 'SUPER_ADMIN'}</p>
                    </div>
                </div>
                <button onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </aside>
    )
}
