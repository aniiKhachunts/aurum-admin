import {type ReactElement, type ReactNode, isValidElement } from "react"
import { useSettingsStore } from "../lib/settingsStore"

type Props = {
    allowDuringMaintenance?: boolean
    reason?: string
    children: ReactNode
}

export function WriteGuard({ allowDuringMaintenance = false, reason, children }: Props) {
    const settings = useSettingsStore((s) => s.settings)
    const readOnly = Boolean(settings?.maintenanceMode) && !allowDuringMaintenance

    if (!readOnly) return <>{children}</>

    const title = reason || "Maintenance mode: read-only"

    if (!isValidElement(children)) {
        return (
            <span title={title} style={{ opacity: 0.6, cursor: "not-allowed", pointerEvents: "none", display: "inline-flex" }}>
        {children}
      </span>
        )
    }

    const el = children as ReactElement<any>
    const nextStyle = {
        ...(el.props.style || {}),
        opacity: 0.6,
        cursor: "not-allowed",
        pointerEvents: "none",
    }

    return (
        <span title={title} style={{ display: "inline-flex" }}>
      {({
          ...el,
          props: {
              ...el.props,
              disabled: true,
              "aria-disabled": true,
              style: nextStyle,
              tabIndex: -1,
          },
      } as any)}
    </span>
    )
}
