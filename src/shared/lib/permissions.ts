import {useSettingsStore} from "./settingsStore.ts";

export type Role = "Owner" | "Admin" | "Analyst" | "Support" | "Viewer"

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
    Owner: new Set([
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
    Admin: new Set([
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
    Analyst: new Set([
        "users:read",
        "orgs:read",
        "projects:read",
        "transactions:read",
        "ai:read",
        "audit:read",
        "settings:read",
    ]),
    Support: new Set([
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
    Viewer: new Set([
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
    if (role === "Owner") return "Owner"
    if (role === "Admin") return "Admin"
    if (role === "Analyst") return "Analyst"
    if (role === "Support") return "Support"
    return "Viewer"
}

export function isSupportRefundAllowed(amount: number, role: string) {
    if (role !== "Support") return true
    const limit = useSettingsStore.getState().settings?.controls.supportRefundLimit ?? 200
    return amount <= limit
}
