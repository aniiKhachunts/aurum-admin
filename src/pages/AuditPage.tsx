import { useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { PageHeader } from "../shared/ui/PageHeader"
import { SectionCard } from "../shared/ui/SectionCard"
import { DataTable } from "../shared/ui/DataTable/DataTable"
import { DataTableState } from "../shared/ui/DataTable/DataTableStates"
import { DataTableToolbar } from "../shared/ui/DataTable/DataTableToolbar"
import { getAuditEvents, type AuditEvent } from "../features/audit/api/auditApi"
import {getAuditEntityHref} from "../features/audit/lib/auditLinks.ts";
import {Link, useNavigate} from "react-router-dom";
import {AuditEventDialog} from "../features/audit/ui/AuditEventDialog.tsx";

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

    async function loadCatalog() {
        setCatalogLoading(true)
        try {
            const res = await getAuditEvents({ entityType: "", action: "", q: "", limit: 300 })
            setCatalog(res.items)
        } finally {
            setCatalogLoading(false)
        }
    }

    async function loadData() {
        setLoading(true)
        setErr(null)
        try {
            const res = await getAuditEvents({ entityType, action, q, limit: 150 })
            setItems(res.items)
        } catch (e: any) {
            setErr(e?.message || "Error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCatalog()
        loadData()
    }, [])

    useEffect(() => {
        loadData()
    }, [entityType, action, q])

    const entityTypeOptions = useMemo(() => {
        const types = uniqSorted(catalog.map((x) => String(x.entityType || "")))
        return [{ label: "Any", value: "" }, ...types.map((t) => ({ label: titleizeEntityType(t), value: t }))]
    }, [catalog])

    const actionOptions = useMemo(() => {
        const actions = uniqSorted(catalog.map((x) => String(x.action || "")))
        return [{ label: "Any", value: "" }, ...actions.map((a) => ({ label: titleizeAction(a), value: a }))]
    }, [catalog])

    const columns = useMemo<ColumnDef<AuditEvent, any>[]>(
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
                    const href = getAuditEntityHref(String(e.entityType), String(e.entityId))
                    if (!href) return <span>{String(ctx.getValue() ?? "")}</span>

                    return (
                        <Link
                            to={href}
                            className="font-medium underline underline-offset-4"
                            onClick={(ev) => ev.stopPropagation()}
                        >
                            {String(ctx.getValue() ?? "")}
                        </Link>
                    )
                },
            },
            {
                header: "Time",
                accessorKey: "createdAt",
                cell: (ctx) => new Date(ctx.getValue() as string).toLocaleString(),
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
                        onChange: (v) => setQ(v),
                        placeholder: "Search actor id / entity id / role / action…",
                    }}
                    filters={[
                        {
                            key: "entityType",
                            label: "Entity type",
                            value: entityType,
                            onChange: (v) => setEntityType(v),
                            options: entityTypeOptions as any,
                        },
                        {
                            key: "action",
                            label: "Action",
                            value: action,
                            onChange: (v) => setAction(v),
                            options: actionOptions as any,
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
