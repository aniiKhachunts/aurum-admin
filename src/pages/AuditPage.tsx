import { useCallback, useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Link, useNavigate } from "react-router-dom"
import { PageHeader } from "../shared/ui/PageHeader"
import { SectionCard } from "../shared/ui/SectionCard"
import { DataTable } from "../shared/ui/DataTable/DataTable"
import { DataTableState } from "../shared/ui/DataTable/DataTableStates"
import { DataTableToolbar } from "../shared/ui/DataTable/DataTableToolbar"
import { getAuditEvents, type AuditEvent } from "../features/audit/api/auditApi"
import { getAuditEntityHref } from "../features/audit/lib/auditLinks"
import { AuditEventDialog } from "../features/audit/ui/AuditEventDialog"
import { getErrorMessage } from "../shared/lib/getErrorMessage"

function uniqSorted(arr: string[]) {
    return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function titleizeAction(a: string) {
    const map: Record<string, string> = {
        "users.invite": "Users · Invite",
        "users.update": "Users · Update",
        "users.suspend": "Users · Suspend",
        "users.deactivate": "Users · Deactivate",
        "transactions.refund": "Transactions · Refund",
        "ai_jobs.start": "AI Jobs · Start",
        "ai_jobs.pause": "AI Jobs · Pause",
        "ai_jobs.cancel": "AI Jobs · Cancel",
        "settings.update": "Settings · Update",
    }
    return map[a] || a
}

function titleizeEntityType(t: string) {
    const map: Record<string, string> = {
        user: "User",
        transaction: "Transaction",
        ai_job: "AI Job",
        settings: "Settings",
        org: "Org",
    }
    return map[t] || t
}

export default function AuditPage() {
    const [items, setItems] = useState<AuditEvent[]>([])
    const [catalog, setCatalog] = useState<AuditEvent[]>([])
    const [entityType, setEntityType] = useState("")
    const [action, setAction] = useState("")
    const [q, setQ] = useState("")
    const [loading, setLoading] = useState(false)
    const [catalogLoading, setCatalogLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [selected, setSelected] = useState<AuditEvent | null>(null)

    const navigate = useNavigate()

    const loadCatalog = useCallback(async () => {
        setCatalogLoading(true)
        try {
            const res = await getAuditEvents({ entityType: "", action: "", q: "", limit: 300 })
            setCatalog(res.items)
        } finally {
            setCatalogLoading(false)
        }
    }, [])

    const loadData = useCallback(async () => {
        setLoading(true)
        setErr(null)
        try {
            const res = await getAuditEvents({ entityType, action, q, limit: 150 })
            setItems(res.items)
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
        } finally {
            setLoading(false)
        }
    }, [entityType, action, q])

    useEffect(() => {
        loadCatalog()
        loadData()
    }, [loadCatalog, loadData])

    const entityTypeOptions = useMemo(() => {
        const filtered = action ? catalog.filter((x) => String(x.action) === action) : catalog
        const types = uniqSorted(filtered.map((x) => String(x.entityType || "")))
        return [{ label: "Any", value: "" }, ...types.map((t) => ({ label: titleizeEntityType(t), value: t }))]
    }, [catalog, action])

    const actionOptions = useMemo(() => {
        const filtered = entityType ? catalog.filter((x) => String(x.entityType) === entityType) : catalog
        const actions = uniqSorted(filtered.map((x) => String(x.action || "")))
        return [{ label: "Any", value: "" }, ...actions.map((a) => ({ label: titleizeAction(a), value: a }))]
    }, [catalog, entityType])

    useEffect(() => {
        if (!entityType) return
        const ok = entityTypeOptions.some((o) => o.value === entityType)
        if (!ok) setEntityType("")
    }, [entityType, entityTypeOptions])

    useEffect(() => {
        if (!action) return
        const ok = actionOptions.some((o) => o.value === action)
        if (!ok) setAction("")
    }, [action, actionOptions])

    const columns = useMemo<ColumnDef<AuditEvent, unknown>[]>(
        () => [
            {
                header: "",
                id: "details",
                cell: (ctx) => {
                    const e = ctx.row.original
                    return (
                        <button
                            className="rounded-xl px-3 py-2 text-xs font-medium"
                            style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel))" }}
                            onClick={(ev) => {
                                ev.stopPropagation()
                                setSelected(e)
                                setDetailsOpen(true)
                            }}
                        >
                            Details
                        </button>
                    )
                },
            },
            {
                header: "Entity id",
                accessorKey: "entityId",
                cell: (ctx) => {
                    const e = ctx.row.original
                    const value = String(ctx.getValue() ?? "")
                    const href = getAuditEntityHref(String(e.entityType), String(e.entityId))
                    if (!href) return <span>{value}</span>

                    return (
                        <Link
                            to={href}
                            className="font-medium underline underline-offset-4"
                            onClick={(ev) => ev.stopPropagation()}
                        >
                            {value}
                        </Link>
                    )
                },
            },
            {
                header: "Time",
                accessorKey: "createdAt",
                cell: (ctx) => new Date(String(ctx.getValue() ?? "")).toLocaleString(),
            },
            { header: "Action", accessorKey: "action" },
            { header: "Entity type", accessorKey: "entityType" },
            { header: "Actor role", accessorKey: "actorRole" },
            { header: "Actor id", accessorKey: "actorId" },
        ],
        []
    )

    const showBusy = loading || catalogLoading

    return (
        <div className="space-y-4">
            <PageHeader title="Audit" subtitle="System-wide activity and traceability." />

            <SectionCard>
                <DataTableToolbar
                    search={{
                        value: q,
                        onChange: setQ,
                        placeholder: "Search id / entity id / role / action…",
                    }}
                    filters={[
                        {
                            key: "entityType",
                            label: "Entity type",
                            value: entityType,
                            onChange: setEntityType,
                            options: entityTypeOptions,
                        },
                        {
                            key: "action",
                            label: "Action",
                            value: action,
                            onChange: setAction,
                            options: actionOptions,
                        },
                    ]}
                    right={
                        <button
                            className="rounded-xl px-3 py-2 text-sm font-medium"
                            style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))" }}
                            onClick={() => {
                                loadCatalog()
                                loadData()
                            }}
                        >
                            Refresh
                        </button>
                    }
                />

                {showBusy ? (
                    <DataTableState kind="loading" />
                ) : err ? (
                    <DataTableState kind="error" message={err} onRetry={loadData} />
                ) : items.length === 0 ? (
                    <DataTableState kind="empty" title="No events" subtitle="Try clearing filters." />
                ) : (
                    <DataTable
                        columns={columns}
                        data={items}
                        onRowClick={(row) => {
                            const href = getAuditEntityHref(String(row.entityType), String(row.entityId))
                            if (href) navigate(href)
                        }}
                    />
                )}
            </SectionCard>

            <AuditEventDialog open={detailsOpen} item={selected} onClose={() => setDetailsOpen(false)} />
        </div>
    )
}
