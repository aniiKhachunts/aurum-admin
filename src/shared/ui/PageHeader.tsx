import type {ReactNode} from "react"

type Props = {
    title: string
    subtitle?: string
    actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: Props) {
    return (
        <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
                <h1 className="text-xl font-semibold leading-tight">{title}</h1>
                {subtitle ? (
                    <p className="mt-1 text-sm" style={{ color: "rgb(var(--muted))" }}>
                        {subtitle}
                    </p>
                ) : null}
            </div>

            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
    )
}
