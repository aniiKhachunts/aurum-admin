import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { SectionCard } from "../SectionCard"
import { apiFetch } from "../../lib/apiClient"
import { getErrorMessage } from "../../lib/getErrorMessage"

type Row = { date: string; revenueUsd: number; refundsUsd: number; txCount: number }

export function RevenueChartCard() {
    const [series, setSeries] = useState<Row[]>([])
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    useEffect(() => {
        let alive = true
        ;(async () => {
            setLoading(true)
            setErr(null)
            try {
                const res = await apiFetch<{ series: Row[] }>("/api/analytics/revenue-30d")
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
        <SectionCard title="Revenue (30 days)">
            {loading ? (
                <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>Loading…</div>
            ) : err ? (
                <div className="text-sm" style={{ color: "rgb(var(--danger))" }}>{err}</div>
            ) : (
                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={series}>
                            <CartesianGrid stroke="rgba(148,163,184,0.25)" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="revenueUsd" stroke="rgb(var(--brand))" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="refundsUsd" stroke="rgb(var(--danger))" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </SectionCard>
    )
}
