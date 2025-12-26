import { create } from "zustand"

export type ApiMetric = {
    id: string
    ts: number
    method: string
    url: string
    ms: number
    ok: boolean
    status?: number
    error?: string
}

type State = {
    last: ApiMetric[]
    push: (m: ApiMetric) => void
    clear: () => void
}

export const useApiMetricsStore = create<State>((set, get) => ({
    last: [],
    push: (m) => {
        const next = [m, ...get().last].slice(0, 60)
        set({ last: next })
    },
    clear: () => set({ last: [] }),
}))
