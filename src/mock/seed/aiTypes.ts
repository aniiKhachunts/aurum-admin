export type AiJobStatus = "queued" | "running" | "paused" | "failed" | "completed" | "canceled"

export type AiJob = {
    id: string
    name: string
    status: AiJobStatus
    model: "gpt-4o-mini" | "gpt-4.1-mini" | "gpt-4.1" | "o3-mini"
    priority: "low" | "normal" | "high"
    progress: number
    createdAt: string
    updatedAt: string
    orgId: string
    createdBy: string
    dataset: string
    tokensBudget: number
    costCapUsd: number
    runs: { id: string; startedAt: string; endedAt?: string; outcome?: AiJobStatus }[]
}
