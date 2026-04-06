'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await login(email, password)
            toast.success('Welcome back!')
        } catch {
            toast.error('Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #060b17 0%, #0a1428 50%, #060b17 100%)' }}>

            {/* Background orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 opacity-20 blur-3xl rounded-full"
                style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 opacity-15 blur-3xl rounded-full"
                style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />

            <div className="relative w-full max-w-md px-6">
                {/* Card */}
                <div className="p-8 rounded-2xl backdrop-blur-[12px] border shadow-2xl" style={{ background: 'rgba(17, 24, 39, 0.85)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Central Admin</h1>
                        <p className="text-sm text-slate-500 mt-1">Skooly Platform Management</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@skooly.com"
                                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </span>
                            ) : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-600 mt-6">
                        Restricted access — Skooly platform administrators only
                    </p>
                </div>
            </div>
        </div>
    )
}
