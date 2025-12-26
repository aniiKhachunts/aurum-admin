import { useMemo } from "react"
import { useApiMetricsStore } from "../lib/apiMetricsStore"
import { useSettingsStore } from "../lib/settingsStore"
import { SectionCard } from "./SectionCard"

function kpiBox(title: string, value: string, hint: string) {
    return (
        <div
            className="rounded-2xl p-4"
            style={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))", boxShadow: "var(--sh-sm)" }}
        >
            <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
                {title}
            </div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
            <div className="mt-1 text-xs" style={{ color: "rgb(var(--muted))" }}>
                {hint}
            </div>
        </div>
    )
}

export function OpsKpis() {
    const last = useApiMetricsStore((s) => s.last)
    const settings = useSettingsStore((s) => s.settings)

    const stats = useMemo(() => {
        const slice = last.slice(0, 30)
        const ok = slice.filter((x) => x.ok).length
        const fail = slice.length - ok
        const errorRate = slice.length ? Math.round((fail / slice.length) * 100) : 0
        const avg = slice.length ? Math.round(slice.reduce((a, b) => a + b.ms, 0) / slice.length) : 0
        const p95 = (() => {
            if (!slice.length) return 0
            const arr = slice.map((x) => x.ms).sort((a, b) => a - b)
            const idx = Math.min(arr.length - 1, Math.floor(arr.length * 0.95))
            return arr[idx]
        })()
        return { total: slice.length, ok, fail, errorRate, avg, p95 }
    }, [last])

    const f = settings?.features

    return (
        <SectionCard title="System health" description="Real-time telemetry from API calls in this session">
            <div className="grid gap-3 md:grid-cols-4">
                {kpiBox("Avg latency", `${stats.avg}ms`, "Last 30 requests")}
                {kpiBox("P95 latency", `${stats.p95}ms`, "Tail latency")}
                {kpiBox("Error rate", `${stats.errorRate}%`, `Fails: ${stats.fail}/${stats.total}`)}
                {kpiBox("Maintenance", settings?.maintenanceMode ? "ON" : "OFF", "Read-only mode")}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
                {kpiBox("AI Jobs", f?.aiJobs ? "Enabled" : "Disabled", "Feature flag")}
                {kpiBox("Refunds", f?.refunds ? "Enabled" : "Disabled", "Feature flag")}
                {kpiBox("Audit", f?.audit ? "Enabled" : "Disabled", "Feature flag")}
            </div>
        </SectionCard>
    )
}
