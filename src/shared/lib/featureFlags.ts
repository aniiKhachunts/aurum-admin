import { useSettingsStore } from "./settingsStore"

export type FeatureKey = "aiJobs" | "refunds" | "audit"

export function isFeatureEnabled(key: FeatureKey) {
    const s = useSettingsStore.getState().settings
    return Boolean(s?.features?.[key])
}
