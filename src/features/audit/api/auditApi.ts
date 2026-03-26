import {apiFetch} from "../../../shared/lib/apiClient.ts";


export type AuditEventDto = {
    id: string
    action: string
    entityType: string
    entityId?: string
    actorRole?: string
    createdAt: string
}

export type AuditEventsResponse = {
    items: AuditEventDto[]
}

export async function getAuditEvents(params: {
    entityType?: string
    entityId?: string
    action?: string
    q?: string
    limit?: number
}): Promise<AuditEventsResponse> {

    const url = new URL("/api/audit/events", window.location.origin)

    if (params.entityType) url.searchParams.set("entityType", params.entityType)
    if (params.entityId) url.searchParams.set("entityId", params.entityId)
    if (params.action) url.searchParams.set("action", params.action)
    if (params.q) url.searchParams.set("q", params.q)
    if (params.limit) url.searchParams.set("limit", String(params.limit))

    return apiFetch<AuditEventsResponse>(url.pathname + url.search)
}