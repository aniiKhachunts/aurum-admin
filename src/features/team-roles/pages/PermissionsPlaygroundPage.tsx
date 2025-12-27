import { SectionCard } from "../../../shared/ui/SectionCard"
import { StatusPill } from "../../../shared/ui/StatusPill"
import { Can } from "../../../shared/ui/Can"
import { useSessionStore } from "../../../shared/lib/sessionStore"
import { can, type Permission } from "../../../shared/lib/permissions"
import {Header} from "../../../shared/ui/Header.tsx";

const checks: { label: string; permission: Permission }[] = [
    { label: "Read Users", permission: "users:read" },
    { label: "Edit Users", permission: "users:write" },
    { label: "Deactivate Users", permission: "users:deactivate" },
    { label: "Manage Billing", permission: "billing:manage" },
    { label: "Refund Transactions", permission: "transactions:refund" },
    { label: "Control AI Jobs", permission: "ai:control" },
    { label: "Read Audit Log", permission: "audit:read" },
    { label: "Write Settings", permission: "settings:write" },
]

export default function PermissionsPlaygroundPage() {
    const role = useSessionStore((s) => s.role)
    const userId = useSessionStore((s) => s.userId || undefined)
    const orgId = useSessionStore((s) => s.orgId || undefined)

    return (
        <div className="space-y-4">
            <Header />

            <SectionCard title="Permission Matrix (Live)">
                <div className="grid gap-2 sm:grid-cols-2">
                    {checks.map((c) => {
                        const ok = can(c.permission, { role, userId, orgId })
                        return (
                            <div
                                key={c.permission}
                                className="flex items-center justify-between rounded-xl px-3 py-2"
                                style={{
                                    background: "rgb(var(--panel-2))",
                                    border: "1px solid rgb(var(--border))",
                                }}
                            >
                                <div className="text-sm">{c.label}</div>
                                <StatusPill label={ok ? "Allowed" : "Denied"} tone={ok ? "success" : "danger"} />
                            </div>
                        )
                    })}
                </div>
            </SectionCard>

            <SectionCard title="UI Enforcement Examples" description="One hidden, one disabled with tooltip.">
                <div className="flex flex-wrap gap-3">
                    <Can permission="users:deactivate" mode="hide">
                        <button
                            className="rounded-xl px-3 py-2 text-sm font-medium"
                            style={{
                                background: "rgb(var(--danger))",
                                color: "white",
                                boxShadow: "var(--sh-sm)",
                            }}
                        >
                            Deactivate User (hidden if denied)
                        </button>
                    </Can>

                    <Can permission="billing:manage" mode="disable" reason="Only Owner can manage billing">
                        <button
                            className="rounded-xl px-3 py-2 text-sm font-medium"
                            style={{
                                background: "rgb(var(--brand))",
                                color: "white",
                                boxShadow: "var(--sh-sm)",
                            }}
                        >
                            Manage Billing (disabled if denied)
                        </button>
                    </Can>
                </div>
            </SectionCard>
        </div>
    )
}
