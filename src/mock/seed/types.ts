export type SeedUserStatus = "Active" | "Invited" | "Suspended" | "Deactivated"
export type SeedRole = "owner" | "admin" | "analyst" | "support" | "viewer"

export type SeedUser = {
    id: string
    name: string
    email: string
    role: SeedRole
    status: SeedUserStatus
    orgId: string
    tags: string[]
    createdAt: string
    lastActiveAt: string
}

export type SeedOrg = {
    id: string
    name: string
    plan: "free" | "pro" | "enterprise"
    seatsUsed: number
    seatsTotal: number
    createdAt: string
}

export type SeedTransaction = {
    id: string
    orgId: string
    userId: string
    amount: number
    currency: "USD"
    status: "Paid" | "Refunded" | "Failed"
    provider: "Stripe" | "Paypal"
    createdAt: string
}

export type AuditEventDto = {
    id: string
    action: string
    entityType: string
    entityId?: string
    actorRole?: string
    createdAt: string
}