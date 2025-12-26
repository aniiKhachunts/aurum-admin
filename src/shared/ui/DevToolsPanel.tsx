import { useMemo, useState } from "react"
import { useDevSettingsStore } from "../lib/devSettingsStore"

export function DevToolsPanel() {
    const enabled = useDevSettingsStore((s) => s.enabled)
    const minDelayMs = useDevSettingsStore((s) => s.minDelayMs)
    const maxDelayMs = useDevSettingsStore((s) => s.maxDelayMs)
    const errorRate = useDevSettingsStore((s) => s.errorRate)
    const setEnabled = useDevSettingsStore((s) => s.setEnabled)
    const setMinDelayMs = useDevSettingsStore((s) => s.setMinDelayMs)
    const setMaxDelayMs = useDevSettingsStore((s) => s.setMaxDelayMs)
    const setErrorRate = useDevSettingsStore((s) => s.setErrorRate)
    const triggerForceNextError = useDevSettingsStore((s) => s.triggerForceNextError)
    const reset = useDevSettingsStore((s) => s.reset)

    const [open, setOpen] = useState(false)

    const pct = useMemo(() => Math.round(errorRate * 100), [errorRate])

    if (!import.meta.env.DEV) return null

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {open ? (
                <div
                    className="w-[320px] rounded-2xl p-3"
                    style={{
                        background: "rgb(var(--panel))",
                        border: "1px solid rgb(var(--border))",
                        boxShadow: "var(--sh-lg)",
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">DevTools</div>
                        <button
                            className="rounded-xl px-2 py-1 text-xs"
                            style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))" }}
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </button>
                    </div>

                    <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
                                Simulate latency/errors
                            </div>
                            <button
                                className="rounded-xl px-2 py-1 text-xs"
                                style={{
                                    border: "1px solid rgb(var(--border))",
                                    background: enabled ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.10)",
                                    color: enabled ? "rgb(var(--success))" : "rgb(var(--danger))",
                                }}
                                onClick={() => setEnabled(!enabled)}
                            >
                                {enabled ? "Enabled" : "Disabled"}
                            </button>
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between text-xs" style={{ color: "rgb(var(--muted))" }}>
                                <span>Delay min (ms)</span>
                                <span style={{ color: "rgb(var(--text))" }}>{minDelayMs}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={2000}
                                value={minDelayMs}
                                onChange={(e) => setMinDelayMs(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between text-xs" style={{ color: "rgb(var(--muted))" }}>
                                <span>Delay max (ms)</span>
                                <span style={{ color: "rgb(var(--text))" }}>{maxDelayMs}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={3000}
                                value={maxDelayMs}
                                onChange={(e) => setMaxDelayMs(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between text-xs" style={{ color: "rgb(var(--muted))" }}>
                                <span>Error rate</span>
                                <span style={{ color: "rgb(var(--text))" }}>{pct}%</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={30}
                                value={pct}
                                onChange={(e) => setErrorRate(Number(e.target.value) / 100)}
                                className="w-full"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="flex-1 rounded-xl px-3 py-2 text-xs font-medium"
                                style={{
                                    border: "1px solid rgb(var(--border))",
                                    background: "rgb(var(--panel-2))",
                                }}
                                onClick={triggerForceNextError}
                            >
                                Fail next request
                            </button>

                            <button
                                className="flex-1 rounded-xl px-3 py-2 text-xs font-medium"
                                style={{
                                    border: "1px solid rgb(var(--border))",
                                    background: "rgb(var(--panel-2))",
                                }}
                                onClick={reset}
                            >
                                Reset
                            </button>
                        </div>

                        <div className="text-[11px]" style={{ color: "rgb(var(--muted))" }}>
                            Tip: set error rate to 20–30% to validate empty/error/loading states quickly.
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    className="rounded-2xl px-3 py-2 text-xs font-semibold"
                    style={{
                        background: "rgb(var(--panel))",
                        border: "1px solid rgb(var(--border))",
                        boxShadow: "var(--sh-md)",
                    }}
                    onClick={() => setOpen(true)}
                >
                    DevTools
                </button>
            )}
        </div>
    )
}
