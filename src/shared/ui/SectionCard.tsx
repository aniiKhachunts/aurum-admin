import type {ReactNode} from "react"

type Props = {
    title?: string
    description?: string
    right?: ReactNode
    children: ReactNode
}

export function SectionCard({ title, description, right, children }: Props) {
    return (
        <section
            className="rounded-2xl p-5"
            style={{
                background: "rgb(var(--panel))",
                border: "1px solid rgb(var(--border))",
                boxShadow: "var(--sh-sm)",
            }}
        >
            {(title || description || right) ? (
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        {title ? <div className="text-sm font-semibold">{title}</div> : null}
                        {description ? (
                            <div className="mt-1 text-sm" style={{ color: "rgb(var(--muted))" }}>
                                {description}
                            </div>
                        ) : null}
                    </div>

                    {right ? <div className="flex items-center gap-2">{right}</div> : null}
                </div>
            ) : null}

            {children}
        </section>
    )
}
