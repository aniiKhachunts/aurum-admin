import { apiFetch } from "../../../shared/lib/apiClient"

export type AppSettings = {
    maintenanceMode: boolean
    features: { aiJobs: boolean; refunds: boolean; audit: boolean }
    controls: { supportRefundLimit: number; maxAiConcurrentRuns: number }
}

export async function getSettings() {
    return apiFetch<{ item: AppSettings }>("/api/settings")
}

export async function updateSettings(patch: Partial<AppSettings>) {
    return apiFetch<{ item: AppSettings }>("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
    })
}
