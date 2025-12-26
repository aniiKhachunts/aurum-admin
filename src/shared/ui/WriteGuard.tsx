import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react"
import { useSettingsStore } from "../lib/settingsStore"

type Props = {
    reason?: string
    children: ReactNode
    allowDuringMaintenance?: boolean
}

type DisableableProps = {
    disabled?: boolean
    style?: React.CSSProperties
    tabIndex?: number
    ["aria-disabled"]?: boolean
}

export function WriteGuard({ children, reason, allowDuringMaintenance  }: Props) {
    const maintenanceMode = Boolean(useSettingsStore((s) => s.settings?.maintenanceMode))

    if (!maintenanceMode) return <>{children}</>
    if (allowDuringMaintenance) return <>{children}</>

    if (!isValidElement(children)) {
        return (
            <span
                title={reason || "Maintenance mode"}
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
        <span title={reason || "Maintenance mode"} style={{ display: "inline-flex" }}>
      {cloneElement(el, {
          disabled: el.props.disabled ?? true,
          "aria-disabled": true,
          style: nextStyle,
          tabIndex: -1,
      })}
    </span>
    )
}
