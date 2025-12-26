import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { PageHeader } from "../shared/ui/PageHeader"
import { SectionCard } from "../shared/ui/SectionCard"
import {StatusPill, type StatusTone} from "../shared/ui/StatusPill"
import { DataTableState } from "../shared/ui/DataTable/DataTableStates"
import { FormField } from "../shared/ui/FormField"
import { Can } from "../shared/ui/Can"
import { useSessionStore } from "../shared/lib/sessionStore"
import { deactivateUser, getUser, suspendUser, updateUser, type UserDetail } from "../features/users/api/userDetailApi"
import { WriteGuard } from "../shared/ui/WriteGuard"
import { toast } from "../shared/ui/Toast/toast"
import { formatApiError } from "../shared/lib/formatApiError"
import { ConfirmDialog } from "../shared/ui/ConfirmDialog"
import {getErrorMessage} from "../shared/lib/getErrorMessage.ts";

function statusTone(status: string): StatusTone {
    if (status === "active") return "success"
    if (status === "invited") return "info"
    if (status === "suspended") return "warn"
    if (status === "deactivated") return "danger"
    return "neutral"
}

function inputStyle() {
    return {
        background: "rgb(var(--panel))",
        border: "1px solid rgb(var(--border))",
        borderRadius: "12px",
        outline: "none",
    } as React.CSSProperties
}

export default function UserDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const role = useSessionStore((s) => s.role)

    const [item, setItem] = useState<UserDetail | null>(null)
    const [draft, setDraft] = useState<UserDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [acting, setActing] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [editMode, setEditMode] = useState(false)

    const [confirmDeactivate, setConfirmDeactivate] = useState(false)

    const dirty = useMemo(() => {
        if (!item || !draft) return false
        return item.name !== draft.name || item.role !== draft.role || JSON.stringify(item.tags) !== JSON.stringify(draft.tags)
    }, [item, draft])

    const load = useCallback(async () => {
        if (!id) {
            setErr("Invalid user id")
            setLoading(false)
            return
        }

        setLoading(true)
        setErr(null)
        try {
            const res = await getUser(id)
            setItem(res.item)
            setDraft(res.item)
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        load()
    }, [load])

    async function onSave() {
        if (!id || !draft) return
        setSaving(true)
        setErr(null)
        try {
            const res = await updateUser(id, { name: draft.name, role: draft.role, tags: draft.tags })
            setItem(res.item)
            setDraft(res.item)
            setEditMode(false)
            toast.success("User updated", id)
        } catch (e: unknown) {
            const msg = formatApiError(e)
            setErr(msg)
            toast.error("Update failed", msg)
        } finally {
            setSaving(false)
        }
    }

    function onCancel() {
        setDraft(item)
        setEditMode(false)
    }

    async function onSuspend() {
        if (!id) return
        setActing(true)
        setErr(null)
        try {
            const res = await suspendUser(id)
            setItem(res.item)
            setDraft(res.item)
            setEditMode(false)
            toast.success("User suspended", id)
        } catch (e: unknown) {
            const msg = formatApiError(e)
            setErr(msg)
            toast.error("Suspend failed", msg)
        } finally {
            setActing(false)
        }
    }

    async function onDeactivate() {
        if (!id) return
        setActing(true)
        setErr(null)
        try {
            const res = await deactivateUser(id)
            setItem(res.item)
            setDraft(res.item)
            setEditMode(false)
            toast.success("User deactivated", id)
        } catch (e: unknown) {
            const msg = formatApiError(e)
            setErr(msg)
            toast.error("Deactivate failed", msg)
        } finally {
            setActing(false)
        }
    }

    if (loading) return <DataTableState kind="loading" label="Loading user…" />
    if (err) return <DataTableState kind="error" message={err} onRetry={load} />
    if (!item || !draft) return <DataTableState kind="empty" title="User not found" />

    return (
        <div className="space-y-4">
            <PageHeader
                title={item.name}
                subtitle={item.email}
                actions={
                    <div className="flex items-center gap-2">
                        <StatusPill label={item.status} tone={statusTone(item.status)} />

                        <button
                            className="rounded-xl px-3 py-2 text-sm"
                            style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel))" }}
                            onClick={() => navigate("/users")}
                        >
                            Back
                        </button>

                        <Can permission="users:write" mode="disable" reason="You don’t have permission to edit users">
                            <WriteGuard reason="Maintenance mode: write actions are disabled">
                                <button
                                    className="rounded-xl px-3 py-2 text-sm font-medium"
                                    style={{
                                        background: editMode ? "rgb(var(--panel-2))" : "rgb(var(--brand))",
                                        color: editMode ? "rgb(var(--text))" : "white",
                                        border: editMode ? "1px solid rgb(var(--border))" : "1px solid transparent",
                                        opacity: saving ? 0.7 : 1,
                                    }}
                                    disabled={saving}
                                    onClick={() => setEditMode((v) => !v)}
                                >
                                    {editMode ? "Exit edit" : "Edit"}
                                </button>
                            </WriteGuard>
                        </Can>
                    </div>
                }
            />

            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <SectionCard title="Profile" description="Basic identity & assignment">
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Name">
                            <input
                                className="w-full px-3 py-2 text-sm"
                                style={inputStyle()}
                                disabled={!editMode}
                                value={draft.name}
                                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            />
                        </FormField>

                        <FormField label="Role" hint="Controls access across the panel">
                            <select
                                className="w-full px-3 py-2 text-sm"
                                style={inputStyle()}
                                disabled={!editMode}
                                value={draft.role}
                                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                            >
                                <option value="owner">owner</option>
                                <option value="admin">admin</option>
                                <option value="analyst">analyst</option>
                                <option value="support">support</option>
                                <option value="viewer">viewer</option>
                            </select>
                        </FormField>

                        <FormField label="Org">
                            <input className="w-full px-3 py-2 text-sm" style={inputStyle()} disabled value={draft.orgId} />
                        </FormField>

                        <FormField label="User ID">
                            <input className="w-full px-3 py-2 text-sm" style={inputStyle()} disabled value={draft.id} />
                        </FormField>
                    </div>

                    {editMode ? (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
                                {dirty ? "Unsaved changes" : "No changes"}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="rounded-xl px-3 py-2 text-sm"
                                    style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel))" }}
                                    onClick={onCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="rounded-xl px-3 py-2 text-sm font-medium"
                                    style={{ background: "rgb(var(--brand))", color: "white", opacity: !dirty || saving ? 0.6 : 1 }}
                                    disabled={!dirty || saving}
                                    onClick={onSave}
                                >
                                    {saving ? "Saving…" : "Save"}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </SectionCard>

                <SectionCard title="Actions" description="High-impact operations (permission-gated)">
                    <div className="space-y-3">
                        <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
                            Signed in as: <span style={{ color: "rgb(var(--text))" }}>{role}</span>
                        </div>

                        <Can permission="users:write" mode="disable" reason="You don’t have permission to suspend users">
                            <WriteGuard reason="Maintenance mode: write actions are disabled">
                                <button
                                    className="w-full rounded-xl px-3 py-2 text-sm font-medium"
                                    style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel))", opacity: acting ? 0.7 : 1 }}
                                    disabled={acting}
                                    onClick={onSuspend}
                                >
                                    Suspend user
                                </button>
                            </WriteGuard>
                        </Can>

                        <Can permission="users:deactivate" mode="disable" reason="Only privileged roles can deactivate users">
                            <WriteGuard reason="Maintenance mode: write actions are disabled">
                                <button
                                    className="w-full rounded-xl px-3 py-2 text-sm font-medium"
                                    style={{ background: "rgb(var(--danger))", color: "white", opacity: acting ? 0.7 : 1 }}
                                    disabled={acting}
                                    onClick={() => setConfirmDeactivate(true)}
                                >
                                    Deactivate user
                                </button>
                            </WriteGuard>
                        </Can>

                        <div className="text-[11px]" style={{ color: "rgb(var(--muted))" }}>
                            Use Role Switcher in the top bar to verify gating.
                        </div>
                    </div>
                </SectionCard>
            </div>

            <ConfirmDialog
                open={confirmDeactivate}
                title="Deactivate this user?"
                description={`This will deactivate ${item.name} (${item.id}). This action is high impact.`}
                confirmText="Deactivate"
                cancelText="Cancel"
                danger
                requireText={item.id}
                busy={acting}
                onClose={() => setConfirmDeactivate(false)}
                onConfirm={async () => {
                    await onDeactivate()
                    setConfirmDeactivate(false)
                }}
            />
        </div>
    )
}
