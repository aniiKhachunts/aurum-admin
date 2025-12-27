import { useEffect, useMemo, useState } from "react"
import type {ColumnDef} from "@tanstack/react-table"
import { SectionCard } from "../shared/ui/SectionCard"
import { DataTable } from "../shared/ui/DataTable/DataTable"
import { DataTableState } from "../shared/ui/DataTable/DataTableStates"
import { getOrganizations, type Org } from "../features/organizations/api/orgsApi"
import {Header} from "../shared/ui/Header.tsx";

export default function OrganizationsPage() {
    const [items, setItems] = useState<Org[]>([])
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)

    async function load() {
        setLoading(true)
        setErr(null)
        try {
            const res = await getOrganizations()
            setItems(res.items)
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Error"
            setErr(message || "Error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [])

    const columns = useMemo<ColumnDef<Org, unknown>[]>(
        () => [
            { header: "Name", accessorKey: "name" },
            { header: "Plan", accessorKey: "plan" },
            {
                header: "Seats",
                cell: (ctx) => {
                    const o = ctx.row.original
                    return `${o.seatsUsed}/${o.seatsTotal}`
                },
            },
            {
                header: "Created",
                accessorKey: "createdAt",
                cell: (ctx) => new Date(ctx.getValue() as string).toLocaleDateString(),
            },
            { header: "Org ID", accessorKey: "id" },
        ],
        []
    )

    return (
        <div className="space-y-4">
            <Header />

            <SectionCard>
                {loading ? (
                    <DataTableState kind="loading" />
                ) : err ? (
                    <DataTableState kind="error" message={err} onRetry={load} />
                ) : items.length === 0 ? (
                    <DataTableState kind="empty" title="No organizations" />
                ) : (
                    <DataTable columns={columns} data={items} />
                )}
            </SectionCard>
        </div>
    )
}
