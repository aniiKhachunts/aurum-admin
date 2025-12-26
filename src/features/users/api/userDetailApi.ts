import { apiFetch } from "../../../shared/lib/apiClient"

export type UserDetail = {
    id: string
    name: string
    email: string
    role: string
    status: string
    orgId: string
    tags: string[]
    createdAt: string
    lastActiveAt: string
}

export async function getUser(id: string) {
    return apiFetch<{ item: UserDetail }>(`/api/users/${id}`)
}

export async function updateUser(
    id: string,
    patch: Partial<Pick<UserDetail, "name" | "role" | "tags" | "status">>
) {
    return apiFetch<{ item: UserDetail }>(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
    })
}

export async function suspendUser(id: string) {
    return apiFetch<{ item: UserDetail }>(`/api/users/${id}/suspend`, { method: "POST" })
}

export async function deactivateUser(id: string) {
    return apiFetch<{ item: UserDetail }>(`/api/users/${id}/deactivate`, { method: "POST" })
}
