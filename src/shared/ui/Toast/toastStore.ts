import { create } from "zustand"

export type ToastKind = "success" | "error" | "info"

export type ToastItem = {
    id: string
    kind: ToastKind
    title: string
    message?: string
    createdAt: number
}

type State = {
    items: ToastItem[]
    push: (t: Omit<ToastItem, "id" | "createdAt">) => string
    remove: (id: string) => void
    clear: () => void
}

export const useToastStore = create<State>((set, get) => ({
    items: [],
    push: (t) => {
        const id = `t_${Date.now()}_${Math.random().toString(16).slice(2)}`
        const item: ToastItem = { id, createdAt: Date.now(), ...t }
        const next = [...get().items, item].slice(-5)
        set({ items: next })
        return id
    },
    remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
    clear: () => set({ items: [] }),
}))
