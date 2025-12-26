import { apiFetch } from "../../../shared/lib/apiClient"
import type { SortingState } from "@tanstack/react-table"
import { serializeSortParam } from "../../../shared/lib/tableUrlState"

export type User = {
    id: string
    name: string
    email: string
    role: string
    status: string
    orgId: string
    tags?: string[]
    createdAt?: string
    lastActiveAt?: string
}

export type UsersResponse = {
    items: User[]
    page: number
    pageSize: number
    total: number
}

export async function getUsers(params: {
    page: number
    pageSize: number
    search: string
    status: string
    sort?: SortingState
}) {
    const url = new URL("/api/users", window.location.origin)
    url.searchParams.set("page", String(params.page))
    url.searchParams.set("pageSize", String(params.pageSize))

    if (params.search?.trim()) url.searchParams.set("search", params.search.trim())
    if (params.status?.trim()) url.searchParams.set("status", params.status.trim())

    const sortValue = params.sort?.length ? serializeSortParam(params.sort) : ""
    if (sortValue) url.searchParams.set("sort", sortValue)
    else url.searchParams.delete("sort")

    return apiFetch<UsersResponse>(url.pathname + url.search)
}
