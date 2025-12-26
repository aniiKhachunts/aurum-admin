import { useCallback, useEffect, useMemo, useState } from "react"
import type { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table"
import { PageHeader } from "../shared/ui/PageHeader"
import { SectionCard } from "../shared/ui/SectionCard"
import { DataTable } from "../shared/ui/DataTable/DataTable"
import { DataTableToolbar } from "../shared/ui/DataTable/DataTableToolbar"
import { DataTablePagination } from "../shared/ui/DataTable/DataTablePagination"
import { DataTableState } from "../shared/ui/DataTable/DataTableStates"
import { Can } from "../shared/ui/Can"
import { useSessionStore } from "../shared/lib/sessionStore"
import { isSupportRefundAllowed } from "../shared/lib/permissions"
import { getTransactions, refundTransaction, type Tx } from "../features/transactions/api/transactionsApi"
import { WriteGuard } from "../shared/ui/WriteGuard"
import { useSettingsStore } from "../shared/lib/settingsStore"
import { toast } from "../shared/ui/Toast/toast"
import { ConfirmDialog } from "../shared/ui/ConfirmDialog"
import { getErrorMessage } from "../shared/lib/getErrorMessage"
import { formatApiError } from "../shared/lib/formatApiError"
import { useTableQueryState } from "../shared/hooks/useTableQueryState"

function TooltipWrap({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <span title={title} style={{ display: "inline-flex" }}>
            {children}
        </span>
    )
}

export default function TransactionsPage() {
    const role = useSessionStore((s) => s.role)
    const supportRefundLimit = useSettingsStore((s) => s.settings?.controls?.supportRefundLimit ?? 200)
    const refundsEnabled = Boolean(useSettingsStore((s) => s.settings?.features?.refunds))

    const [items, setItems] = useState<Tx[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [actingId, setActingId] = useState<string | null>(null)
    const [confirmTx, setConfirmTx] = useState<Tx | null>(null)

    const { state: qs, write } = useTableQueryState({
        searchKey: "status",
        defaults: { page: 1, pageSize: 20, search: "", sort: [] },
    })

    const page = qs.page
    const pageSize = qs.pageSize
    const status = qs.search
    const sort = qs.sort as SortingState

    const load = useCallback(async () => {
        setLoading(true)
        setErr(null)
        try {
            const res = await getTransactions({ page, pageSize, status, sort })
            setItems(res.items)
            setTotal(res.total)
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
        } finally {
            setLoading(false)
        }
    }, [page, pageSize, status, sort])

    useEffect(() => {
        load()
    }, [load])

    async function onRefund(tx: Tx) {
        setActingId(tx.id)
        setErr(null)
        try {
            const res = await refundTransaction(tx.id)
            setItems((prev) => prev.map((x) => (x.id === tx.id ? res.item : x)))
            toast.success("Refund issued", `Transaction ${tx.id} refunded`)
        } catch (e: unknown) {
            setErr(getErrorMessage(e))
            toast.error("Refund failed", formatApiError(e))
        } finally {
            setActingId(null)
        }
    }

    const columns = useMemo<ColumnDef<Tx, unknown>[]>(
        () => [
            { header: "ID", accessorKey: "id", enableSorting: true },
            {
                header: "Created",
                accessorKey: "createdAt",
                enableSorting: true,
                cell: (ctx) => new Date(String(ctx.getValue() ?? "")).toLocaleDateString(),
            },
            { header: "Provider", accessorKey: "provider", enableSorting: true },
            { header: "Org", accessorKey: "orgId", enableSorting: true },
            { header: "User", accessorKey: "userId", enableSorting: true },
            {
                header: "Amount",
                accessorKey: "amount",
                enableSorting: true,
                cell: (ctx) => `$${Number(ctx.getValue() ?? 0).toFixed(2)}`,
            },
            { header: "Status", accessorKey: "status", enableSorting: true },
            {
                header: "Actions",
                cell: (ctx) => {
                    const tx = ctx.row.original
                    const busy = actingId === tx.id

                    const disabledByFlag = !refundsEnabled
                    const disabledByRule = role === "support" && !isSupportRefundAllowed(tx.amount, role)
                    const isRefundable = tx.status === "paid"

                    const disabled = disabledByFlag || disabledByRule || !isRefundable || busy

                    const title = disabledByFlag
                        ? "Refunds feature is disabled"
                        : disabledByRule
                            ? `Support can refund only amounts ≤ ${supportRefundLimit}`
                            : !isRefundable
                                ? "Only paid transactions can be refunded"
                                : busy
                                    ? "Refund in progress"
                                    : "Refund this transaction"

                    const button = (
                        <Can permission="transactions:refund" mode="disable" reason="No permission to refund">
                            <WriteGuard reason={disabledByFlag ? "Refunds feature is disabled" : "Maintenance mode: refunds disabled"}>
                                <button
                                    className="rounded-xl px-3 py-2 text-xs font-medium"
                                    style={{
                                        border: "1px solid rgb(var(--border))",
                                        background: "rgb(var(--panel))",
                                        opacity: disabled ? 0.5 : 1,
                                    }}
                                    disabled={disabled}
                                    onClick={() => setConfirmTx(tx)}
                                    type="button"
                                >
                                    {busy ? "Refunding…" : "Refund"}
                                </button>
                            </WriteGuard>
                        </Can>
                    )

                    return <TooltipWrap title={title}>{button}</TooltipWrap>
                },
            },
        ],
        [actingId, refundsEnabled, role, supportRefundLimit]
    )

    const onSortingChange: OnChangeFn<SortingState> = (updater) => {
        const next = typeof updater === "function" ? updater(sort) : updater
        write({ page: 1, sort: next })
    }

    return (
        <div className="space-y-4">
            <PageHeader title="Transactions" subtitle="Pagination + refund action (permission-gated)." />

            <SectionCard>
                <DataTableToolbar
                    filters={[
                        {
                            key: "status",
                            label: "Status",
                            value: status,
                            onChange: (v) => write({ page: 1, search: v }),
                            options: [
                                { label: "Paid", value: "paid" },
                                { label: "Refunded", value: "refunded" },
                                { label: "Failed", value: "failed" },
                            ],
                        },
                    ]}
                />

                {loading ? (
                    <DataTableState kind="loading" />
                ) : err ? (
                    <DataTableState kind="error" message={err} onRetry={load} />
                ) : items.length === 0 ? (
                    <DataTableState kind="empty" title="No transactions" />
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

            <ConfirmDialog
                open={Boolean(confirmTx)}
                title="Issue refund?"
                description={confirmTx ? `Refund transaction ${confirmTx.id} for $${Number(confirmTx.amount).toFixed(2)}.` : ""}
                confirmText="Refund"
                cancelText="Cancel"
                danger
                requireText={confirmTx ? confirmTx.id : undefined}
                busy={actingId === confirmTx?.id}
                onClose={() => setConfirmTx(null)}
                onConfirm={async () => {
                    if (!confirmTx) return
                    await onRefund(confirmTx)
                    setConfirmTx(null)
                }}
            />
        </div>
    )
}
