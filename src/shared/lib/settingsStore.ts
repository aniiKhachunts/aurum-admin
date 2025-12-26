import { create } from "zustand"
import { getSettings, type AppSettings } from "../../features/settings/api/settingsApi"

type SettingsState = {
    loaded: boolean
    loading: boolean
    error: string | null
    settings: AppSettings | null
    load: () => Promise<void>
    setSettings: (s: AppSettings) => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    loaded: false,
    loading: false,
    error: null,
    settings: null,

    setSettings: (s) => set({ settings: s, loaded: true, loading: false, error: null }),

    load: async () => {
        if (get().loading) return
        set({ loading: true, error: null })
        try {
            const res = await getSettings()
            set({ settings: res.item, loaded: true, loading: false, error: null })
        } catch (e: any) {
            set({ error: e?.message || "Error", loading: false })
        }
    },
}))
