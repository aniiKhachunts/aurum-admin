import { useEffect, useState } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { SectionCard } from "../SectionCard"
import { apiFetch } from "../../lib/apiClient"
import { getErrorMessage } from "../../lib/getErrorMessage"

type Row = {
    Date: string
    Queued: number
    Running: number
    Paused: number
    Failed: number
    Completed: number
    Canceled: number
}

export function AiJobsStatusChartCard() {
    const [series, setSeries] = useState<Row[]>([])
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    useEffect(() => {
        let alive = true
        ;(async () => {
            setLoading(true)
            setErr(null)
            try {
                const res = await apiFetch<{ series: Row[] }>("/api/analytics/ai-jobs-30d")
                if (!alive) return
                setSeries(res.series)
            } catch (e: unknown) {
                if (!alive) return
                setErr(getErrorMessage(e))
            } finally {
                if (alive) setLoading(false)
            }
        })()
        return () => {
            alive = false
        }
    }, [])

    return (
        <SectionCard title="AI Jobs by status (30 days)">
            {loading ? (
                <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>Loading…</div>
            ) : err ? (
                <div className="text-sm" style={{ color: "rgb(var(--danger))" }}>{err}</div>
            ) : (
                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={series}>
                            <CartesianGrid stroke="rgba(148,163,184,0.25)" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="Completed" stackId="1" stroke="rgb(var(--success))" fill="rgba(52,211,153,0.25)" />
                            <Area type="monotone" dataKey="Running" stackId="1" stroke="rgb(var(--info))" fill="rgba(96,165,250,0.25)" />
                            <Area type="monotone" dataKey="Queued" stackId="1" stroke="rgb(var(--brand))" fill="rgba(129,140,248,0.22)" />
                            <Area type="monotone" dataKey="Paused" stackId="1" stroke="rgb(var(--warn))" fill="rgba(251,191,36,0.22)" />
                            <Area type="monotone" dataKey="Failed" stackId="1" stroke="rgb(var(--danger))" fill="rgba(248,113,113,0.22)" />
                            <Area type="monotone" dataKey="Canceled" stackId="1" stroke="rgb(var(--muted))" fill="rgba(148,163,184,0.12)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </SectionCard>
    )
}
