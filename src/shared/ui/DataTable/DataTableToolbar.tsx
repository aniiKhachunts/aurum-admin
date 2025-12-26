type SelectFilter = {
    key: string
    label: string
    value: string
    onChange: (v: string) => void
    options: { label: string; value: string }[]
}

type Props = {
    search?: {
        value: string
        onChange: (v: string) => void
        placeholder?: string
    }
    filters?: SelectFilter[]
    right?: React.ReactNode
}

export function DataTableToolbar({ search, filters, right }: Props) {
    return (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
                {search ? (
                    <input
                        value={search.value}
                        onChange={(e) => search.onChange(e.target.value)}
                        placeholder={search.placeholder || "Search…"}
                        className="w-[260px] rounded-xl px-3 py-2 text-sm"
                        style={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))" }}
                    />
                ) : null}

                {filters?.map((f) => (
                    <div key={f.key} className="flex items-center gap-2">
                        <select
                            value={f.value}
                            onChange={(e) => f.onChange(e.target.value)}
                            className="rounded-xl px-3 py-2 text-sm"
                            style={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))" }}
                            aria-label={f.label}
                        >
                            <option value="">{`All ${f.label.toLowerCase()}`}</option>
                            {f.options.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            {right ? <div className="flex items-center gap-2">{right}</div> : null}
        </div>
    )
}
