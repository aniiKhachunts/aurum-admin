import { apiFetch } from "../../../shared/lib/apiClient"

export type AiJob = {
    id: string
    name: string
    status: string
    model: string
    priority: string
    progress: number
    createdAt: string
    updatedAt: string
    orgId: string
    createdBy: string
    dataset: string
    tokensBudget: number
    costCapUsd: number
}

export async function getAiJobs(params: { status: string }) {
    const q = new URLSearchParams()
    if (params.status) q.set("status", params.status)
    return apiFetch<{ items: AiJob[] }>(`/api/ai/jobs?${q.toString()}`)
}

export async function getAiJob(id: string) {
    return apiFetch<{ item: AiJob & { runs: any[] } }>(`/api/ai/jobs/${id}`)
}

export async function startAiJob(id: string) {
    return apiFetch<{ item: any }>(`/api/ai/jobs/${id}/start`, { method: "POST" })
}

export async function pauseAiJob(id: string) {
    return apiFetch<{ item: any }>(`/api/ai/jobs/${id}/pause`, { method: "POST" })
}

export async function cancelAiJob(id: string) {
    return apiFetch<{ item: any }>(`/api/ai/jobs/${id}/cancel`, { method: "POST" })
}
