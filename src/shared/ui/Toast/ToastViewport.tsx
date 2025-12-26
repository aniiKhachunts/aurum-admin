import { useEffect } from "react"
import { useToastStore } from "./toastStore"

export function ToastViewport() {
    const items = useToastStore((s) => s.items)
    const remove = useToastStore((s) => s.remove)

    useEffect(() => {
        const timers = items.map((t) =>
            window.setTimeout(() => {
                remove(t.id)
            }, 3500)
        )
        return () => timers.forEach((x) => window.clearTimeout(x))
    }, [items, remove])

    return (
        <div className="fixed right-4 top-4 z-[100] flex w-[360px] flex-col gap-2">
            {items.map((t) => (
                <div
                    key={t.id}
                    className="rounded-2xl px-4 py-3"
                    style={{
                        background: "rgb(var(--panel))",
                        border: "1px solid rgb(var(--border))",
                        boxShadow: "var(--sh-lg)",
                    }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                        background:
                            t.kind === "success"
                                ? "rgba(34,197,94,0.9)"
                                : t.kind === "error"
                                    ? "rgba(239,68,68,0.9)"
                                    : "rgba(59,130,246,0.9)",
                    }}
                />
                                <div className="text-sm font-semibold">{t.title}</div>
                            </div>
                            {t.message ? (
                                <div className="mt-1 text-xs" style={{ color: "rgb(var(--muted))" }}>
                                    {t.message}
                                </div>
                            ) : null}
                        </div>

                        <button
                            className="rounded-lg px-2 py-1 text-xs"
                            style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))" }}
                            onClick={() => remove(t.id)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
