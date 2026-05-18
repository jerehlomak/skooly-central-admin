'use client'

import { useState, Suspense } from 'react'
import { ShieldCheck, Eye, EyeOff, Lock } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/api'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!token) {
            toast.error('Invalid or missing reset token.')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.')
            return
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters.')
            return
        }

        setLoading(true)
        try {
            await api.post('/auth/reset-password', { token, password })
            toast.success('Password reset successfully. You can now log in.')
            router.push('/login')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password. The link might have expired.')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Invalid Link</h3>
                <p className="text-sm text-slate-500 mb-6">
                    This password reset link is invalid or has expired.
                </p>
                <Link href="/forgot-password" className="text-sm font-semibold text-green-600 hover:text-teal-600 transition-colors">
                    Request a new link
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
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

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                    <input
                        type={showPw ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-3.5 pr-12 rounded-xl text-[15px] font-medium text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none shadow-sm"
                    />
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
                        Resetting...
                    </span>
                ) : 'Reset Password'}
            </button>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-green-50 -skew-y-6 transform origin-top-left z-0"></div>
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl z-0"></div>
            <div className="absolute bottom-0 left-10 w-72 h-72 bg-teal-50 rounded-full blur-3xl z-0"></div>

            <div className="relative z-10 w-full max-w-md px-6">
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
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
                            <span className="text-[11px] font-bold tracking-wider uppercase">Recovery</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Set New Password</h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium text-center">
                            Enter your new password below.
                        </p>
                    </div>

                    <Suspense fallback={<div className="text-center py-6 text-slate-500">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
