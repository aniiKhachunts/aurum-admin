import { useCallback, useMemo, useRef, useState } from "react"
import type { ToastItem } from "./types"
import { ToastContext, type ToastCtx, type PushArgs } from "./toastContext"

function uid() {
    return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const timers = useRef(new Map<string, number>())

    const dismiss = useCallback((id: string) => {
        const t = timers.current.get(id)
        if (t) window.clearTimeout(t)
        timers.current.delete(id)
        setToasts((prev) => prev.filter((x) => x.id !== id))
    }, [])

    const push = useCallback((t: PushArgs) => {
        const id = uid()
        const durationMs = t.durationMs ?? 3500
        const item: ToastItem = { id, ...t, durationMs }
        setToasts((prev) => [item, ...prev].slice(0, 5))
        timers.current.set(id, window.setTimeout(() => dismiss(id), durationMs))
    }, [dismiss])

    const value = useMemo<ToastCtx>(() => ({ push, dismiss }), [push, dismiss])

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
                {toasts.map((t) => (
                    <div key={t.id} className="rounded-2xl border bg-background p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
                                <div className="text-sm opacity-80">{t.message}</div>
                            </div>
                            <button
                                className="h-8 w-8 rounded-xl border text-sm"
                                onClick={() => dismiss(t.id)}
                                type="button"
                            >
                                ×
                            </button>
                        </div>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/10">
                            <div
                                className="h-full w-full origin-left bg-black/30"
                                style={{ animation: `toastbar ${t.durationMs ?? 3500}ms linear forwards` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <style>{`@keyframes toastbar{from{transform:scaleX(1)}to{transform:scaleX(0)}}`}</style>
        </ToastContext.Provider>
    )
}
