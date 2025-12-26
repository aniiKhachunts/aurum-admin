import {useCallback, useEffect, useMemo, useState} from "react"
import {useNavigate, useParams} from "react-router-dom"
import {PageHeader} from "../shared/ui/PageHeader"
import {SectionCard} from "../shared/ui/SectionCard"
import {DataTableState} from "../shared/ui/DataTable/DataTableStates"
import {ProgressBar} from "../shared/ui/ProgressBar"
import {AuditLogPanel} from "../shared/ui/AuditLogPanel"
import {Can} from "../shared/ui/Can"
import {WriteGuard} from "../shared/ui/WriteGuard"
import {
    getAiJob,
    startAiJob,
    pauseAiJob,
    cancelAiJob,
    type AiJobWithRuns,
    type AiJobRun
} from "../features/ai-jobs/api/aiJobsApi"
import {toast} from "../shared/ui/Toast/toast"
import {formatApiError} from "../shared/lib/formatApiError"
import {ConfirmDialog} from "../shared/ui/ConfirmDialog.tsx";
import {getErrorMessage} from "../shared/lib/getErrorMessage.ts";

export default function AiJobDetailPage() {
    const { id = "" } = useParams()
    const navigate = useNavigate()

    const [item, setItem] = useState<AiJobWithRuns | null>(null)
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState<string | null>(null)
    const [acting, setActing] = useState(false)
    const [confirmCancel, setConfirmCancel] = useState(false)

    const load = useCallback(async () => {
        setLoading(true)
        setErr(null)
        try {
            if (!id) return
            const res = await getAiJob(id)
            setItem(res.item)
        } catch (e: unknown) {
            const msg = formatApiError(e)
            setErr(msg)
            toast.error("Failed to load job", msg)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        load()
    }, [load])

    async function act(kind: "start" | "pause" | "cancel") {
        if (!id) return
        setActing(true)
        setErr(null)

        try {
            const res =
                kind === "start"
                    ? await startAiJob(id)
                    : kind === "pause"
                        ? await pauseAiJob(id)
                        : await cancelAiJob(id)

            setItem(res.item)

            const title =
                kind === "start" ? "Job started" : kind === "pause" ? "Job paused" : "Job canceled"

            toast.success(title, id)
        } catch (e: unknown) {
            const msg = getErrorMessage(e)
            setErr(msg)
            toast.error("Action failed", msg)
        } finally {
            setActing(false)
        }
    }

    const canStart = useMemo(
        () => item && (item.status === "queued" || item.status === "paused" || item.status === "failed"),
        [item]
    )
    const canPause = useMemo(() => item && item.status === "running", [item])
    const canCancel = useMemo(
        () => item && item.status !== "completed" && item.status !== "canceled",
        [item]
    )

    if (loading) return <DataTableState kind="loading" label="Loading job…"/>
    if (err) return <DataTableState kind="error" message={err} onRetry={load}/>
    if (!item) return <DataTableState kind="empty" title="Job not found"/>

    return (
        <div className="space-y-4">
            <PageHeader
                title={item.name}
                subtitle={`${item.dataset} · ${item.model}`}
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            className="rounded-xl px-3 py-2 text-sm"
                            style={{border: "1px solid rgb(var(--border))", background: "rgb(var(--panel))"}}
                            onClick={() => navigate("/ai-jobs")}
                        >
                            Back
                        </button>

                        <Can permission="ai:control" mode="disable" reason="No permission to control AI jobs">
                            <WriteGuard reason="Maintenance mode: write actions are disabled">
                                <button
                                    className="rounded-xl px-3 py-2 text-sm font-medium"
                                    style={{
                                        border: "1px solid rgb(var(--border))",
                                        background: "rgb(var(--panel))",
                                        opacity: !canStart || acting ? 0.5 : 1,
                                    }}
                                    disabled={!canStart || acting}
                                    onClick={() => act("start")}
                                >
                                    Start
                                </button>
                            </WriteGuard>
                        </Can>

                        <Can permission="ai:control" mode="disable" reason="No permission to control AI jobs">
                            <WriteGuard reason="Maintenance mode: write actions are disabled">
                                <button
                                    className="rounded-xl px-3 py-2 text-sm font-medium"
                                    style={{
                                        border: "1px solid rgb(var(--border))",
                                        background: "rgb(var(--panel))",
                                        opacity: !canPause || acting ? 0.5 : 1,
                                    }}
                                    disabled={!canPause || acting}
                                    onClick={() => act("pause")}
                                >
                                    Pause
                                </button>
                            </WriteGuard>
                        </Can>

                        <Can permission="ai:control" mode="disable" reason="No permission to control AI jobs">
                            <WriteGuard reason="Maintenance mode: write actions are disabled">
                                <button
                                    className="rounded-xl px-3 py-2 text-sm font-medium"
                                    style={{
                                        background: "rgb(var(--danger))",
                                        color: "white",
                                        opacity: !canCancel || acting ? 0.6 : 1,
                                    }}
                                    disabled={!canCancel || acting}
                                    onClick={() => setConfirmCancel(true)}
                                >
                                    Cancel
                                </button>
                            </WriteGuard>
                        </Can>
                    </div>
                }
            />

            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                    <SectionCard title="Overview" description="Current status, progress and budgets">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Info label="Status" value={item.status}/>
                            <Info label="Priority" value={item.priority}/>
                            <div>
                                <div className="text-xs" style={{color: "rgb(var(--muted))"}}>Progress</div>
                                <div className="mt-2">
                                    <ProgressBar value={Number(item.progress)}/>
                                </div>
                            </div>
                            <Info label="Cost cap" value={`$${Number(item.costCapUsd).toFixed(0)}`}/>
                            <Info label="Token budget" value={Number(item.tokensBudget).toLocaleString()}/>
                            <Info label="Updated" value={new Date(item.updatedAt).toLocaleString()}/>
                        </div>
                    </SectionCard>

                    <SectionCard title="Runs" description="Execution attempts and outcomes">
                        <div className="space-y-3">
                            {item.runs?.map((r: AiJobRun) => (
                                <div
                                    key={r.id}
                                    className="rounded-xl p-3"
                                    style={{background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))"}}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-semibold">{r.id}</div>
                                        <div className="text-[11px]" style={{color: "rgb(var(--muted))"}}>
                                            {r.outcome || "in_progress"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                <ConfirmDialog
                    open={confirmCancel}
                    title="Cancel this job?"
                    description={item ? `Cancel ${item.name} (${item.id}).` : ""}
                    confirmText="Cancel job"
                    cancelText="Keep running"
                    danger
                    requireText={item?.id}
                    busy={acting}
                    onClose={() => setConfirmCancel(false)}
                    onConfirm={async () => {
                        await act("cancel")
                        setConfirmCancel(false)
                    }}
                />

                <AuditLogPanel entityType="ai_job" entityId={item.id} title="Audit events"/>
            </div>
        </div>
    )
}

function Info({label, value}: { label: string; value: unknown }) {
    return (
        <div>
            <div className="text-xs" style={{color: "rgb(var(--muted))"}}>
                {label}
            </div>
            <div
                className="mt-1 text-sm font-semibold">
                {typeof value === "string" || typeof value === "number" ? value : String(value ?? "")}
            </div>
        </div>
    )
}
