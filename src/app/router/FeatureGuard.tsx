import { Navigate, Outlet } from "react-router-dom"
import { useSettingsStore } from "../../shared/lib/settingsStore"

export function FeatureGuard({ feature }: { feature: "aiJobs" | "audit" }) {
    const settings = useSettingsStore((s) => s.settings)
    const enabled = Boolean(settings?.features?.[feature])

    if (!enabled) return <Navigate to="/feature-disabled" replace state={{ feature }} />
    return <Outlet />
}
