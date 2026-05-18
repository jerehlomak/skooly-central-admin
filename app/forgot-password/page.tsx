'use client'

import { useState } from 'react'
import { ShieldCheck, ArrowLeft, Mail } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post('/auth/forgot-password', { email })
            setSubmitted(true)
            toast.success('Recovery link sent!')
        } catch {
            // Even if it fails, we don't want to expose if an email exists
            setSubmitted(true)
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
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Forgot Password</h1>
                        <p className="text-sm text-slate-500 mt-1.5 font-medium text-center">
                            Enter your admin email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="admin@skooly.com"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl text-[15px] font-medium text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
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
                                        Sending...
                                    </span>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Check your email</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-sm font-semibold text-green-600 hover:text-teal-600 transition-colors"
                            >
                                Try another email
                            </button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
