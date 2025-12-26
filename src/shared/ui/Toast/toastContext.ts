import { createContext, useContext } from "react"
import type { ToastKind } from "./types"

export type PushArgs = {
    kind: ToastKind
    message: string
    title?: string
    durationMs?: number
}

export type ToastCtx = {
    push: (t: PushArgs) => void
    dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastCtx | null>(null)

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToast must be used within ToastProvider")
    return ctx
}
