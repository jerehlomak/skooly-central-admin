'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-green-50 -skew-y-6 transform origin-top-left z-0"></div>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl z-0"></div>
            <div className="absolute bottom-0 left-10 w-72 h-72 bg-teal-50 rounded-full blur-3xl z-0"></div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
                    {/* Logo & Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="mb-6 relative">
                            <Image 
                                src="/logo.png" 
                                alt="Skooly Plus Logo" 
                                width={160} 
                                height={60} 
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mb-4">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[11px] font-bold tracking-wider uppercase">Central Admin</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome Back</h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium">Log in to manage the Skooly Platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@skooly.com"
                                className="w-full px-4 py-3.5 rounded-xl text-[15px] font-medium text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <Link href="/forgot-password" className="text-sm font-semibold text-green-600 hover:text-teal-600 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3.5 pr-12 rounded-xl text-[15px] font-medium text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none shadow-sm"
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600 transition-colors p-1">
                                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-xl text-[15px] font-bold text-white bg-green-600 hover:bg-teal-600 shadow-lg shadow-green-600/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>
                
                <p className="text-center text-xs font-medium text-slate-400 mt-8">
                    &copy; {new Date().getFullYear()} Skooly Plus. Authorized personnel only.
                </p>
            </div>
        </div>
    )
}
