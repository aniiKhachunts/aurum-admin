import {Link, NavLink, Outlet} from "react-router-dom"
import {LayoutGrid, Users, Building2, CreditCard, Bot, Settings, Shield, ClipboardList} from "lucide-react"
import {DevToolsPanel} from "../../shared/ui/DevToolsPanel.tsx";
import {MaintenanceBanner} from "../../shared/ui/MaintenanceBanner.tsx";
import {useSettingsStore} from "../../shared/lib/settingsStore.ts";

export function AppShell() {
    const settings = useSettingsStore((x) => x.settings)
    const f = settings?.features

    const nav = [
        {to: "/dashboard", label: "Dashboard", icon: LayoutGrid},
        {to: "/users", label: "Users", icon: Users},
        {to: "/organizations", label: "Organizations", icon: Building2},
        {to: "/transactions", label: "Transactions", icon: CreditCard},
        ...(f?.aiJobs ? [{ to: "/ai-jobs", label: "AI Jobs", icon: Bot }] : []),
        {to: "/settings", label: "Settings", icon: Settings},
        {to: "/team-roles/permissions", label: "Permissions", icon: Shield},
        ...(f?.audit ? [{ to: "/audit", label: "Audit", icon: ClipboardList }] : []),
    ]

    return (
        <div className="min-h-screen">
            <div className="grid grid-cols-[280px_1fr]">
                <aside
                    className="sticky top-0 h-screen px-4 py-4"
                    style={{
                        background: "rgb(var(--panel))",
                        borderRight: "1px solid rgb(var(--border))",
                    }}
                >
                    <div className="flex items-center justify-between px-2">
                        <Link to="/dashboard" className="text-sm font-semibold tracking-wide">
                            Aurum Admin
                        </Link>
                        <span
                            className="text-[11px] px-2 py-1 rounded-full"
                            style={{
                                color: "rgb(var(--muted))",
                                border: "1px solid rgb(var(--border))",
                                background: "rgb(var(--panel-2))",
                            }}
                        >
              v1
            </span>
                    </div>

                    <nav className="mt-6 flex flex-col gap-1">
                        {nav.map((item) => {
                            const Icon = item.icon
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({isActive}) =>
                                        [
                                            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                                            "transition-colors",
                                            isActive ? "font-medium" : "",
                                        ].join(" ")
                                    }
                                    style={({isActive}) => ({
                                        background: isActive ? "rgb(var(--panel-2))" : "transparent",
                                        color: isActive ? "rgb(var(--text))" : "rgb(var(--muted))",
                                        border: isActive ? "1px solid rgb(var(--border))" : "1px solid transparent",
                                    })}
                                >
                                    <Icon size={16}/>
                                    <span>{item.label}</span>
                                </NavLink>
                            )
                        })}
                    </nav>

                    <div className="mt-auto pt-6"/>
                </aside>

                <div className="min-h-screen">
                    <MaintenanceBanner />

                    <main className="py-2 px-6">
                        <Outlet/>
                        <DevToolsPanel/>

                    </main>
                </div>
            </div>
        </div>
    )
}
