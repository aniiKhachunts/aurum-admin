import { useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { PageHeader } from "../shared/ui/PageHeader"
import { SectionCard } from "../shared/ui/SectionCard"
import { DataTable } from "../shared/ui/DataTable/DataTable"
import { DataTableState } from "../shared/ui/DataTable/DataTableStates"
import { DataTableToolbar } from "../shared/ui/DataTable/DataTableToolbar"
import { ProgressBar } from "../shared/ui/ProgressBar"
import { Can } from "../shared/ui/Can"
import { getAiJobs, startAiJob, pauseAiJob, cancelAiJob, type AiJob } from "../features/ai-jobs/api/aiJobsApi"
import { WriteGuard } from "../shared/ui/WriteGuard"
import { toast } from "../shared/ui/Toast/toast"
import { formatApiError } from "../shared/lib/formatApiError"
import {ConfirmDialog} from "../shared/ui/ConfirmDialog.tsx";

export default function AiJobsPage() {
    const [items, setItems] = useState<AiJob[]>([])
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [actingId, setActingId] = useState<string | null>(null)
    const [confirmCancel, setConfirmCancel] = useState<AiJob | null>(null)

    async function load() {
        setLoading(true)
        setErr(null)
        try {
            const res = await getAiJobs({ status })
            setItems(res.items)
        } catch (e: any) {
            const msg = formatApiError(e)
            setErr(msg)
            toast.error("Load failed", msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [status])

    async function act(kind: "start" | "pause" | "cancel", id: string) {
        setActingId(id)
        setErr(null)
        try {
            const res =
                kind === "start" ? await startAiJob(id) : kind === "pause" ? await pauseAiJob(id) : await cancelAiJob(id)

            setItems((prev) => prev.map((x) => (x.id === id ? res.item : x)))

            const title = kind === "start" ? "Job started" : kind === "pause" ? "Job paused" : "Job canceled"
            toast.success(title, id)
        } catch (e: any) {
            const msg = formatApiError(e)
            setErr(msg)
            toast.error("Action failed", msg)
        } finally {
            setActingId(null)
        }
    }

    const columns = useMemo<ColumnDef<AiJob, any>[]>(
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
                            <div className="mt-1 text-xs" style={{ color: "rgb(var(--muted))" }}>
                                {j.dataset} · {j.model}
                            </div>
                        </div>
                    )
                },
            },
            { header: "Priority", accessorKey: "priority" },
            { header: "Progress", accessorKey: "progress", cell: (ctx) => <ProgressBar value={Number(ctx.getValue())} /> },
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

    return (
        <div className="space-y-4">
            <PageHeader title="AI Jobs" subtitle="Queue control with audit trail and strict permissions." />

            <SectionCard>
                <DataTableToolbar
                    filters={[
                        {
                            key: "status",
                            label: "Status",
                            value: status,
                            onChange: (v) => setStatus(v),
                            options: [
                                { label: "Queued", value: "queued" },
                                { label: "Running", value: "running" },
                                { label: "Paused", value: "paused" },
                                { label: "Failed", value: "failed" },
                                { label: "Completed", value: "completed" },
                                { label: "Canceled", value: "canceled" },
                            ],
                        },
                    ]}
                    right={
                        <button
                            className="rounded-xl px-3 py-2 text-sm font-medium"
                            style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))" }}
                            onClick={load}
                        >
                            Refresh
                        </button>
                    }
                />

                {loading ? (
                    <DataTableState kind="loading" />
                ) : err ? (
                    <DataTableState kind="error" message={err} onRetry={load} />
                ) : items.length === 0 ? (
                    <DataTableState kind="empty" title="No jobs" subtitle="Try clearing filters." />
                ) : (
                    <DataTable columns={columns} data={items} />
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
