import type {ReactNode} from "react"

type Props = {
    label: string
    hint?: string
    error?: string | null
    children: ReactNode
}

export function FormField({ label, hint, error, children }: Props) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                    {label}
                </label>
                {hint ? (
                    <span className="text-[11px]" style={{ color: "rgb(var(--muted))" }}>
            {hint}
          </span>
                ) : null}
            </div>

            {children}

            {error ? (
                <div className="mt-1 text-xs" style={{ color: "rgb(var(--danger))" }}>
                    {error}
                </div>
            ) : null}
        </div>
    )
}
