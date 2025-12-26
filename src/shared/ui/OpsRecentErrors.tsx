import { useMemo } from "react"
import { useApiMetricsStore } from "../lib/apiMetricsStore"
import { SectionCard } from "./SectionCard"

export function OpsRecentErrors() {
    const last = useApiMetricsStore((s) => s.last)
    const errors = useMemo(() => last.filter((x) => !x.ok).slice(0, 8), [last])

    return (
        <SectionCard title="Recent errors" description="Last failed requests in this session">
            {errors.length === 0 ? (
                <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>
                    No errors so far.
                </div>
            ) : (
                <div className="space-y-2">
                    {errors.map((e) => (
                        <div
                            key={e.id}
                            className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                            style={{ background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))" }}
                        >
                            <div className="min-w-0">
                                <div className="text-sm font-medium">
                                    {e.method} {e.url}
                                </div>
                                <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
                                    {e.error || `HTTP ${e.status}`}
                                </div>
                            </div>
                            <div className="shrink-0 text-[11px]" style={{ color: "rgb(var(--muted))" }}>
                                {e.ms}ms
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SectionCard>
    )
}
