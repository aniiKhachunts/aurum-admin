import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type OnChangeFn, type ColumnDef,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"

type Props<T> = {
    data: T[]
    columns: ColumnDef<T, unknown>[]
    onRowClick?: (row: T) => void
    sorting?: SortingState
    onSortingChange?: OnChangeFn<SortingState>
}

export function DataTable<T>({ columns, data, onRowClick, sorting, onSortingChange }: Props<T>) {
    const isControlled = !!sorting && !!onSortingChange
    const [internalSorting, setInternalSorting] = useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        state: { sorting: isControlled ? sorting : internalSorting },
        onSortingChange: isControlled ? onSortingChange : setInternalSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    const headerGroups = table.getHeaderGroups()
    const rows = table.getRowModel().rows

    const tableStyle: React.CSSProperties = useMemo(
        () => ({
            background: "rgb(var(--panel))",
            border: "1px solid rgb(var(--border))",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "var(--sh-sm)",
        }),
        []
    )

    return (
        <div style={tableStyle}>
            <div className="overflow-auto">
                <table className="w-full border-collapse">
                    <thead style={{ background: "rgb(var(--panel-2))" }}>
                    {headerGroups.map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((h) => {
                                const canSort = h.column.getCanSort()
                                const sorted = h.column.getIsSorted()

                                return (
                                    <th
                                        key={h.id}
                                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold"
                                        style={{
                                            borderBottom: "1px solid rgb(var(--border))",
                                            color: "rgb(var(--muted))",
                                            userSelect: "none",
                                        }}
                                        onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                                    >
                                            <span
                                                className={[
                                                    "inline-flex items-center gap-2",
                                                    canSort ? "cursor-pointer" : "",
                                                ].join(" ")}
                                            >
                                                <span
                                                    className={canSort ? "underline decoration-dotted underline-offset-4" : ""}
                                                    style={{ color: canSort ? "rgb(var(--text))" : "rgb(var(--muted))" }}
                                                >
                                                    {flexRender(h.column.columnDef.header, h.getContext())}
                                                </span>

                                                {canSort && (
                                                    <span
                                                        className="text-[11px]"
                                                        style={{
                                                            opacity: sorted ? 1 : 0.6,
                                                            color: "rgb(var(--muted))",
                                                        }}
                                                        aria-hidden="true"
                                                    >
                                                        {sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : "↕"}
                                                    </span>
                                                )}
                                            </span>
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                    </thead>

                    <tbody>
                    {rows.map((row) => (
                        <tr
                            key={row.id}
                            style={{
                                borderBottom: "1px solid rgb(var(--border))",
                                cursor: onRowClick ? "pointer" : "default",
                            }}
                            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                            onMouseEnter={(e) => {
                                if (!onRowClick) return
                                    ;(e.currentTarget as HTMLTableRowElement).style.background = "rgb(var(--panel-2))"
                            }}
                            onMouseLeave={(e) => {
                                ;(e.currentTarget as HTMLTableRowElement).style.background = "transparent"
                            }}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-4 py-3 text-sm">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
