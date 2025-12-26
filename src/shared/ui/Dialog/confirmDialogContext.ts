import { createContext, useContext } from "react"

export type ConfirmOptions = {
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    tone?: "default" | "danger"
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

export const ConfirmDialogContext = createContext<ConfirmFn | null>(null)

export function useConfirm() {
    const ctx = useContext(ConfirmDialogContext)
    if (!ctx) throw new Error("useConfirm must be used within ConfirmDialogProvider")
    return ctx
}
