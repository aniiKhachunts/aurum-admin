export type ToastKind = "success" | "error" | "info"

export type ToastItem = {
    id: string
    kind: ToastKind
    title?: string
    message: string
    durationMs?: number
}
