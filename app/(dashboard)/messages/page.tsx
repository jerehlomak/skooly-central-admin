'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import axios from 'axios'
import Header from '@/components/layout/Header'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import {
    MessageSquare, Send, Plus, X,
    School as SchoolIcon, Lock, Unlock, CheckCheck
} from 'lucide-react'

// Messaging uses a shared (non-central) endpoint, so we use a separate base
const MSG_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1')

function msgApi(method: 'get' | 'post' | 'put', path: string, data?: unknown) {
    // Attach central admin token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('centralAdminToken') : null
    return axios({
        method,
        url: `${MSG_BASE}/messaging${path}`,
        data,
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
}

interface Message {
    id: string
    senderType: 'ADMIN' | 'SCHOOL'
    senderName: string
    content: string
    readAt: string | null
    createdAt: string
}

interface Conversation {
    id: string
    subject: string
    isClosed: boolean
    lastMessageAt: string
    unreadCount: number
    school: { name: string; schoolCode?: string }
    messages: Message[]
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConv, setActiveConv] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [schools, setSchools] = useState<Array<{ id: string; name: string; status: string }>>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [input, setInput] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [newForm, setNewForm] = useState({ schoolId: '', subject: 'General Inquiry', content: '' })
    const bottomRef = useRef<HTMLDivElement>(null)

    const loadConversations = useCallback(async () => {
        setLoading(true)
        try {
            const [convRes, schRes] = await Promise.all([
                msgApi('get', ''),
                api.get('/schools')
            ])
            setConversations(convRes.data.conversations || [])
            setSchools(schRes.data.schools || [])
        } catch { toast.error('Failed to load messages') }
        finally { setLoading(false) }
    }, [])

    useEffect(() => { loadConversations() }, [loadConversations])

    const openConversation = async (conv: Conversation) => {
        setActiveConv(conv)
        try {
            const res = await msgApi('get', `/${conv.id}`)
            setMessages(res.data.messages || [])
            // lower unread badge instantly
            setConversations(prev => prev.map(c =>
                c.id === conv.id ? { ...c, unreadCount: 0 } : c
            ))
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
        } catch { toast.error('Failed to load messages') }
    }

    const sendReply = async () => {
        if (!input.trim() || !activeConv) return
        setSending(true)
        try {
            const res = await msgApi('post', `/${activeConv.id}/reply`, { content: input.trim() })
            setMessages(prev => [...prev, res.data.message])
            setInput('')
            setConversations(prev => prev.map(c =>
                c.id === activeConv.id ? { ...c, lastMessageAt: new Date().toISOString() } : c
            ))
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
        } catch { toast.error('Failed to send') }
        finally { setSending(false) }
    }

    const handleNewConversation = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newForm.schoolId || !newForm.content.trim()) return
        try {
            await msgApi('post', '', newForm)
            toast.success('Conversation started')
            setShowNew(false)
            setNewForm({ schoolId: '', subject: 'General Inquiry', content: '' })
            loadConversations()
        } catch { toast.error('Failed to start conversation') }
    }

    const toggleClose = async (convId: string) => {
        try {
            const res = await msgApi('put', `/${convId}/toggle`)
            setActiveConv(prev => prev ? { ...prev, isClosed: res.data.conversation.isClosed } : null)
            setConversations(prev => prev.map(c =>
                c.id === convId ? { ...c, isClosed: res.data.conversation.isClosed } : c
            ))
        } catch { toast.error('Failed to update') }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header title="Messages" subtitle="Direct communication with schools" />
            <div className="flex-1 flex overflow-hidden p-6 gap-6 max-w-7xl mx-auto w-full">

                {/* Left pane: Conversation list */}
                <div className="w-80 flex-shrink-0 flex flex-col glass-card overflow-hidden">
                    <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                        <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-400" /> Conversations
                        </h2>
                        <button onClick={() => setShowNew(true)}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)]">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <p className="text-center py-12 text-slate-500 text-sm">No conversations yet.</p>
                        ) : conversations.map(conv => (
                            <button key={conv.id} onClick={() => openConversation(conv)}
                                className={`w-full text-left p-4 transition-colors hover:bg-white/5 ${activeConv?.id === conv.id ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''}`}>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <SchoolIcon className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                            {conv.school?.name || 'Unknown'}
                                        </span>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="flex-shrink-0 text-[10px] font-bold text-white bg-blue-500 rounded-full px-1.5 py-0.5">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-medium text-[var(--text-secondary)] truncate">{conv.subject}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                                        {conv.messages?.[0]?.content || '—'}
                                    </p>
                                    <span className="text-[10px] text-slate-500 flex-shrink-0">
                                        {formatDate(conv.lastMessageAt)}
                                    </span>
                                </div>
                                {conv.isClosed && (
                                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-400">
                                        <Lock className="w-2.5 h-2.5" /> Closed
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right pane: Message thread */}
                <div className="flex-1 flex flex-col glass-card overflow-hidden">
                    {!activeConv ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
                            <MessageSquare className="w-12 h-12 opacity-20" />
                            <p className="text-sm">Select a conversation to view messages</p>
                            <button onClick={() => setShowNew(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                                style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                                <Plus className="w-4 h-4" /> New Conversation
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Thread header */}
                            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-[var(--text-primary)]">{activeConv.subject}</h3>
                                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                        <SchoolIcon className="w-3 h-3 text-emerald-400" />
                                        {activeConv.school?.name}
                                    </p>
                                </div>
                                <button onClick={() => toggleClose(activeConv.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeConv.isClosed ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'}`}>
                                    {activeConv.isClosed ? <><Unlock className="w-3 h-3" /> Reopen</> : <><Lock className="w-3 h-3" /> Close</>}
                                </button>
                            </div>

                            {/* Messages scroll area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map(msg => {
                                    const isAdmin = msg.senderType === 'ADMIN'
                                    return (
                                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${isAdmin
                                                ? 'bg-blue-600 text-white rounded-br-sm'
                                                : 'bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-bl-sm'}`}>
                                                {!isAdmin && (
                                                    <p className="text-[10px] font-bold text-emerald-400 mb-1">{msg.senderName}</p>
                                                )}
                                                <p className="leading-relaxed">{msg.content}</p>
                                                <div className={`flex items-center gap-1 mt-1 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                    <span className={`text-[10px] ${isAdmin ? 'text-blue-200' : 'text-slate-500'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isAdmin && msg.readAt && <CheckCheck className="w-3 h-3 text-blue-200" />}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input box */}
                            {!activeConv.isClosed ? (
                                <div className="p-4 border-t border-[var(--border-color)] flex items-end gap-3">
                                    <textarea
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                                        placeholder="Type a message… (Enter to send)"
                                        rows={2}
                                        className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] text-[var(--text-primary)] focus:border-blue-500 transition-colors"
                                    />
                                    <button onClick={sendReply} disabled={sending || !input.trim()}
                                        className="p-3 rounded-xl text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
                                        style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 border-t border-[var(--border-color)] text-center text-sm text-amber-400">
                                    <Lock className="w-4 h-4 inline mr-1" /> This conversation is closed.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* New Conversation Modal */}
            {showNew && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-card p-6 w-full max-w-md rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-[var(--text-primary)]">New Conversation</h2>
                            <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleNewConversation} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">School *</label>
                                <select required value={newForm.schoolId} onChange={e => setNewForm(p => ({ ...p, schoolId: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] text-white focus:border-blue-500 transition-colors">
                                    <option value="">-- Select a school --</option>
                                    {schools.filter(s => s.status === 'ACTIVE').map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">Subject</label>
                                <input type="text" value={newForm.subject}
                                    onChange={e => setNewForm(p => ({ ...p, subject: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] text-white focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">First Message *</label>
                                <textarea required rows={4} value={newForm.content}
                                    onChange={e => setNewForm(p => ({ ...p, content: e.target.value }))}
                                    placeholder="Type your message to the school..."
                                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border border-[var(--border-color)] bg-[var(--bg-main)] text-white focus:border-blue-500 transition-colors resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowNew(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit"
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
