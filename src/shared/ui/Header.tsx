import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSessionStore } from "../lib/sessionStore"
import { useTheme } from "../hooks/useTheme"
import type { Role } from "../lib/permissions"

type Props = {
    title?: string
    subtitle?: string
    actions?: React.ReactNode
}

function segmentTitle(path: string) {
    if (path.startsWith("/dashboard")) return "Dashboard"
    if (path.startsWith("/users")) return "Users"
    if (path.startsWith("/organizations")) return "Organizations"
    if (path.startsWith("/transactions")) return "Transactions"
    if (path.startsWith("/ai-jobs")) return "AI Jobs"
    if (path.startsWith("/settings")) return "Settings"
    if (path.startsWith("/audit")) return "Audit"
    if (path.startsWith("/permissions")) return "Permissions"
    return "Workspace"
}

export function Header({ title, subtitle, actions }: Props) {
    const navigate = useNavigate()
    const location = useLocation()
    const { theme, toggle } = useTheme()

    const role = useSessionStore((s) => s.role)
    const setRole = useSessionStore((s) => s.setRole)
    const logout = useSessionStore((s) => s.logout)

    const pageTitle = useMemo(
        () => title ?? segmentTitle(location.pathname),
        [title, location.pathname]
    )

    const [roleOpen, setRoleOpen] = useState(false)
    const roleRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
                setRoleOpen(false)
            }
        }

        function onEsc(e: KeyboardEvent) {
            if (e.key === "Escape") setRoleOpen(false)
        }

        document.addEventListener("mousedown", onDocClick)
        document.addEventListener("keydown", onEsc)
        return () => {
            document.removeEventListener("mousedown", onDocClick)
            document.removeEventListener("keydown", onEsc)
        }
    }, [])

    function onPickRole(next: Role) {
        setRole(next)
        setRoleOpen(false)
        navigate("/dashboard")
    }

    function onLogout() {
        logout()
        navigate("/login")
    }

    return (
        <div
            className="sticky top-0 z-40"
            style={{
                background: "rgba(var(--bg),0.78)",
                backdropFilter: "blur(10px)",
                borderBottom: "1px solid rgb(var(--border))",
            }}
        >
            <div className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className="grid h-9 w-9 place-items-center rounded-2xl text-sm font-semibold"
                        style={{
                            background: "rgb(var(--panel))",
                            border: "1px solid rgb(var(--border))",
                            boxShadow: "var(--sh-sm)",
                        }}
                    >
                        A
                    </div>

                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{pageTitle}</div>
                        {subtitle ? (
                            <div className="mt-0.5 truncate text-[11px]" style={{ color: "rgb(var(--muted))" }}>
                                {subtitle}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {actions}

                    <button
                        onClick={toggle}
                        className="rounded-2xl px-3 py-2 text-xs font-semibold"
                        style={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))" }}
                    >
                        {theme === "dark" ? "Dark" : "Light"}
                    </button>

                    <div ref={roleRef} className="relative">
                        <button
                            className="rounded-2xl px-3 py-2 text-xs font-semibold"
                            style={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))" }}
                            onClick={() => setRoleOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={roleOpen}
                        >
                            Role: {role}
                        </button>

                        {roleOpen && (
                            <div
                                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl"
                                style={{
                                    background: "rgb(var(--panel))",
                                    border: "1px solid rgb(var(--border))",
                                    boxShadow: "var(--sh-md)",
                                }}
                                role="menu"
                            >
                                {(["Owner", "Admin", "Analyst", "Support", "Viewer"] as Role[]).map((r) => (
                                    <button
                                        key={r}
                                        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-black/5"
                                        onClick={() => onPickRole(r)}
                                        role="menuitemradio"
                                        aria-checked={role === r}
                                    >
                                        <span className="capitalize">{r}</span>
                                        {role === r && <span>✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        className="rounded-2xl px-3 py-2 text-xs font-semibold"
                        style={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))" }}
                        onClick={onLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}
