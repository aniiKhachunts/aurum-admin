export type AuditEvent = {
    id: string
    ts: string
    actorRole: string
    action: string
    entityType: string
    entityId: string
    meta?: Record<string, any>
}

const audit: AuditEvent[] = []

function uid() {
    return `au_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function addAudit(e: Omit<AuditEvent, "id" | "ts">) {
    const item: AuditEvent = { id: uid(), ts: new Date().toISOString(), ...e }
    audit.unshift(item)
    if (audit.length > 500) audit.length = 500
    return item
}

export function listAudit(params: { entityType?: string; entityId?: string; limit?: number }) {
    const limit = params.limit ?? 50
    return audit
        .filter((x) => (params.entityType ? x.entityType === params.entityType : true))
        .filter((x) => (params.entityId ? x.entityId === params.entityId : true))
        .slice(0, limit)
}
