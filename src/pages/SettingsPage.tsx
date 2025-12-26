import {useEffect, useState} from "react"
import {PageHeader} from "../shared/ui/PageHeader"
import {SectionCard} from "../shared/ui/SectionCard"
import {DataTableState} from "../shared/ui/DataTable/DataTableStates"
import {Can} from "../shared/ui/Can"
import {updateSettings} from "../features/settings/api/settingsApi"
import {useSettingsStore} from "../shared/lib/settingsStore"
import {WriteGuard} from "../shared/ui/WriteGuard.tsx";
import {toast} from "../shared/ui/Toast/toast.ts";
import {formatApiError} from "../shared/lib/formatApiError.ts";
import {getErrorMessage} from "../shared/lib/getErrorMessage.ts";
import type { AppSettings } from "../features/settings/api/settingsApi"

type FeatureKey = keyof NonNullable<AppSettings["features"]>

function Toggle({
                    checked,
                    onChange,
                    disabled,
                }: {
    checked: boolean
    onChange: (v: boolean) => void
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            className="h-8 w-14 rounded-full p-1"
            style={{
                background: checked ? "rgba(34,197,94,0.65)" : "rgba(148,163,184,0.30)",
                border: "1px solid rgb(var(--border))",
                opacity: disabled ? 0.55 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
            }}
            disabled={disabled}
            aria-pressed={checked}
            onClick={() => {
                if (disabled) return
                onChange(!checked)
            }}
        >
            <div
                className="h-6 w-6 rounded-full"
                style={{
                    transform: `translateX(${checked ? 24 : 0}px)`,
                    transition: "transform 160ms ease",
                    background: checked ? "white" : "rgb(var(--panel))",
                    border: "1px solid rgb(var(--border))",
                    boxShadow: "var(--sh-sm)",
                }}
            />
        </button>
    )
}

export default function SettingsPage() {
    const s = useSettingsStore((st) => st.settings)
    const loading = useSettingsStore((st) => st.loading)
    const loaded = useSettingsStore((st) => st.loaded)
    const storeError = useSettingsStore((st) => st.error)
    const load = useSettingsStore((st) => st.load)
    const setSettings = useSettingsStore((st) => st.setSettings)

    const [saving, setSaving] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    useEffect(() => {
        if (!loaded) load()
    }, [loaded, load])

    async function save(patch: Partial<AppSettings>) {
        setSaving(true)
        setErr(null)
        try {
            const res = await updateSettings(patch)
            setSettings(res.item)
            toast.success("Settings updated")
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
            toast.error("Update failed", formatApiError(e))
        } finally {
            setSaving(false)
        }
    }

    if (loading || !s) return <DataTableState kind="loading" label="Loading settings…" />
    if (storeError) return <DataTableState kind="error" message={storeError} onRetry={load} />

    return (
        <div className="space-y-4">
            <PageHeader title="Settings" subtitle="Feature flags and operational controls."/>

            {err ? <div className="text-sm" style={{color: "rgb(var(--danger))"}}>{err}</div> : null}

            <SectionCard title="Operations" description="Global switches that affect the whole panel">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm font-medium">Maintenance mode</div>
                        <div className="text-xs" style={{color: "rgb(var(--muted))"}}>
                            Disables write actions across the app.
                        </div>
                    </div>

                    <Can permission="settings:write" mode="disable" reason="No permission to change settings">
                        <WriteGuard allowDuringMaintenance
                                    reason="Only settings changes are allowed during maintenance">
                            <Toggle checked={s.maintenanceMode} disabled={saving}
                                    onChange={(v) => save({maintenanceMode: v})}/>
                        </WriteGuard>
                    </Can>
                </div>
            </SectionCard>


            <SectionCard title="Feature flags" description="Enable or disable modules without deployments">
                <div className="space-y-3">
                    {[
                        ["AI Jobs", "aiJobs"] as const,
                        ["Refunds", "refunds"] as const,
                        ["Audit", "audit"] as const,
                    ].map(([label, key]) => (
                        <div key={key} className="flex items-center justify-between">
                            <div className="text-sm">{label}</div>

                            <Can permission="settings:write" mode="disable" reason="No permission to change settings">
                                <WriteGuard allowDuringMaintenance
                                            reason="Only settings changes are allowed during maintenance">
                                    <Toggle
                                        checked={Boolean(s.features[key as FeatureKey])}
                                        disabled={saving}
                                        onChange={(v) => save({features: {...s.features, [key as FeatureKey]: v}})}
                                    />
                                </WriteGuard>
                            </Can>
                        </div>
                    ))}
                </div>
            </SectionCard>


            <SectionCard title="Risk controls" description="Limits for support and automated systems">
                <div className="grid gap-4 md:grid-cols-2">
                    <div
                        className="rounded-2xl p-4"
                        style={{background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))"}}
                    >
                        <div className="text-sm font-medium">Support refund limit</div>
                        <div className="mt-1 text-xs" style={{color: "rgb(var(--muted))"}}>
                            Support can refund up to this amount.
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <input
                                className="w-full rounded-xl px-3 py-2 text-sm"
                                style={{background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))"}}
                                value={String(s.controls.supportRefundLimit)}
                                onChange={(e) =>
                                    setSettings({
                                        ...s,
                                        controls: { ...s.controls, supportRefundLimit: Number(e.target.value || 0) },
                                    })
                                }
                            />
                            <Can permission="settings:write" mode="disable" reason="No permission to change settings">
                                <WriteGuard allowDuringMaintenance
                                            reason="Only settings changes are allowed during maintenance">

                                    <button
                                        className="rounded-xl px-3 py-2 text-sm font-medium"
                                        style={{
                                            background: "rgb(var(--brand))",
                                            color: "white",
                                            opacity: saving ? 0.6 : 1
                                        }}
                                        disabled={saving}
                                        onClick={() =>
                                            save({
                                                controls: {
                                                    ...s.controls,
                                                    supportRefundLimit: s.controls.supportRefundLimit,
                                                },
                                            })
                                        }
                                    >
                                        Save
                                    </button>
                                </WriteGuard>
                            </Can>
                        </div>
                    </div>

                    <div
                        className="rounded-2xl p-4"
                        style={{background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))"}}
                    >
                        <div className="text-sm font-medium">Max AI concurrent runs</div>
                        <div className="mt-1 text-xs" style={{color: "rgb(var(--muted))"}}>
                            Soft operational limit for job runners.
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <input
                                className="w-full rounded-xl px-3 py-2 text-sm"
                                style={{background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))"}}
                                value={String(s.controls.maxAiConcurrentRuns)}
                                onChange={(e) =>
                                    setSettings({
                                        ...s,
                                        controls: { ...s.controls, maxAiConcurrentRuns: Number(e.target.value || 0) },
                                    })
                                }
                            />
                            <Can permission="settings:write" mode="disable" reason="No permission to change settings">
                                <WriteGuard allowDuringMaintenance
                                            reason="Only settings changes are allowed during maintenance">
                                    <button
                                        className="rounded-xl px-3 py-2 text-sm font-medium"
                                        style={{
                                            background: "rgb(var(--brand))",
                                            color: "white",
                                            opacity: saving ? 0.6 : 1
                                        }}
                                        disabled={saving}
                                        onClick={() =>
                                            save({
                                                controls: {
                                                    ...s.controls,
                                                    maxAiConcurrentRuns: s.controls.maxAiConcurrentRuns,
                                                },
                                            })
                                        }
                                    >
                                        Save
                                    </button>
                                </WriteGuard>
                            </Can>

                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    )
}
