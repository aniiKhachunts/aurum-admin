import { useEffect, useState } from "react"
import { PageHeader } from "../shared/ui/PageHeader"
import { SectionCard } from "../shared/ui/SectionCard"
import { apiFetch } from "../shared/lib/apiClient"
import {getAuditEvents, type AuditEvent} from "../features/audit/api/auditApi.ts";
import {OpsKpis} from "../shared/ui/OpsKpis.tsx";
import {OpsRecentErrors} from "../shared/ui/OpsRecentErrors.tsx";
import {getErrorMessage} from "../shared/lib/getErrorMessage.ts";

export default function DashboardPage() {
    const [count, setCount] = useState<number | null>(null)
    const [err, setErr] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [events, setEvents] = useState<AuditEvent[]>([])
    const [eventsLoading, setEventsLoading] = useState(false)
    const [eventsErr, setEventsErr] = useState<string | null>(null)

    async function load() {
        setLoading(true)
        setErr(null)
        try {
            const res = await apiFetch<{ items: unknown[]; total: number }>("/api/users?page=1&pageSize=10")
            setCount(res.total)
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
        } finally {
            setLoading(false)
        }
    }

    async function loadEvents() {
        setEventsLoading(true)
        setEventsErr(null)
        try {
            const res = await getAuditEvents({ entityType: "", action: "", q: "", limit: 8 })
            setEvents(res.items)
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
        } finally {
            setEventsLoading(false)
        }
    }

    useEffect(() => {
        document.title = "DASHBOARD MOUNTED"
        console.log("DASHBOARD MOUNTED")
        load()
        loadEvents()
    }, [])

    return (
        <div className="space-y-4">
            <PageHeader title="Dashboard" subtitle="Mock API smoke test" />

            <SectionCard title="Users (from /api/users)">
                <div className="flex items-center justify-between">
                    <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>
                        {loading ? "Loading..." : err ? `Error: ${err}` : `Total users: ${count ?? "-"}`}
                    </div>
                    <button
                        className="rounded-xl px-3 py-2 text-sm font-medium"
                        style={{
                            border: "1px solid rgb(var(--border))",
                            background: "rgb(var(--panel-2))",
                        }}
                        onClick={load}
                    >
                        Reload
                    </button>
                </div>
            </SectionCard>

            <SectionCard title="Recent activity">
                {eventsLoading ? (
                    <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>Loading…</div>
                ) : eventsErr ? (
                    <div className="text-sm" style={{ color: "rgb(var(--danger))" }}>{eventsErr}</div>
                ) : events.length === 0 ? (
                    <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>No activity yet.</div>
                ) : (
                    <div className="space-y-2">
                        {events.map((e) => (
                            <div
                                key={e.id}
                                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                                style={{ background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))" }}
                            >
                                <div className="min-w-0">
                                    <div className="text-sm font-medium">
                                        {e.action} · {e.entityType}
                                    </div>
                                    <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
                                        {e.entityId} · {e.actorRole}
                                    </div>
                                </div>
                                <div className="shrink-0 text-[11px]" style={{ color: "rgb(var(--muted))" }}>
                                    {new Date(e.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            <OpsKpis />
            <OpsRecentErrors />

        </div>
    )
}
