import { apiFetch } from "../../../shared/lib/apiClient"
import type { AuditEntityType } from "../../../mock/seed/auditTypes"

export type AuditEvent = {
    id: string
    createdAt: string
    actorId: string
    actorRole: string
    action: string
    entityType: AuditEntityType
    entityId: string
    meta?: unknown
}

export type AuditEventsResponse = {
    items: AuditEvent[]
}

export async function getAuditEvents(params: {
    entityType?: string
    entityId?: string
    action?: string
    q?: string
    limit?: number
}) {
    const url = new URL("/api/audit/events", window.location.origin)
    if (params.entityType) url.searchParams.set("entityType", params.entityType)
    if (params.entityId) url.searchParams.set("entityId", params.entityId)
    if (params.action) url.searchParams.set("action", params.action)
    if (params.q) url.searchParams.set("q", params.q)
    if (params.limit) url.searchParams.set("limit", String(params.limit))
    return apiFetch<AuditEventsResponse>(url.pathname + url.search)
}
