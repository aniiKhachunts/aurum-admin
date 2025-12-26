import {useCallback, useEffect, useMemo, useState} from "react"
import type {ColumnDef, OnChangeFn, SortingState} from "@tanstack/react-table"
import {Link} from "react-router-dom"
import {PageHeader} from "../shared/ui/PageHeader"
import {SectionCard} from "../shared/ui/SectionCard"
import {DataTable} from "../shared/ui/DataTable/DataTable"
import {DataTableState} from "../shared/ui/DataTable/DataTableStates"
import {DataTableToolbar} from "../shared/ui/DataTable/DataTableToolbar"
import {ProgressBar} from "../shared/ui/ProgressBar"
import {Can} from "../shared/ui/Can"
import {getAiJobs, startAiJob, pauseAiJob, cancelAiJob, type AiJob} from "../features/ai-jobs/api/aiJobsApi"
import {WriteGuard} from "../shared/ui/WriteGuard"
import {toast} from "../shared/ui/Toast/toast"
import {formatApiError} from "../shared/lib/formatApiError"
import {ConfirmDialog} from "../shared/ui/ConfirmDialog.tsx";
import {getErrorMessage} from "../shared/lib/getErrorMessage.ts";
import {useTableQueryState} from "../shared/hooks/useTableQueryState.ts";
import {DataTablePagination} from "../shared/ui/DataTable/DataTablePagination.tsx";

export default function AiJobsPage() {
    const [items, setItems] = useState<AiJob[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [actingId, setActingId] = useState<string | null>(null)
    const [confirmCancel, setConfirmCancel] = useState<AiJob | null>(null)

    const {state: qs, write} = useTableQueryState({
        searchKey: "status",
        defaults: {page: 1, pageSize: 20, search: ""}
    })

    const page = qs.page
    const pageSize = qs.pageSize
    const sort = qs.sort as SortingState
    const status = qs.search

    const load = useCallback(async () => {
        setLoading(true)
        setErr(null)
        try {
            const res = await getAiJobs({
                page, pageSize, status, sort
            })
            setItems(res.items)
            setTotal(res.total)
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, status, sort])

    useEffect(() => {
        load()
    }, [load])

    async function act(kind: "start" | "pause" | "cancel", id: string) {
        setActingId(id)
        setErr(null)
        try {
            const res =
                kind === "start" ? await startAiJob(id) : kind === "pause" ? await pauseAiJob(id) : await cancelAiJob(id)

            setItems((prev) => prev.map((x) => (x.id === id ? res.item : x)))

            const title = kind === "start" ? "Job started" : kind === "pause" ? "Job paused" : "Job canceled"
            toast.success(title, id)
        } catch (e: unknown) {
            const msg = formatApiError(e)
            setErr(getErrorMessage(msg))
            toast.error("Action failed", msg)
        } finally {
            setActingId(null)
        }
    }

    const columns = useMemo<ColumnDef<AiJob, unknown>[]>(
        () => [
            {
                header: "Job",
                accessorKey: "name",
                cell: (ctx) => {
                    const j = ctx.row.original
                    return (
                        <div className="min-w-[260px]">
                            <Link to={`/ai-jobs/${j.id}`} className="font-medium underline underline-offset-4">
                                {j.name}
                            </Link>
                            <div className="mt-1 text-xs" style={{color: "rgb(var(--muted))"}}>
                                {j.dataset} · {j.model}
                            </div>
                        </div>
                    )
                },
            },
            {header: "Priority", accessorKey: "priority"},
            {header: "Progress", accessorKey: "progress", cell: (ctx) => <ProgressBar value={Number(ctx.getValue())}/>},
            {
                header: "Status",
                accessorKey: "status",
                cell: (ctx) => {
                    const s = String(ctx.getValue())
                    return (
                        <span
                            className="rounded-full px-2 py-1 text-xs"
                            style={{
                                border: "1px solid rgb(var(--border))",
                                background: "rgb(var(--panel-2))",
                                color: "rgb(var(--text))",
                            }}
                        >
              {s}
            </span>
                    )
                },
            },
            {
                header: "Updated",
                accessorKey: "updatedAt",
                cell: (ctx) => new Date(ctx.getValue() as string).toLocaleDateString(),
            },
            {
                header: "Actions",
                cell: (ctx) => {
                    const j = ctx.row.original
                    const busy = actingId === j.id
                    const canStart = j.status === "queued" || j.status === "paused" || j.status === "failed"
                    const canPause = j.status === "running"
                    const canCancel = j.status !== "completed" && j.status !== "canceled"

                    return (
                        <div className="flex items-center gap-2">
                            <Can permission="ai:control" mode="disable" reason="No permission to control AI jobs">
                                <WriteGuard reason="Maintenance mode: write actions are disabled">
                                    <button
                                        className="rounded-xl px-3 py-2 text-xs font-medium"
                                        style={{
                                            border: "1px solid rgb(var(--border))",
                                            background: "rgb(var(--panel))",
                                            opacity: !canStart || busy ? 0.5 : 1,
                                        }}
                                        disabled={!canStart || busy}
                                        onClick={() => act("start", j.id)}
                                    >
                                        {busy ? "…" : "Start"}
                                    </button>
                                </WriteGuard>
                            </Can>

                            <Can permission="ai:control" mode="disable" reason="No permission to control AI jobs">
                                <WriteGuard reason="Maintenance mode: write actions are disabled">
                                    <button
                                        className="rounded-xl px-3 py-2 text-xs font-medium"
                                        style={{
                                            border: "1px solid rgb(var(--border))",
                                            background: "rgb(var(--panel))",
                                            opacity: !canPause || busy ? 0.5 : 1,
                                        }}
                                        disabled={!canPause || busy}
                                        onClick={() => act("pause", j.id)}
                                    >
                                        Pause
                                    </button>
                                </WriteGuard>
                            </Can>

                            <Can permission="ai:control" mode="disable" reason="No permission to control AI jobs">
                                <WriteGuard reason="Maintenance mode: write actions are disabled">
                                    <button
                                        className="rounded-xl px-3 py-2 text-xs font-medium"
                                        style={{
                                            background: "rgb(var(--danger))",
                                            color: "white",
                                            opacity: !canCancel || busy ? 0.6 : 1,
                                        }}
                                        disabled={!canCancel || busy}
                                        onClick={() => setConfirmCancel(j)}
                                    >
                                        Cancel
                                    </button>
                                </WriteGuard>
                            </Can>
                        </div>
                    )
                },
            },
        ],
        [actingId]
    )

    const onSortingChange: OnChangeFn<SortingState> = (updater) => {
        const next = typeof updater === "function" ? updater(sort) : updater
        write({page: 1, sort: next})
    }

    return (
        <div className="space-y-4">
            <PageHeader title="AI Jobs" subtitle="Queue control with audit trail and strict permissions."/>

            <SectionCard>
                <DataTableToolbar
                    filters={[
                        {
                            key: "status",
                            label: "Status",
                            value: status,
                            onChange: (v) => write({ page: 1, search: v }),
                            options: [
                                {label: "Queued", value: "queued"},
                                {label: "Running", value: "running"},
                                {label: "Paused", value: "paused"},
                                {label: "Failed", value: "failed"},
                                {label: "Completed", value: "completed"},
                                {label: "Canceled", value: "canceled"},
                            ],
                        },
                    ]}
                    right={
                        <button
                            className="rounded-xl px-3 py-2 text-sm font-medium"
                            style={{border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))"}}
                            onClick={load}
                        >
                            Refresh
                        </button>
                    }
                />

                {loading ? (
                    <DataTableState kind="loading"/>
                ) : err ? (
                    <DataTableState kind="error" message={err} onRetry={load}/>
                ) : items.length === 0 ? (
                    <DataTableState kind="empty" title="No jobs" subtitle="Try clearing filters."/>
                ) : (
                    <>
                        <DataTable columns={columns} data={items} sorting={sort} onSortingChange={onSortingChange}/>
                        <DataTablePagination
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={(p) => write({page: p})}
                            onPageSizeChange={(s) => write({page: 1, pageSize: s})}/>
                    </>
                )}
            </SectionCard>

            <ConfirmDialog
                open={Boolean(confirmCancel)}
                title="Cancel this job?"
                description={confirmCancel ? `Cancel ${confirmCancel.name} (${confirmCancel.id}).` : ""}
                confirmText="Cancel job"
                cancelText="Keep running"
                danger
                requireText={confirmCancel ? confirmCancel.id : undefined}
                busy={actingId === confirmCancel?.id}
                onClose={() => setConfirmCancel(null)}
                onConfirm={async () => {
                    if (!confirmCancel) return
                    await act("cancel", confirmCancel.id)
                    setConfirmCancel(null)
                }}
            />

        </div>
    )
}
