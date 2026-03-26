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
import {type AuditEvent, getAuditEvents} from "../features/audit/api/auditApi"
import {apiFetch} from "../shared/lib/apiClient"
import {getErrorMessage} from "../shared/lib/getErrorMessage"
import {Header} from "../shared/ui/Header.tsx"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

function AnimatedNumber({ value }: { value: number }) {
    const motionValue = useMotionValue(0)
    const spring = useSpring(motionValue, { stiffness: 80, damping: 20 })
    const display = useTransform(spring, (latest) =>
        Math.round(latest).toLocaleString()
    )

    useEffect(() => {
        motionValue.set(value)
    }, [value])

    return <motion.span>{display}</motion.span>
}

function SkeletonCard() {
    return (
        <div
            className="rounded-2xl p-5 animate-pulse"
            style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <div className="h-3 w-20 bg-white/10 rounded mb-3"/>
            <div className="h-6 w-28 bg-white/10 rounded mb-2"/>
            <div className="h-3 w-24 bg-white/10 rounded"/>
        </div>
    )
}

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
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n)
}

function fmtCompact(n: number) {
    return new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(n)
}

function lastLabel(d: string) {
    return d.slice(5, 10)
}

const jobsTooltipMap = {
    queued: {label: "Queued", color: "rgb(var(--info))"},
    running: {label: "Running", color: "rgb(var(--brand))"},
    paused: {label: "Paused", color: "rgb(var(--warn))"},
    completed: {label: "Completed", color: "rgb(var(--success))"},
    failed: {label: "Failed", color: "rgb(var(--danger))"},
    canceled: {label: "Canceled", color: "rgb(var(--border-strong))"},
}

type JobsTooltipProps = {
    active?: boolean
    payload?: Array<{
        dataKey?: string
        value?: number
    }>
    label?: string
}

function JobsTooltip({active, payload, label}: JobsTooltipProps) {
    if (!active || !payload || payload.length === 0) return null

    const visibleItems = payload.filter((item) => {
        const value = Number(item.value ?? 0)
        return value > 0
    })

    if (visibleItems.length === 0) return null

    return (
        <div
            className="min-w-[180px] rounded-2xl p-3 transition-none"
            style={{
                background: "rgba(10,10,14,0.92)",   // 🔥 more solid = less flicker
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)", // 🔥 lighter shadow = faster feel
                pointerEvents: "none", // 🔥 CRITICAL: removes hover lag
            }}
        >
            <div
                className="mb-2 text-xs font-medium"
                style={{color: "rgba(255,255,255,0.55)"}}
            >
                {label}
            </div>

            <div className="space-y-2">
                {visibleItems.map((item) => {
                    const key = item.dataKey as keyof typeof jobsTooltipMap
                    const meta = jobsTooltipMap[key]

                    if (!meta) return null

                    return (
                        <div
                            key={key}
                            className="flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{background: meta.color}}
                                />
                                <span
                                    className="text-sm font-medium"
                                    style={{color: "rgba(255,255,255,0.88)"}}
                                >
                                    {meta.label}
                                </span>
                            </div>

                            <span
                                className="text-sm font-semibold"
                                style={{color: "white"}}
                            >
                                {item.value}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function RevenueTooltip({active, payload, label}: any) {
    if (!active || !payload || !payload.length) return null

    return (
        <div
            className="min-w-[180px] rounded-xl p-3"
            style={{
                background: "rgba(10,10,14,0.95)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
                pointerEvents: "none",
            }}
        >
            <div
                className="mb-2 text-xs"
                style={{color: "rgba(255,255,255,0.6)"}}
            >
                {label}
            </div>

            {payload.map((item: any) => {
                const value = Number(item.value) || 0

                const name =
                    item.dataKey === "revenueUsd"
                        ? "Revenue"
                        : item.dataKey === "refundsUsd"
                            ? "Refunds"
                            : item.dataKey

                return (
                    <div
                        key={item.dataKey}
                        className="flex justify-between text-sm"
                    >
                        <span style={{color: item.color}}>{name}</span>
                        <span className="font-semibold">
                            {fmtUsd(value)}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

function formatActivity(e: any) {
    const actionMap: Record<string, string> = {
        "transactions.refund": "Refund issued",
        "transactions.create": "Transaction created",
        "ai_jobs.start": "AI job started",
        "ai_jobs.cancel": "AI job canceled",
        "ai_jobs.complete": "AI job completed",
    }

    const entityMap: Record<string, string> = {
        transaction: "Transaction",
        ai_job: "AI Job",
        user: "User",
    }

    return {
        title: actionMap[e.action] || e.action,
        entity: entityMap[e.entityType] || e.entityType,
    }
}

function getActivityIcon(action: string) {
    if (action.includes("refund")) return "💸"
    if (action.includes("cancel")) return "✖"
    if (action.includes("start")) return "▶"
    if (action.includes("complete")) return "✔"
    return "•"
}

export default function DashboardPage() {
    const [overview, setOverview] = useState<OverviewRes | null>(null)
    const [revenue, setRevenue] = useState<RevenuePoint[]>([])
    const [jobsSeries, setJobsSeries] = useState<Jobs30Point[]>([])
    const [events, setEvents] = useState<AuditEvent[]>([])

    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    const totals = useMemo(() => {
        const revenue30 = revenue?.reduce((a, x) => a + (Number(x.revenueUsd) || 0), 0)
        const refunds30 = revenue?.reduce((a, x) => a + (Number(x.refundsUsd) || 0), 0)
        const tx30 = revenue.reduce((a, x) => a + (Number(x.txCount) || 0), 0)

        const latestJobs = jobsSeries.at(-1)
        const running = latestJobs?.running ?? 0
        const queued = latestJobs?.queued ?? 0
        const failed = latestJobs?.failed ?? 0

        return {revenue30, refunds30, tx30, running, queued, failed}
    }, [revenue, jobsSeries])

    const normalizedJobs = useMemo(() => {
        return jobsSeries.map((j: any) => ({
            ...j,
            queued: j.queued ?? j.Queued ?? 0,
            running: j.running ?? j.Running ?? 0,
            paused: j.paused ?? j.Paused ?? 0,
            completed: j.completed ?? j.Completed ?? 0,
            failed: j.failed ?? j.Failed ?? 0,
            canceled: j.canceled ?? j.Canceled ?? 0,
        }))
    }, [jobsSeries])

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
        console.log(events);
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

    const gradients = [
        "rgba(96,165,250,0.25)",
        "rgba(168,85,247,0.25)",
        "rgba(34,197,94,0.25)",
        "rgba(236,72,153,0.25)",
    ]

    return (
        <div className="space-y-6">

            {/* 🔥 STICKY GLASS HEADER */}
            <div className="sticky top-0 z-50">
                <div
                    className="backdrop-blur-xl"
                    style={{
                        background: "rgba(10,10,14,0.75)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <Header
                        title="Operations Dashboard"
                        subtitle="AI pipelines, billing health, and system activity."
                    />
                </div>
            </div>

            {/* 💎 KPI */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    kpi.map((x, i) => (
                    <div
                        key={x.label}
                        className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
                        style={{
                            background: `radial-gradient(circle at top left, ${gradients[i]}, transparent 60%)`,
                            backdropFilter: "blur(14px)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
                        }}
                    >
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition"
                            style={{
                                background: `radial-gradient(circle at top left, ${gradients[i]}, transparent 60%)`
                            }}
                        />

                        <div className="text-xs uppercase tracking-wider opacity-70">
                            {x.label}
                        </div>

                        <div className="mt-2 text-3xl font-semibold tracking-tight">
                            {typeof x.value === "number" ? <AnimatedNumber value={x.value} /> : x.value}
                        </div>

                        <div className="mt-2 text-xs opacity-70">
                            {x.hint}
                        </div>
                    </div>
                )))}
            </div>

            {/* REVENUE */}
            <SectionCard title="Revenue & refunds (30 days)">
                <div className="h-[320px]">
                    <ResponsiveContainer>
                        <AreaChart data={revenue}>
                            <defs>
                                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgb(var(--brand))" stopOpacity={0.4}/>
                                    <stop offset="100%" stopColor="rgb(var(--brand))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>

                            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
                            <XAxis dataKey="date" tickFormatter={lastLabel}/>
                            <YAxis tickFormatter={(v) => fmtCompact(Number(v))}/>
                            <Tooltip
                                content={<RevenueTooltip/>}
                                cursor={{stroke: "rgba(255,255,255,0.08)", strokeWidth: 1}}
                                isAnimationActive={false}
                            />
                            <Legend/>

                            <Area
                                type="monotone"
                                dataKey="revenueUsd"
                                stroke="rgb(var(--brand))"
                                fill="url(#rev)"
                                strokeWidth={2.5}
                                dot={false}
                            />

                            <Area
                                type="monotone"
                                dataKey="refundsUsd"
                                stroke="rgb(var(--danger))"
                                fillOpacity={0.1}
                                strokeWidth={2}
                                dot={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </SectionCard>

            {/* ✅ FIXED AI JOB FLOW */}
            <SectionCard title="AI job flow (30 days)">
                <div className="h-[320px]">
                    <ResponsiveContainer>
                        <BarChart data={normalizedJobs}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
                            <XAxis dataKey="date" tickFormatter={lastLabel}/>
                            <YAxis/>
                            <Tooltip
                                content={<JobsTooltip/>}
                                cursor={{fill: "rgba(255,255,255,0.03)"}}
                                isAnimationActive={false}
                            />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: 12,
                                    color: "rgba(255,255,255,0.72)",
                                    fontSize: 12,
                                }}
                            />

                            <Bar dataKey="queued" name="Queued" stackId="a" fill="rgb(var(--info))"
                                 radius={[4, 4, 0, 0]} isAnimationActive={false}/>
                            <Bar dataKey="running" name="Running" stackId="a" fill="rgb(var(--brand))"
                                 radius={[4, 4, 0, 0]} isAnimationActive={false}/>
                            <Bar dataKey="paused" name="Paused" stackId="a" fill="rgb(var(--warn))"
                                 radius={[4, 4, 0, 0]} isAnimationActive={false}/>
                            <Bar dataKey="completed" name="Completed" stackId="a" fill="rgb(var(--success))"
                                 radius={[4, 4, 0, 0]} isAnimationActive={false}/>
                            <Bar dataKey="failed" name="Failed" stackId="a" fill="rgb(var(--danger))"
                                 radius={[4, 4, 0, 0]} isAnimationActive={false}/>
                            <Bar dataKey="canceled" name="Canceled" stackId="a" fill="rgb(var(--border-strong))"
                                 radius={[4, 4, 0, 0]} isAnimationActive={false}/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </SectionCard>

            {/* ACTIVITY */}
            <SectionCard title="Recent activity">
                <div className="relative space-y-3">

                    {events.map((e, i) => {
                        const f = formatActivity(e)
                        const icon = getActivityIcon(e.action)

                        return (
                            <div
                                key={e.id ?? i}
                                className="group relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    backdropFilter: "blur(10px)",
                                }}
                            >
                                {/* 🔥 glow */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"
                                    style={{
                                        background:
                                            "radial-gradient(circle at left, rgba(255,255,255,0.08), transparent 70%)",
                                    }}
                                />

                                <div className="relative z-10 flex items-center justify-between">

                                    {/* LEFT */}
                                    <div className="flex items-center gap-3">

                                        {/* ICON */}
                                        <div
                                            className="flex items-center justify-center rounded-lg w-9 h-9 text-sm"
                                            style={{
                                                background: "rgba(255,255,255,0.06)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                            }}
                                        >
                                            {icon}
                                        </div>

                                        {/* TEXT */}
                                        <div>
                                            <div className="text-sm font-medium">
                                                {f.title}
                                            </div>

                                            <div className="text-xs opacity-60">
                                                {f.entity} · {e.entityId ?? "—"} · {e.actorRole ?? "—"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* TIME */}
                                    <div className="text-xs opacity-50">
                                        {e.createdAt
                                            ? new Date(e.createdAt).toLocaleTimeString()
                                            : ""}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </SectionCard>
        </div>
    )
}