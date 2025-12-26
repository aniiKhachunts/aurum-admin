import {useSettingsStore} from "./settingsStore.ts";

export type Role = "owner" | "admin" | "analyst" | "support" | "viewer"

export type Permission =
    | "users:read"
    | "users:write"
    | "users:deactivate"
    | "orgs:read"
    | "orgs:write"
    | "billing:manage"
    | "projects:read"
    | "projects:write"
    | "transactions:read"
    | "transactions:refund"
    | "ai:read"
    | "ai:control"
    | "audit:read"
    | "settings:read"
    | "settings:write"

export type PermissionContext = {
    role: Role
    userId?: string
    orgId?: string
}

const matrix: Record<Role, Set<Permission>> = {
    owner: new Set([
        "users:read",
        "users:write",
        "users:deactivate",
        "orgs:read",
        "orgs:write",
        "billing:manage",
        "projects:read",
        "projects:write",
        "transactions:read",
        "transactions:refund",
        "ai:read",
        "ai:control",
        "audit:read",
        "settings:read",
        "settings:write",
    ]),
    admin: new Set([
        "users:read",
        "users:write",
        "users:deactivate",
        "orgs:read",
        "orgs:write",
        "projects:read",
        "projects:write",
        "transactions:read",
        "transactions:refund",
        "ai:read",
        "ai:control",
        "audit:read",
        "settings:read",
        "settings:write",
    ]),
    analyst: new Set([
        "users:read",
        "orgs:read",
        "projects:read",
        "transactions:read",
        "ai:read",
        "audit:read",
        "settings:read",
    ]),
    support: new Set([
        "users:read",
        "users:write",
        "orgs:read",
        "projects:read",
        "transactions:read",
        "transactions:refund",
        "ai:read",
        "ai:control",
        "audit:read",
        "settings:read",
    ]),
    viewer: new Set([
        "users:read",
        "orgs:read",
        "projects:read",
        "transactions:read",
        "ai:read",
        "audit:read",
        "settings:read",
    ]),
}

export function can(permission: Permission, ctx: PermissionContext) {
    return matrix[ctx.role].has(permission)
}

export function roleLabel(role: Role) {
    if (role === "owner") return "Owner"
    if (role === "admin") return "Admin"
    if (role === "analyst") return "Analyst"
    if (role === "support") return "Support"
    return "Viewer"
}

export function isSupportRefundAllowed(amount: number, role: string) {
    if (role !== "support") return true
    const limit = useSettingsStore.getState().settings?.controls.supportRefundLimit ?? 200
    return amount <= limit
}
