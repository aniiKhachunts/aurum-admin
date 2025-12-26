import { apiFetch } from "../../../shared/lib/apiClient"
import type { SortingState } from "@tanstack/react-table"
import { serializeSortParam } from "../../../shared/lib/tableUrlState"

export type Tx = {
    id: string
    orgId: string
    userId: string
    amount: number
    currency: "USD"
    status: "paid" | "refunded" | "failed"
    provider: "stripe" | "paypal"
    createdAt: string
}

export type TransactionsResponse = {
    items: Tx[]
    page: number
    pageSize: number
    total: number
}

export async function getTransactions(params: {
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

    return apiFetch<TransactionsResponse>(`/api/transactions?${q.toString()}`)
}

export async function refundTransaction(id: string) {
    return apiFetch<{ item: Tx }>(`/api/transactions/${id}/refund`, { method: "POST" })
}
