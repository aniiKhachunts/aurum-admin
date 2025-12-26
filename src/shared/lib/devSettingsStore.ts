import { create } from "zustand"
import { persist } from "zustand/middleware"

type DevSettings = {
    enabled: boolean
    minDelayMs: number
    maxDelayMs: number
    errorRate: number
    forceNextError: boolean
    setEnabled: (v: boolean) => void
    setMinDelayMs: (v: number) => void
    setMaxDelayMs: (v: number) => void
    setErrorRate: (v: number) => void
    triggerForceNextError: () => void
    consumeForceNextError: () => boolean
    reset: () => void
}

export const useDevSettingsStore = create<DevSettings>()(
    persist(
        (set, get) => ({
            enabled: true,
            minDelayMs: 350,
            maxDelayMs: 900,
            errorRate: 0.08,
            forceNextError: false,

            setEnabled: (v) => set({ enabled: v }),
            setMinDelayMs: (v) => set({ minDelayMs: v }),
            setMaxDelayMs: (v) => set({ maxDelayMs: v }),
            setErrorRate: (v) => set({ errorRate: v }),
            triggerForceNextError: () => set({ forceNextError: true }),
            consumeForceNextError: () => {
                const v = get().forceNextError
                if (v) set({ forceNextError: false })
                return v
            },
            reset: () =>
                set({
                    enabled: true,
                    minDelayMs: 350,
                    maxDelayMs: 900,
                    errorRate: 0.08,
                    forceNextError: false,
                }),
        }),
        { name: "aurum_dev_settings_v1" }
    )
)
