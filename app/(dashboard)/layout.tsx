'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/layout/Sidebar'

export const MobileMenuContext = createContext<{
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (v: boolean) => void;
}>({
    isMobileMenuOpen: false,
    setIsMobileMenuOpen: () => { }
});

export const useMobileMenu = () => useContext(MobileMenuContext);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { admin, loading } = useAuth()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (!loading && !admin) {
            router.push('/login')
        }
    }, [admin, loading, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!admin) return null

    return (
        <MobileMenuContext.Provider value={{ isMobileMenuOpen, setIsMobileMenuOpen }}>
            <div className="flex h-screen overflow-hidden">
                {/* Mobile overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)} />
                )}

                <Sidebar />
                <main className="flex-1 md:ml-64 overflow-y-auto">
                    {children}
                </main>
            </div>
        </MobileMenuContext.Provider>
    )
}
