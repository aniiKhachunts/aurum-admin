import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react"
import { useSessionStore } from "../lib/sessionStore"

type Props = {
    permission: string
    mode?: "hide" | "disable"
    reason?: string
    children: ReactNode
}

const ROLE_PERMS: Record<string, string[]> = {
    owner: ["*"],
    admin: ["*"],
    analyst: ["users:read", "orgs:read", "transactions:read", "ai:read", "audit:read"],
    support: ["users:read", "users:write", "transactions:read", "transactions:refund", "ai:read"],
    viewer: ["users:read", "orgs:read", "transactions:read", "ai:read", "audit:read"],
}

export function useCan(permission: string) {
    const role = useSessionStore((s) => s.role)
    return hasPermission(role, permission)
}

function hasPermission(role: string, permission: string) {
    const list = ROLE_PERMS[role] || []
    if (list.includes("*")) return true
    return list.includes(permission)
}

export function Can({ permission, mode = "disable", reason, children }: Props) {
    const role = useSessionStore((s) => s.role)
    const allowed = hasPermission(role, permission)

    if (allowed) return <>{children}</>
    if (mode === "hide") return null

    const title = reason || "No permission"

    if (!isValidElement(children)) {
        return (
            <span
                title={title}
                style={{ opacity: 0.55, cursor: "not-allowed", pointerEvents: "none", display: "inline-flex" }}
            >
                {children}
            </span>
        )
    }

    const el = children as ReactElement<any>
    const isDomElement = typeof el.type === "string"

    if (isDomElement) {
        return (
            <span title={title} style={{ display: "inline-flex" }}>
                {cloneElement(el, {
                    disabled: el.props.disabled ?? true,
                    "aria-disabled": true,
                    tabIndex: -1,
                    style: {
                        ...(el.props.style || {}),
                        opacity: 0.55,
                        cursor: "not-allowed",
                    },
                })}
            </span>
        )
    }

    return (
        <span
            title={title}
            style={{
                opacity: 0.55,
                cursor: "not-allowed",
                pointerEvents: "none",
                display: "inline-flex",
            }}
            aria-disabled="true"
        >
            {children}
        </span>
    )
}
