import { useMemo, useState } from "react"
import type { Role } from "../lib/permissions"
import { roleLabel } from "../lib/permissions"
import { useSessionStore } from "../lib/sessionStore"

const roles: Role[] = ["Owner", "Admin", "Analyst", "Support", "Viewer"]

export function RoleSwitcher() {
    const role = useSessionStore((s) => s.role)
    const setRole = useSessionStore((s) => s.setRole)

    const [open, setOpen] = useState(false)

    const current = useMemo(() => roleLabel(role), [role])

    return (
        <div className="relative">
            <button
                type="button"
                className="rounded-xl px-3 py-2 text-sm"
                style={{
                    border: "1px solid rgb(var(--border))",
                    background: "rgb(var(--panel))",
                    boxShadow: "var(--sh-sm)",
                }}
                onClick={() => setOpen((v) => !v)}
            >
                Role: {current}
            </button>

            {open ? (
                <div
                    className="absolute right-0 mt-2 w-44 rounded-2xl p-1"
                    style={{
                        background: "rgb(var(--panel))",
                        border: "1px solid rgb(var(--border))",
                        boxShadow: "var(--sh-md)",
                    }}
                >
                    {roles.map((r) => {
                        const active = r === role
                        return (
                            <button
                                key={r}
                                type="button"
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm"
                                style={{
                                    background: active ? "rgb(var(--panel-2))" : "transparent",
                                    color: active ? "rgb(var(--text))" : "rgb(var(--muted))",
                                    border: active ? "1px solid rgb(var(--border))" : "1px solid transparent",
                                }}
                                onClick={() => {
                                    setRole(r)
                                    setOpen(false)
                                }}
                            >
                                <span>{roleLabel(r)}</span>
                                {active ? <span className="text-xs">✓</span> : null}
                            </button>
                        )
                    })}
                </div>
            ) : null}
        </div>
    )
}
