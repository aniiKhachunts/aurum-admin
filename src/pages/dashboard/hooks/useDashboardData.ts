import { useEffect, useMemo, useState } from "react"
import {apiFetch} from "../../../shared/lib/apiClient.ts";
import {getAuditEvents} from "../../../features/audit/api/auditApi.ts";
import {getErrorMessage} from "../../../shared/lib/getErrorMessage.ts";
import type {AuditEventDto} from "../../../mock/seed/types.ts";

type OverviewRes = {
    users: { total: number }
    aiJobs: { total: number; failed: number }
    billing: { totalTransactions: number; refunded: number }
}

type RevenuePoint = {
    date: string
    revenueUsd: number
    refundsUsd: number
    txCount: number
}

type RevenueRes = {
    series: RevenuePoint[]
}

type Jobs30Point = {
    date: string

    queued?: number
    running?: number
    paused?: number
    completed?: number
    failed?: number
    canceled?: number

    Queued?: number
    Running?: number
    Paused?: number
    Completed?: number
    Failed?: number
    Canceled?: number
}

type Jobs30Res = {
    series: Jobs30Point[]
}

export function useDashboardData() {
    const [overview, setOverview] = useState<OverviewRes | null>(null)
    const [revenue, setRevenue] = useState<RevenuePoint[]>([])
    const [jobsSeries, setJobsSeries] = useState<Jobs30Point[]>([])
    const [events, setEvents] = useState<AuditEventDto[]>([])

    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setErr(null)
            try {
                const [o, r, j, a] = await Promise.all([
                    apiFetch<OverviewRes>("/api/analytics/overview"),
                    apiFetch<RevenueRes>("/api/analytics/revenue-30d"),
                    apiFetch<Jobs30Res>("/api/analytics/ai-jobs-30d"),
                    getAuditEvents({ entityType: "", action: "", q: "", limit: 10 }),
                ])

                setOverview(o)
                setRevenue(r.series)
                setJobsSeries(j.series)
                setEvents(a.items)
            } catch (e) {
                setErr(getErrorMessage(e))
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [])

    const totals = useMemo(() => {
        const revenue30 = revenue?.reduce((a, x) => a + (x.revenueUsd || 0), 0)
        const refunds30 = revenue?.reduce((a, x) => a + (x.refundsUsd || 0), 0)

        return { revenue30, refunds30 }
    }, [revenue])

    const normalizedJobs = useMemo(() => {
        return jobsSeries?.map((j: any) => ({
            date: j.date,

            queued: j.queued ?? j.Queued ?? 0,
            running: j.running ?? j.Running ?? 0,
            paused: j.paused ?? j.Paused ?? 0,
            completed: j.completed ?? j.Completed ?? 0,
            failed: j.failed ?? j.Failed ?? 0,
            canceled: j.canceled ?? j.Canceled ?? 0,
        }))
    }, [jobsSeries])

    return {
        overview,
        revenue,
        jobsSeries: normalizedJobs,
        events,
        totals,
        loading,
        err,
    }
}