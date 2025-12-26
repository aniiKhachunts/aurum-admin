import {useCallback, useEffect, useState} from "react"
import {DataTableState} from "./DataTable/DataTableStates"
import {apiFetch} from "../lib/apiClient"
import {getErrorMessage} from "../lib/getErrorMessage.ts";

type AuditEvent = {
    id: string
    createdAt: string
    actorId: string
    actorRole: string
    action: string
    entityType: string
    entityId: string
    meta?: Record<string, unknown>
}

type Props = {
    entityType: string
    entityId: string
    title?: string
}

export function AuditLogPanel({entityType, entityId, title}: Props) {
    const [items, setItems] = useState<AuditEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState<string | null>(null)

    const load = useCallback(async () => {
        setLoading(true)
        setErr(null)
        try {
            const q = new URLSearchParams()
            q.set("entityType", entityType)
            q.set("entityId", entityId)
            const res = await apiFetch<{ items: AuditEvent[] }>(`/api/audit/events?${q.toString()}`)
            setItems(res.items)
        } catch (e: unknown) {
            setErr(getErrorMessage(e) || "Error")
        } finally {
            setLoading(false)
        }
    }, [entityType, entityId])

    useEffect(() => {
        load()
    }, [load])

    return (
        <div
            className="rounded-2xl p-4"
            style={{background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))", boxShadow: "var(--sh-sm)"}}
        >
            <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">{title || "Audit log"}</div>
                <button
                    className="rounded-xl px-3 py-2 text-xs font-medium"
                    style={{border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))"}}
                    onClick={load}
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <DataTableState kind="loading" label="Loading events…"/>
            ) : err ? (
                <DataTableState kind="error" message={err} onRetry={load}/>
            ) : items.length === 0 ? (
                <DataTableState kind="empty" title="No events" subtitle="No audit events recorded for this entity."/>
            ) : (
                <div className="space-y-3">
                    {items.map((e) => (
                        <div
                            key={e.id}
                            className="rounded-xl p-3"
                            style={{background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))"}}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-xs font-semibold">{e.action}</div>
                                <div className="text-[11px]" style={{color: "rgb(var(--muted))"}}>
                                    {new Date(e.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="mt-1 text-xs" style={{color: "rgb(var(--muted))"}}>
                                Actor: <span style={{color: "rgb(var(--text))"}}>{e.actorRole}</span> · {e.actorId}
                            </div>
                            <div className="mt-1 text-[11px]" style={{color: "rgb(var(--muted))"}}>
                                {e.entityType} · {e.entityId}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
