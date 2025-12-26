export type SeedUserStatus = "active" | "invited" | "suspended" | "deactivated"
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
    status: "paid" | "refunded" | "failed"
    provider: "stripe" | "paypal"
    createdAt: string
}
