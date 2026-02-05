import {useEffect, useMemo, useState} from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import {SectionCard} from "../shared/ui/SectionCard"
import {getAuditEvents, type AuditEvent} from "../features/audit/api/auditApi"
import {apiFetch} from "../shared/lib/apiClient"
import {getErrorMessage} from "../shared/lib/getErrorMessage"
import {Header} from "../shared/ui/Header.tsx";

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

type RevenueRes = { series: RevenuePoint[] }

type Jobs30Point = {
    date: string
    queued: number
    running: number
    paused: number
    failed: number
    completed: number
    canceled: number
}

type Jobs30Res = { series: Jobs30Point[] }

function fmtUsd(n: number) {
    return new Intl.NumberFormat(undefined, {style: "currency", currency: "USD", maximumFractionDigits: 0}).format(n)
}

function fmtCompact(n: number) {
    return new Intl.NumberFormat(undefined, {notation: "compact", maximumFractionDigits: 1}).format(n)
}

function lastLabel(d: string) {
    const m = d.slice(5, 10)
    return m
}

export default function DashboardPage() {
    const [overview, setOverview] = useState<OverviewRes | null>(null)
    const [revenue, setRevenue] = useState<RevenuePoint[]>([])
    const [jobsSeries, setJobsSeries] = useState<Jobs30Point[]>([])
    const [events, setEvents] = useState<AuditEvent[]>([])

    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    const totals = useMemo(() => {
        const revenue30 = revenue.reduce((a, x) => a + (Number(x.revenueUsd) || 0), 0)
        const refunds30 = revenue.reduce((a, x) => a + (Number(x.refundsUsd) || 0), 0)
        const tx30 = revenue.reduce((a, x) => a + (Number(x.txCount) || 0), 0)

        const latestJobs = jobsSeries.at(-1)
        const running = latestJobs?.running ?? 0
        const queued = latestJobs?.queued ?? 0
        const failed = latestJobs?.failed ?? 0

        return {revenue30, refunds30, tx30, running, queued, failed}
    }, [revenue, jobsSeries])

    async function loadAll() {
        setLoading(true)
        setErr(null)
        try {
            const [o, r, j, a] = await Promise.all([
                apiFetch<OverviewRes>("/api/analytics/overview"),
                apiFetch<RevenueRes>("/api/analytics/revenue-30d"),
                apiFetch<Jobs30Res>("/api/analytics/ai-jobs-30d"),
                getAuditEvents({entityType: "", action: "", q: "", limit: 10}),
            ])

            setOverview(o)
            setRevenue(r.series)
            setJobsSeries(j.series)
            setEvents(a.items)
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadAll()
    }, [])

    const kpi = [
        {
            label: "Total users",
            value: overview ? fmtCompact(overview.users.total) : "—",
            hint: "Accounts in system",
        },
        {
            label: "AI jobs",
            value: overview ? fmtCompact(overview.aiJobs.total) : "—",
            hint: overview ? `${overview.aiJobs.failed} failed` : "—",
        },
        {
            label: "Transactions",
            value: overview ? fmtCompact(overview.billing.totalTransactions) : "—",
            hint: overview ? `${overview.billing.refunded} refunded` : "—",
        },
        {
            label: "Revenue (30d)",
            value: revenue.length ? fmtUsd(totals.revenue30) : "—",
            hint: revenue.length ? `Refunds: ${fmtUsd(totals.refunds30)}` : "—",
        },
    ]

    const topLine = useMemo(() => {
        const last = revenue.at(-1)
        if (!last) return null
        return {
            revenueToday: last.revenueUsd,
            refundsToday: last.refundsUsd,
            txToday: last.txCount,
        }
    }, [revenue])

    return (
        <div className="space-y-4">
            <Header title="Operations Dashboard" subtitle="AI pipelines, billing health, and system activity."/>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {kpi.map((x) => (
                    <div
                        key={x.label}
                        className="rounded-2xl p-4"
                        style={{
                            background: "rgb(var(--panel))",
                            border: "1px solid rgb(var(--border))",
                            boxShadow: "var(--sh-sm)",
                        }}
                    >
                        <div className="text-xs font-semibold" style={{color: "rgb(var(--muted))"}}>
                            {x.label}
                        </div>
                        <div className="mt-1 text-2xl font-semibold">{x.value}</div>
                        <div className="mt-2 text-xs" style={{color: "rgb(var(--muted))"}}>
                            {x.hint}
                        </div>
                    </div>
                ))}
            </div>

            {err ? (
                <SectionCard title="Dashboard status">
                    <div className="text-sm" style={{color: "rgb(var(--danger))"}}>
                        {err}
                    </div>
                    <button
                        className="mt-3 rounded-xl px-3 py-2 text-sm font-medium"
                        style={{border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))"}}
                        onClick={loadAll}
                        disabled={loading}
                    >
                        {loading ? "Reloading…" : "Reload"}
                    </button>
                </SectionCard>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-[1fr]">
                <SectionCard
                    title="Revenue & refunds (30 days)"
                    description={
                        topLine
                            ? `Today: ${fmtUsd(topLine.revenueToday)} · refunds ${fmtUsd(topLine.refundsToday)} · ${topLine.txToday} tx`
                            : "Daily revenue signal"
                    }
                >
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenue}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date" tickFormatter={lastLabel}/>
                                <YAxis tickFormatter={(v) => fmtCompact(Number(v))}/>
                                <Tooltip
                                    formatter={(v: unknown, n: unknown) => {
                                        const name = String(n)
                                        const num = Number(v) || 0
                                        if (name === "revenueUsd" || name === "refundsUsd") return [fmtUsd(num), name]
                                        return [String(v), name]
                                    }}
                                    labelFormatter={(l) => `Date: ${l}`}
                                />
                                <Legend/>
                                <Area type="monotone" dataKey="revenueUsd" name="Revenue" fill="rgb(var(--brand))"
                                      stroke="rgb(var(--brand))"/>
                                <Area type="monotone" dataKey="refundsUsd" name="Refunds" fill="rgb(var(--danger))"
                                      stroke="rgb(var(--danger))"/>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="AI job flow (30 days)"
                             description={`Latest: running ${totals.running} · queued ${totals.queued} · failed ${totals.failed}`}>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={jobsSeries}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="date" tickFormatter={lastLabel}/>
                                <YAxis/>
                                <Tooltip labelFormatter={(l) => `Date: ${l}`}/>
                                <Legend/>
                                <Bar dataKey="Queued" stackId="a" name="Queued" fill="rgb(var(--info))"/>
                                <Bar dataKey="Running" stackId="a" name="Running" fill="rgb(var(--brand))"/>
                                <Bar dataKey="Paused" stackId="a" name="Paused" fill="rgb(var(--warn))"/>
                                <Bar dataKey="Completed" stackId="a" name="Completed" fill="rgb(var(--success))"/>
                                <Bar dataKey="Failed" stackId="a" name="Failed" fill="rgb(var(--danger))"/>
                                <Bar dataKey="Canceled" stackId="a" name="Canceled" fill="rgb(var(--border-strong))"/>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
                <SectionCard title="Recent activity" description="Last 10 audit events">
                    {events.length === 0 ? (
                        <div className="text-sm" style={{color: "rgb(var(--muted))"}}>
                            No activity yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {events.map((e) => (
                                <div
                                    key={e.id}
                                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                                    style={{background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))"}}
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium">
                                            {e.action} · {e.entityType}
                                        </div>
                                        <div className="text-xs" style={{color: "rgb(var(--muted))"}}>
                                            {e.entityId} · {e.actorRole} · {e.actorId}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-[11px]" style={{color: "rgb(var(--muted))"}}>
                                        {new Date(e.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Advanced">
                    <div className="space-y-3 text-sm" style={{color: "rgb(var(--muted))"}}>

                        <button
                            className="mt-2 rounded-xl px-3 py-2 text-sm font-medium"
                            style={{
                                border: "1px solid rgb(var(--border))",
                                background: "rgb(var(--panel-2))",
                                color: "rgb(var(--text))"
                            }}
                            onClick={loadAll}
                            disabled={loading}
                        >
                            {loading ? "Refreshing…" : "Refresh data"}
                        </button>
                    </div>
                </SectionCard>
            </div>
        </div>
    )
}
