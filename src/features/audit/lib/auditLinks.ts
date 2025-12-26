export function getAuditEntityHref(entityType: string, entityId: string) {
    if (!entityType) return null

    if (entityType === "user") return entityId ? `/users/${entityId}` : null
    if (entityType === "ai_job") return entityId ? `/ai-jobs/${entityId}` : null
    if (entityType === "settings") return "/settings"

    if (entityType === "transaction") {
        return "/transactions"
    }

    return null
}
