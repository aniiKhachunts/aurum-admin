import { useEffect, useMemo, useState } from "react"

type Props = {
    open: boolean
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
    requireText?: string
    onConfirm: () => void
    onClose: () => void
    busy?: boolean
}

export function ConfirmDialog({
                                  open,
                                  title,
                                  description,
                                  confirmText = "Confirm",
                                  cancelText = "Cancel",
                                  danger,
                                  requireText,
                                  onConfirm,
                                  onClose,
                                  busy,
                              }: Props) {
    const [typed, setTyped] = useState("")

    useEffect(() => {
        if (!open) setTyped("")
    }, [open])

    useEffect(() => {
        if (!open) return

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault()
                if (!busy) onConfirm()
            }
        }

        window.addEventListener("keydown", handleKey)

        return () => {
            window.removeEventListener("keydown", handleKey)
        }
    }, [open, busy, onConfirm])

    const canConfirm = useMemo(() => {
        if (busy) return false
        if (!requireText) return true
        return typed.trim() === requireText
    }, [typed, requireText, busy])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} onClick={onClose} />
            <div
                className="relative w-full max-w-[520px] rounded-2xl p-5"
                style={{
                    background: "rgb(var(--panel))",
                    border: "1px solid rgb(var(--border))",
                    boxShadow: "var(--sh-lg)",
                }}
            >
                <div className="text-base font-semibold">{title}</div>

                {description ? (
                    <div className="mt-2 text-sm" style={{ color: "rgb(var(--muted))" }}>
                        {description}
                    </div>
                ) : null}

                {requireText ? (
                    <div className="mt-4">
                        <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
                            Type <span className="font-semibold">{requireText}</span> to confirm.
                        </div>
                        <input
                            className="mt-2 w-full rounded-xl px-3 py-2 text-sm"
                            style={{
                                border: "1px solid rgb(var(--border))",
                                background: "rgb(var(--panel-2))",
                                outline: "none",
                            }}
                            value={typed}
                            onChange={(e) => setTyped(e.target.value)}
                            placeholder={requireText}
                        />
                    </div>
                ) : null}

                <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                        className="rounded-xl px-3 py-2 text-sm"
                        style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))", opacity: busy ? 0.7 : 1 }}
                        disabled={busy}
                        onClick={onClose}
                    >
                        {cancelText}
                    </button>

                    <button
                        className="rounded-xl px-3 py-2 text-sm font-medium"
                        style={{
                            background: danger ? "rgb(var(--danger))" : "rgb(var(--brand))",
                            color: "white",
                            opacity: canConfirm ? 1 : 0.6,
                        }}
                        disabled={!canConfirm}
                        onClick={onConfirm}
                    >
                        {busy ? "Working…" : confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
