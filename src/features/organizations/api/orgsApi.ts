import { apiFetch } from "../../../shared/lib/apiClient"

export type Org = {
    id: string
    name: string
    plan: "free" | "pro" | "enterprise"
    seatsUsed: number
    seatsTotal: number
    createdAt: string
}

export async function getOrganizations() {
    return apiFetch<{ items: Org[] }>("/api/organizations")
}
