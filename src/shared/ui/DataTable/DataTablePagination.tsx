type Props = {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
}

const sizes = [10, 20, 30, 50]

export function DataTablePagination({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const canPrev = page > 1
    const canNext = page < totalPages

    return (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs" style={{ color: "rgb(var(--muted))" }}>
                Page <span style={{ color: "rgb(var(--text))" }}>{page}</span> of{" "}
                <span style={{ color: "rgb(var(--text))" }}>{totalPages}</span> ·{" "}
                <span style={{ color: "rgb(var(--text))" }}>{total}</span> rows
            </div>

            <div className="flex items-center gap-2">
                <select
                    className="rounded-xl px-2 py-2 text-sm"
                    style={{ background: "rgb(var(--panel))", border: "1px solid rgb(var(--border))" }}
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {sizes.map((s) => (
                        <option key={s} value={s}>
                            {s} / page
                        </option>
                    ))}
                </select>

                <button
                    className="rounded-xl px-3 py-2 text-sm"
                    style={{
                        background: "rgb(var(--panel))",
                        border: "1px solid rgb(var(--border))",
                        opacity: canPrev ? 1 : 0.5,
                    }}
                    disabled={!canPrev}
                    onClick={() => onPageChange(page - 1)}
                >
                    Prev
                </button>

                <button
                    className="rounded-xl px-3 py-2 text-sm"
                    style={{
                        background: "rgb(var(--panel))",
                        border: "1px solid rgb(var(--border))",
                        opacity: canNext ? 1 : 0.5,
                    }}
                    disabled={!canNext}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    )
}
