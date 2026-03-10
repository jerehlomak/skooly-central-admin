// ─── Central Admin Types ─────────────────────────────────────────────────────

export type CentralAdminRole = 'SUPER_ADMIN' | 'SUPPORT'
export type SchoolStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'DELETED'
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type AnnouncementType = 'INFO' | 'WARNING' | 'MAINTENANCE'

export interface CentralAdmin {
    id: string
    name: string
    email: string
    role: CentralAdminRole
    lastLogin?: string
    createdAt: string
}

export interface SubscriptionPlan {
    id: string
    name: string
    description?: string
    price: number
    maxStudents: number
    maxTeachers: number
    maxClasses: number
    features: string[]
    isActive: boolean
    trialDays: number
    createdAt: string
    _count?: { schools: number }
}

export interface School {
    id: string
    name: string
    email: string
    phone?: string
    address?: string
    country?: string
    logoUrl?: string
    status: SchoolStatus
    planId?: string
    studentCount: number
    teacherCount: number
    adminEmail?: string
    suspendedAt?: string
    suspendReason?: string
    createdAt: string
    plan?: { name: string; price: number }
    subscription?: { isActive: boolean; endDate?: string }
}

export interface FeatureFlag {
    id: string
    schoolId: string
    feature: string
    enabled: boolean
}

export interface Announcement {
    id: string
    title: string
    body: string
    type: AnnouncementType
    targetGroup: string
    isPublished: boolean
    publishedAt?: string
    adminId: string
    createdAt: string
    admin?: { name: string }
}

export interface SupportTicket {
    id: string
    schoolId: string
    subject: string
    description: string
    status: TicketStatus
    priority: TicketPriority
    submittedBy: string
    resolvedAt?: string
    createdAt: string
    school?: { name: string; email: string }
    replies?: TicketReply[]
}

export interface TicketReply {
    id: string
    ticketId: string
    adminId: string
    message: string
    createdAt: string
    admin?: { name: string; email: string }
}

export interface AuditLog {
    id: string
    adminId?: string
    action: string
    entityType?: string
    entityId?: string
    metadata?: Record<string, unknown>
    ipAddress?: string
    createdAt: string
    admin?: { name: string; email: string }
}

export interface PlatformStats {
    totalSchools: number
    activeSchools: number
    suspendedSchools: number
    totalStudents: number
    totalTeachers: number
    totalPlans: number
    monthlyRevenue: number
    openTickets: number
}

export interface MonthlyData {
    month: string
    newSchools: number
    revenue: number
    totalStudents: number
    totalTeachers: number
}
