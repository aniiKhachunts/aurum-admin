import {useCallback, useEffect, useMemo, useState} from "react"
import type { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import { PageHeader } from "../shared/ui/PageHeader"
import { SectionCard } from "../shared/ui/SectionCard"
import { StatusPill } from "../shared/ui/StatusPill"
import { DataTable } from "../shared/ui/DataTable/DataTable"
import { DataTableToolbar } from "../shared/ui/DataTable/DataTableToolbar"
import { DataTablePagination } from "../shared/ui/DataTable/DataTablePagination"
import { DataTableState } from "../shared/ui/DataTable/DataTableStates"
import { getUsers, type User } from "../features/users/api/usersApi"
import { useTableQueryState } from "../shared/hooks/useTableQueryState"
import {getErrorMessage} from "../shared/lib/getErrorMessage.ts";

function tone(status: string) {
    if (status === "active") return "success"
    if (status === "invited") return "info"
    if (status === "suspended") return "warn"
    if (status === "deactivated") return "danger"
    return "neutral"
}

export default function UsersPage() {
    const [items, setItems] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    const { state: qs, write } = useTableQueryState({
        defaults: { page: 1, pageSize: 20, search: "" }
    })

    const page = qs.page
    const pageSize = qs.pageSize
    const search = qs.search
    const sort = qs.sort as SortingState

    const load = useCallback(async () => {
        setLoading(true)
        setErr(null)
        try {
            const res = await getUsers({ page, pageSize, search, status, sort })
            setItems(res.items)
            setTotal(res.total)
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, search, status, sort])

    useEffect(() => {
        load()
    }, [load])

    const columns = useMemo<ColumnDef<User, unknown>[]>(
        () => [
            {
                header: "Name",
                accessorKey: "name",
                enableSorting: true,
                cell: (ctx) => {
                    const row = ctx.row.original
                    return (
                        <Link to={`/users/${row.id}`} className="font-medium underline underline-offset-4">
                            {row.name}
                        </Link>
                    )
                },
            },
            { header: "Email", accessorKey: "email", enableSorting: true },
            { header: "Role", accessorKey: "role", enableSorting: true },
            {
                header: "Status",
                accessorKey: "status",
                enableSorting: true,
                cell: (ctx) => {
                    const v = String(ctx.getValue() ?? "")
                    return <StatusPill label={v} tone={tone(v) as "success" | "info" | "warn" | "danger" | "neutral"} />
                },
            },
            { header: "Org", accessorKey: "orgId", enableSorting: true },
        ],
        []
    )

    const onSortingChange: OnChangeFn<SortingState> = (updater) => {
        const next = typeof updater === "function" ? updater(sort) : updater
        write({ page: 1, sort: next })
    }

    return (
        <div className="space-y-4">
            <PageHeader title="Users" subtitle="Filter, sort, paginate, and test error/loading states." />

            <SectionCard>
                <DataTableToolbar
                    search={{
                        value: search,
                        onChange: (v) => write({ page: 1, search: v }),
                        placeholder: "Search by name or email…",
                    }}
                    filters={[
                        {
                            key: "status",
                            label: "Status",
                            value: status,
                            onChange: (v) => {
                                write({ page: 1 })
                                setStatus(v)
                            },
                            options: [
                                { label: "Active", value: "active" },
                                { label: "Invited", value: "invited" },
                                { label: "Suspended", value: "suspended" },
                                { label: "Deactivated", value: "deactivated" },
                            ],
                        },
                    ]}
                />

                {loading ? (
                    <DataTableState kind="loading" />
                ) : err ? (
                    <DataTableState kind="error" message={err} onRetry={load} />
                ) : items.length === 0 ? (
                    <DataTableState kind="empty" title="No users found" subtitle="Try clearing filters or searching a different term." />
                ) : (
                    <>
                        <DataTable columns={columns} data={items} sorting={sort} onSortingChange={onSortingChange} />
                        <DataTablePagination
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={(p) => write({ page: p })}
                            onPageSizeChange={(s) => write({ page: 1, pageSize: s })}
                        />
                    </>
                )}
            </SectionCard>
        </div>
    )
}
