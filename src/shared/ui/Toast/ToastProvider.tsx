import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import type { ToastItem, ToastKind } from "./types"

type PushArgs = {
    kind: ToastKind
    message: string
    title?: string
    durationMs?: number
}

type ToastCtx = {
    push: (t: PushArgs) => void
    dismiss: (id: string) => void
}

const Ctx = createContext<ToastCtx | null>(null)

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
        const item: ToastItem = { id, kind: t.kind, title: t.title, message: t.message, durationMs }
        setToasts((prev) => [item, ...prev].slice(0, 5))
        const timer = window.setTimeout(() => dismiss(id), durationMs)
        timers.current.set(id, timer)
    }, [dismiss])

    const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

    return (
        <Ctx.Provider value={value}>
            {children}
            <div className="fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
                {toasts.map((t) => (
                    <div key={t.id} className="rounded-2xl border bg-background p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
                                <div className="text-sm opacity-80">{t.message}</div>
                            </div>
                            <button className="h-8 w-8 rounded-xl border text-sm" onClick={() => dismiss(t.id)} type="button">
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
        </Ctx.Provider>
    )
}

export function useToast() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error("useToast must be used within ToastProvider")
    return ctx
}
