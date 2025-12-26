import { useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
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
import {toast} from "../shared/ui/Toast/toast.ts";
import {ConfirmDialog} from "../shared/ui/ConfirmDialog.tsx";

export default function TransactionsPage() {
    const role = useSessionStore((s) => s.role)
    const supportRefundLimit = useSettingsStore((s) => s.settings?.controls?.supportRefundLimit ?? 200)
    const refundsEnabled = Boolean(useSettingsStore((s) => s.settings?.features?.refunds))

    const [items, setItems] = useState<Tx[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [status, setStatus] = useState("")
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [actingId, setActingId] = useState<string | null>(null)
    const [confirmTx, setConfirmTx] = useState<Tx | null>(null)

    async function load() {
        setLoading(true)
        setErr(null)
        try {
            const res = await getTransactions({ page, pageSize, status })
            setItems(res.items)
            setTotal(res.total)
        } catch (e: any) {
            setErr(e?.message || "Error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [page, pageSize, status])

    async function onRefund(tx: Tx) {
        setActingId(tx.id)
        setErr(null)
        try {
            const res = await refundTransaction(tx.id)
            setItems((prev) => prev.map((x) => (x.id === tx.id ? res.item : x)))
            toast.success("Refund issued", `Transaction ${tx.id} refunded`)
        } catch (e: any) {
            setErr(e?.message || "Error")
            toast.error("Refund failed", e?.message || "Error")
        } finally {
            setActingId(null)
        }
    }

    const columns = useMemo<ColumnDef<Tx, any>[]>(
        () => [
            { header: "ID", accessorKey: "id" },
            {
                header: "Created",
                accessorKey: "createdAt",
                cell: (ctx) => new Date(ctx.getValue() as string).toLocaleDateString(),
            },
            { header: "Provider", accessorKey: "provider" },
            { header: "Org", accessorKey: "orgId" },
            { header: "User", accessorKey: "userId" },
            {
                header: "Amount",
                accessorKey: "amount",
                cell: (ctx) => `$${Number(ctx.getValue()).toFixed(2)}`,
            },
            { header: "Status", accessorKey: "status" },
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
                                : "Refund this transaction"

                    return (
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
                                    title={title}
                                    onClick={() => setConfirmTx(tx)}
                                >
                                    {busy ? "Refunding…" : "Refund"}
                                </button>
                            </WriteGuard>
                        </Can>
                    )
                },
            },
        ],
        [actingId, role, refundsEnabled, supportRefundLimit]
    )

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
                            onChange: (v) => {
                                setPage(1)
                                setStatus(v)
                            },
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
                        <DataTable columns={columns} data={items} />
                        <DataTablePagination
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={setPage}
                            onPageSizeChange={(s) => {
                                setPage(1)
                                setPageSize(s)
                            }}
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
