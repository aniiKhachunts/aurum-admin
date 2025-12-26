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

function hasPermission(role: string, permission: string) {
    const list = ROLE_PERMS[role] || []
    if (list.includes("*")) return true
    return list.includes(permission)
}

type DisableableProps = {
    disabled?: boolean
    style?: React.CSSProperties
    tabIndex?: number
    ["aria-disabled"]?: boolean
}

export function Can({ permission, mode = "disable", reason, children }: Props) {
    const role = useSessionStore((s) => s.role)
    const allowed = hasPermission(role, permission)

    if (allowed) return <>{children}</>
    if (mode === "hide") return null

    if (!isValidElement(children)) {
        return (
            <span
                title={reason || "No permission"}
                style={{ opacity: 0.55, cursor: "not-allowed", pointerEvents: "none", display: "inline-flex" }}
            >
        {children}
      </span>
        )
    }

    const el = children as ReactElement<DisableableProps>
    const nextStyle: React.CSSProperties = {
        ...(el.props.style || {}),
        opacity: 0.55,
        cursor: "not-allowed",
        pointerEvents: "none",
    }

    return (
        <span title={reason || "No permission"} style={{ display: "inline-flex" }}>
      {cloneElement(el, {
          disabled: el.props.disabled ?? true,
          "aria-disabled": true,
          style: nextStyle,
          tabIndex: -1,
      })}
    </span>
    )
}
