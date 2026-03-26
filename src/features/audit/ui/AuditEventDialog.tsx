import {useEffect, useMemo, useRef, useState} from "react";
import type { AuditEventDto as AuditEvent } from "../api/auditApi";
import {toast} from "../../../shared/ui/Toast/toast.ts";

type Props = {
    open: boolean
    onClose: () => void
    item: AuditEvent | null
}

function safeJson(v: unknown) {
    try {
        return JSON.stringify(v ?? null, null, 2)
    } catch {
        return String(v ?? "")
    }
}

async function copyText(text: string, label?: string) {
    try {
        await navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard", label)
    } catch {
        toast.error("Copy failed")
    }
}

function formatTime(v: string) {
    const d = new Date(v)
    if (Number.isNaN(+d)) return v
    return d.toLocaleString()
}

export function AuditEventDialog({ open, onClose, item }: Props) {
    const ref = useRef<HTMLDialogElement | null>(null)

    useEffect(() => {
        const d = ref.current
        if (!d) return
        if (open && !d.open) d.showModal()
        if (!open && d.open) d.close()
    }, [open])

    useEffect(() => {
        const d = ref.current
        if (!d) return
        const onCancel = (e: Event) => {
            e.preventDefault()
            onClose()
        }
        d.addEventListener("cancel", onCancel)
        return () => d.removeEventListener("cancel", onCancel)
    }, [onClose])

    const metaPretty = useMemo(() => safeJson((item as any)?.meta), [item])
    const fullPretty = useMemo(() => safeJson(item), [item])

    const [copied, setCopied] = useState<string | null>(null)

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            style={{
                position: "fixed",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                margin: 0,
                border: "1px solid rgb(var(--border))",
                borderRadius: 18,
                padding: 0,
                background: "rgb(var(--panel))",
                boxShadow: "var(--sh-lg)",
                maxHeight: "min(720px, calc(100vh - 64px))",
            }}
        >
            <style>{`
        dialog::backdrop {
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(6px);
        }
      `}</style>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "min(720px, calc(100vh - 64px))",
                }}
            >
                <div
                    style={{
                        padding: 16,
                        borderBottom: "1px solid rgb(var(--border))",
                        background: "rgb(var(--panel-2))",
                    }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold">Audit event</div>
                            <div className="mt-1 text-xs" style={{ color: "rgb(var(--muted))" }}>
                                {item?.id || "-"}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="rounded-xl px-3 py-2 text-xs font-medium"
                                style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel))" }}
                                onClick={async () => {
                                    await copyText(fullPretty, "JSON")
                                    setCopied("json")
                                    setTimeout(() => setCopied(null), 1200)
                                }}
                                disabled={!item}
                            >
                                {copied === "json" ? "Copied ✓" : "Copy JSON"}
                            </button>

                            <button
                                className="rounded-xl px-3 py-2 text-sm font-medium"
                                style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel))" }}
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ padding: 16, overflow: "auto" }}>
                    {!item ? (
                        <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>
                            No event selected
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div
                                style={{
                                    border: "1px solid rgb(var(--border))",
                                    background: "rgb(var(--panel))",
                                    borderRadius: 16,
                                    padding: 14,
                                }}
                            >
                                <div className="grid gap-3" style={{ gridTemplateColumns: "140px 1fr" }}>
                                    <div className="text-xs font-semibold" style={{ color: "rgb(var(--muted))" }}>
                                        Time
                                    </div>
                                    <div className="text-sm">{formatTime(item.createdAt)}</div>

                                    <div className="text-xs font-semibold" style={{ color: "rgb(var(--muted))" }}>
                                        Action
                                    </div>
                                    <div className="text-sm">{item.action}</div>

                                    <div className="text-xs font-semibold" style={{ color: "rgb(var(--muted))" }}>
                                        Entity
                                    </div>
                                    <div className="text-sm">
                                        {item.entityType} · {item.entityId}
                                    </div>

                                    <div className="text-xs font-semibold" style={{ color: "rgb(var(--muted))" }}>
                                        Actor
                                    </div>
                                    <div className="text-sm">
                                        {item.actorRole} · {(item as any)?.actorId ?? "—"}
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        className="rounded-xl px-3 py-2 text-xs font-medium"
                                        style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))" }}
                                        onClick={async () => {
                                            if (item.entityId) {
                                                await copyText(item.entityId, "Entity ID")
                                            }
                                            setCopied("event")
                                            setTimeout(() => setCopied(null), 1200)
                                        }}
                                    >
                                        {copied === "event" ? "Copied ✓" : "Copy event id"}
                                    </button>

                                    <button
                                        className="rounded-xl px-3 py-2 text-xs font-medium"
                                        style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))" }}
                                        onClick={async () => {
                                            if (item.entityId) {
                                                await copyText(item.entityId, "Entity ID")
                                            }
                                            setCopied("entity")
                                            setTimeout(() => setCopied(null), 1200)
                                        }}
                                    >
                                        {copied === "entity" ? "Copied ✓" : "Copy entity id"}
                                    </button>

                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold" style={{ color: "rgb(var(--muted))" }}>
                                    Meta
                                </div>
                                <pre
                                    className="mt-2 text-xs"
                                    style={{
                                        background: "rgb(var(--panel-2))",
                                        border: "1px solid rgb(var(--border))",
                                        borderRadius: 14,
                                        padding: 12,
                                        overflow: "auto",
                                        maxHeight: 320,
                                    }}
                                >
                  {metaPretty}
                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </dialog>
    )
}
