import { ApiError } from "./apiClient"

export function formatApiError(e: any) {
    if (e instanceof ApiError) return e.code ? `${e.message} (${e.code})` : e.message
    return e?.message || "Error"
}
