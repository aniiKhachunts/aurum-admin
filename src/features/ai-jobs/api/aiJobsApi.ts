import { apiFetch } from "../../../shared/lib/apiClient"
import type { SortingState } from "@tanstack/react-table"
import { serializeSortParam } from "../../../shared/lib/tableUrlState"

export type AiJobRun = {
    id: string
    startedAt: string
    outcome?: "in_progress" | "succeeded" | "failed" | "canceled"
}

export type AiJob = {
    id: string
    name: string
    status: "queued" | "running" | "paused" | "failed" | "completed" | "canceled"
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

export type AiJobWithRuns = AiJob & { runs: AiJobRun[] }

export type AiJobsResponse = {
    items: AiJob[]
    page: number
    pageSize: number
    total: number
}

export async function getAiJobs(params: {
    page: number
    pageSize: number
    status: string
    sort?: SortingState
}) {
    const q = new URLSearchParams()
    q.set("page", String(params.page))
    q.set("pageSize", String(params.pageSize))
    if (params.status) q.set("status", params.status)

    const sortValue = params.sort?.length ? serializeSortParam(params.sort) : ""
    if (sortValue) q.set("sort", sortValue)

    return apiFetch<AiJobsResponse>(`/api/ai/jobs?${q.toString()}`)
}

export async function getAiJob(id: string) {
    return apiFetch<{ item: AiJobWithRuns }>(`/api/ai/jobs/${id}`)
}

export async function startAiJob(id: string) {
    return apiFetch<{ item: AiJobWithRuns }>(`/api/ai/jobs/${id}/start`, { method: "POST" })
}

export async function pauseAiJob(id: string) {
    return apiFetch<{ item: AiJobWithRuns }>(`/api/ai/jobs/${id}/pause`, { method: "POST" })
}

export async function cancelAiJob(id: string) {
    return apiFetch<{ item: AiJobWithRuns }>(`/api/ai/jobs/${id}/cancel`, { method: "POST" })
}
