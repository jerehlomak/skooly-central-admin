'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, RefreshCw, Menu, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useMobileMenu } from '@/app/(dashboard)/layout'
import { cn } from '@/lib/utils'

interface HeaderProps {
    title: string
    subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
    const { admin, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const { setIsMobileMenuOpen } = useMobileMenu()
    const pathname = usePathname()

    return (
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 gap-4"
            style={{
                background: isDark ? 'rgba(10, 15, 30, 0.9)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                borderBottom: `1px solid var(--border-color)`,
            }}>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{title}</h1>
                    {subtitle && <p className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors"
                    style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-color)' }}>
                    <Search className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <input placeholder="Quick search…"
                        className="bg-transparent outline-none w-40 text-xs placeholder-current"
                        style={{ color: 'var(--text-secondary)' }} />
                </div>

                {/* Refresh */}
                <button onClick={() => window.location.reload()}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    title="Refresh">
                    <RefreshCw className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                </button>

                {/* Theme Toggle */}
                <button onClick={toggleTheme}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                    {isDark
                        ? <Sun className="w-4 h-4 text-amber-400" />
                        : <Moon className="w-4 h-4 text-slate-600" />
                    }
                </button>

                {/* Notifications */}
                <button className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                    <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
                </button>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    {admin?.name?.[0] || 'A'}
                </div>
            </div>
        </header>
    )
}
