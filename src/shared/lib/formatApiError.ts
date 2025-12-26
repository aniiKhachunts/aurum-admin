import { ApiError } from "./apiClient"
import {getErrorMessage} from "./getErrorMessage.ts";

export function formatApiError(e: unknown) {
    if (e instanceof ApiError) return e.code ? `${e.message} (${e.code})` : e.message
    return getErrorMessage(e) || "Error"
}
