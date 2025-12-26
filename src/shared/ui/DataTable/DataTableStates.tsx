type Props =
    | { kind: "loading"; label?: string }
    | { kind: "error"; message: string; onRetry?: () => void }
    | { kind: "empty"; title?: string; subtitle?: string; action?: React.ReactNode }

export function DataTableState(props: Props) {
    if (props.kind === "loading") {
        return (
            <div className="flex items-center justify-center rounded-2xl p-10"
                 style={{ background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))" }}>
                <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>
                    {props.label || "Loading..."}
                </div>
            </div>
        )
    }

    if (props.kind === "error") {
        return (
            <div className="rounded-2xl p-6"
                 style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <div className="text-sm font-semibold" style={{ color: "rgb(var(--danger))" }}>
                    Something went wrong
                </div>
                <div className="mt-1 text-sm" style={{ color: "rgb(var(--muted))" }}>
                    {props.message}
                </div>
                {props.onRetry ? (
                    <button
                        className="mt-4 rounded-xl px-3 py-2 text-sm font-medium"
                        style={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))" }}
                        onClick={props.onRetry}
                    >
                        Retry
                    </button>
                ) : null}
            </div>
        )
    }

    return (
        <div className="rounded-2xl p-10 text-center"
             style={{ background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))" }}>
            <div className="text-sm font-semibold">{props.title || "No results"}</div>
            {props.subtitle ? (
                <div className="mt-1 text-sm" style={{ color: "rgb(var(--muted))" }}>
                    {props.subtitle}
                </div>
            ) : null}
            {props.action ? <div className="mt-4 flex justify-center">{props.action}</div> : null}
        </div>
    )
}
