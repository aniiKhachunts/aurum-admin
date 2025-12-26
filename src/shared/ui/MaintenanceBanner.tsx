import { useSettingsStore } from "../lib/settingsStore"

export function MaintenanceBanner() {
    const s = useSettingsStore((x) => x.settings)
    if (!s?.maintenanceMode) return null

    return (
        <div
            className="px-6 py-3 text-sm"
            style={{
                background: "rgba(245,158,11,0.15)",
                borderBottom: "1px solid rgba(245,158,11,0.25)",
            }}
        >
            <span className="font-semibold">Maintenance mode:</span>{" "}
            <span style={{ color: "rgb(var(--muted))" }}>
        the panel is read-only. Mutations are disabled.
      </span>
        </div>
    )
}
