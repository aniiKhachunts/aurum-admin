export type AuditEntityType = "settings" | "user" | "transaction" | "ai_job" | "org"

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
