import { useDevSettingsStore } from "./devSettingsStore"
import { useSettingsStore } from "./settingsStore"
import { useApiMetricsStore } from "./apiMetricsStore"
import {useSessionStore} from "./sessionStore.ts";

type ApiErrorShape = {
    status: number
    message: string
    code?: string
    details?: unknown
}

export class ApiError extends Error {
    status: number
    code?: string
    details?: unknown
    constructor(payload: ApiErrorShape) {
        super(payload.message)
        this.status = payload.status
        this.code = payload.code
        this.details = payload.details
    }
}

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms))
}

function randInt(min: number, max: number) {
    const a = Math.min(min, max)
    const b = Math.max(min, max)
    return Math.floor(a + Math.random() * (b - a + 1))
}

function toUrlString(input: RequestInfo | URL) {
    if (typeof input === "string") return input
    if (input instanceof URL) return input.toString()
    const anyInput: any = input
    if (anyInput?.url) return String(anyInput.url)
    return String(input)
}

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const dev = useDevSettingsStore.getState()

    if (dev.enabled) {
        const delay = randInt(dev.minDelayMs, dev.maxDelayMs)
        await sleep(delay)
    }

    const shouldForceFail = dev.enabled && useDevSettingsStore.getState().consumeForceNextError()
    const shouldRandomFail = dev.enabled && Math.random() < dev.errorRate

    if (shouldForceFail || shouldRandomFail) {
        const ms = 0
        useApiMetricsStore.getState().push({
            id: `m_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            ts: Date.now(),
            method: (init?.method || "GET").toUpperCase(),
            url: toUrlString(input),
            ms,
            ok: false,
            error: "Simulated network error. Retry the request.",
        })

        throw new ApiError({
            status: 500,
            message: "Simulated network error. Retry the request.",
            code: "DEV_SIMULATED_ERROR",
        })
    }

    const urlStr = toUrlString(input)
    const method = (init?.method || "GET").toUpperCase()
    const settings = useSettingsStore.getState().settings
    const isMutation = method !== "GET"
    const isSettingsWrite = method === "PATCH" && urlStr.startsWith("/api/settings")

    if (settings?.maintenanceMode && isMutation && !isSettingsWrite) {
        useApiMetricsStore.getState().push({
            id: `m_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            ts: Date.now(),
            method,
            url: urlStr,
            ms: 0,
            ok: false,
            error: "Maintenance mode: write actions are temporarily disabled.",
        })

        throw new ApiError({
            status: 503,
            message: "Maintenance mode: write actions are temporarily disabled.",
            code: "MAINTENANCE_MODE",
        })
    }

    const started = performance.now()

    try {
        const role = useSessionStore.getState().role || "viewer"
        const headers = new Headers(init?.headers || {})
        headers.set("x-role", role)
        const nextInit = { ...(init || {}), headers }

        const res = await fetch(input, nextInit)
        const ms = Math.round(performance.now() - started)

        useApiMetricsStore.getState().push({
            id: `m_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            ts: Date.now(),
            method,
            url: urlStr,
            ms,
            ok: res.ok,
            status: res.status,
        })

        if (!res.ok) {
            let payload: any = null
            try {
                payload = await res.json()
            } catch {
                payload = null
            }

            throw new ApiError({
                status: res.status,
                message: payload?.message || `Request failed (${res.status})`,
                code: payload?.code,
                details: payload?.details,
            })
        }

        const ct = res.headers.get("content-type") || ""
        if (ct.includes("application/json")) return (await res.json()) as T
        return (await res.text()) as unknown as T
    } catch (e: any) {
        const ms = Math.round(performance.now() - started)

        useApiMetricsStore.getState().push({
            id: `m_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            ts: Date.now(),
            method,
            url: urlStr,
            ms,
            ok: false,
            error: e?.message || "Error",
        })

        if (e instanceof ApiError) throw e
        throw new ApiError({
            status: 0,
            message: e?.message || "Network error",
            code: "NETWORK_ERROR",
            details: e,
        })
    }
}
