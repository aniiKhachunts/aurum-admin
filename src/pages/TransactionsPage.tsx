import {useCallback, useEffect, useMemo, useState} from "react"
import type {ColumnDef, OnChangeFn, SortingState} from "@tanstack/react-table"
import {Header} from "../shared/ui/Header"
import {SectionCard} from "../shared/ui/SectionCard"
import {DataTable} from "../shared/ui/DataTable/DataTable"
import {DataTableToolbar} from "../shared/ui/DataTable/DataTableToolbar"
import {DataTablePagination} from "../shared/ui/DataTable/DataTablePagination"
import {DataTableState} from "../shared/ui/DataTable/DataTableStates"
import {StatusPill} from "../shared/ui/StatusPill"
import {useSessionStore} from "../shared/lib/sessionStore"
import {useSettingsStore} from "../shared/lib/settingsStore"
import {can} from "../shared/lib/permissions"
import {getTransactions, refundTransaction, type Tx} from "../features/transactions/api/transactionsApi"
import {WriteGuard} from "../shared/ui/WriteGuard"
import {ConfirmDialog} from "../shared/ui/ConfirmDialog"
import {toast} from "../shared/ui/Toast/toast"
import {getErrorMessage} from "../shared/lib/getErrorMessage"
import {formatApiError} from "../shared/lib/formatApiError"
import {useTableQueryState} from "../shared/hooks/useTableQueryState"

function statusTone(status: Tx["status"]) {
    if (status === "Paid") return "success"
    if (status === "Refunded") return "info"
    if (status === "Failed") return "danger"
    return "neutral"
}

export default function TransactionsPage() {
    const role = useSessionStore((s) => s.role)
    const userId = useSessionStore((s) => s.userId || undefined)
    const orgId = useSessionStore((s) => s.orgId || undefined)

    const supportRefundLimit = useSettingsStore((s) => s.settings?.controls?.supportRefundLimit ?? 200)
    const refundsEnabled = Boolean(useSettingsStore((s) => s.settings?.features?.refunds))

    const [items, setItems] = useState<Tx[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const [actingId, setActingId] = useState<string | null>(null)
    const [confirmTx, setConfirmTx] = useState<Tx | null>(null)

    const {state: qs, write} = useTableQueryState({
        searchKey: "status",
        defaults: {page: 1, pageSize: 20, search: "", sort: []},
    })

    const page = qs.page
    const pageSize = qs.pageSize
    const status = qs.search
    const sort = qs.sort as SortingState

    const canRefund = can("transactions:refund", {role, userId, orgId})

    const load = useCallback(async () => {
        setLoading(true)
        setErr(null)
        try {
            const res = await getTransactions({page, pageSize, status, sort})
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

    const onSortingChange: OnChangeFn<SortingState> = (updater) => {
        const next = typeof updater === "function" ? updater(sort) : updater
        write({page: 1, sort: next})
    }

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
            {header: "ID", accessorKey: "id", enableSorting: true},
            {
                header: "Created",
                accessorKey: "createdAt",
                enableSorting: true,
                cell: (ctx) => new Date(String(ctx.getValue() ?? "")).toLocaleDateString(),
            },
            {header: "Provider", accessorKey: "provider", enableSorting: true},
            {header: "Org", accessorKey: "orgId", enableSorting: true},
            {header: "User", accessorKey: "userId", enableSorting: true},
            {
                header: "Amount",
                accessorKey: "amount",
                enableSorting: true,
                cell: (ctx) => `$${Number(ctx.getValue() ?? 0).toFixed(2)}`,
            },
            {
                header: "Status",
                accessorKey: "status",
                enableSorting: true,
                cell: (ctx) => {
                    const v = String(ctx.getValue() ?? "") as Tx["status"]
                    return <StatusPill label={v} tone={statusTone(v)}/>
                },
            },
            {
                header: "Actions",
                id: "actions",
                cell: (ctx) => {
                    const tx = ctx.row.original
                    const busy = actingId === tx.id

                    const disabledByPermission = !canRefund
                    const disabledByFlag = !refundsEnabled
                    const disabledByRule = role === "Support" && Number(tx.amount) > supportRefundLimit
                    const disabledByState = tx.status !== "Paid"
                    const disabled = disabledByPermission || disabledByFlag || disabledByRule || disabledByState || busy
                    console.log({
                        canRefund,
                        refundsEnabled,
                        role,
                        amount: tx.amount,
                        supportRefundLimit,
                        status: tx.status,
                    })
                    const reason = disabledByPermission
                        ? "No permission to refund"
                        : disabledByFlag
                            ? "Refunds feature is disabled"
                            : disabledByRule
                                ? `Support can refund only amounts ≤ ${supportRefundLimit}`
                                : disabledByState
                                    ? "Only paid transactions can be refunded"
                                    : busy
                                        ? "Refund in progress"
                                        : "Refund this transaction"

                    const style: React.CSSProperties = {
                        border: "1px solid rgb(var(--border))",
                        background: disabled ? "rgb(var(--panel-2))" : "rgb(var(--panel))",
                        opacity: disabled ? 0.55 : 1,
                        cursor: disabled ? "not-allowed" : "pointer",
                    }

                    return (
                        <WriteGuard
                            reason={disabledByFlag ? "Refunds feature is disabled" : "Maintenance mode: refunds disabled"}>
                            <button
                                className="relative rounded-xl px-3 py-2 text-xs font-medium w-[110px] flex items-center justify-center"
                                style={style}
                                disabled={disabled}
                                title={reason}
                                type="button"
                                onClick={() => setConfirmTx(tx)}
                            >
                                <span className="relative">
                                  <span className={busy ? "opacity-0" : "opacity-100"}>
                                    Refund
                                  </span>
                                  <span className={`absolute inset-0 flex items-center justify-center ${busy ? "opacity-100" : "opacity-0"}`}>
                                    Refunding…
                                  </span>
                                </span>
                            </button>
                        </WriteGuard>
                    )
                },
            },
        ],
        [actingId, canRefund, refundsEnabled, role, supportRefundLimit]
    )

    return (
        <div className="space-y-4">
            <Header/>

            <SectionCard>
                <DataTableToolbar
                    filters={[
                        {
                            key: "status",
                            label: "Status",
                            value: status,
                            onChange: (v) => write({page: 1, search: v}),
                            options: [
                                {label: "Any", value: ""},
                                {label: "Paid", value: "Paid"},
                                {label: "Refunded", value: "Refunded"},
                                {label: "Failed", value: "Failed"},
                            ],
                        },
                    ]}
                />

                {loading ? (
                    <DataTableState kind="loading"/>
                ) : err ? (
                    <DataTableState kind="error" message={err} onRetry={load}/>
                ) : items.length === 0 ? (
                    <DataTableState kind="empty" title="No transactions"/>
                ) : (
                    <>
                        <DataTable columns={columns} data={items} sorting={sort} onSortingChange={onSortingChange}/>
                        <DataTablePagination
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={(p) => write({page: p})}
                            onPageSizeChange={(s) => write({page: 1, pageSize: s})}
                        />
                    </>
                )}
            </SectionCard>

            <ConfirmDialog
                open={Boolean(confirmTx)}
                title="Issue refund?"
                description={
                    confirmTx ? `Refund transaction ${confirmTx.id} for $${Number(confirmTx.amount).toFixed(2)}.` : ""
                }
                confirmText="Refund"
                cancelText="Cancel"
                danger
                requireText={confirmTx ? confirmTx.id : undefined}
                busy={actingId === confirmTx?.id}
                onClose={() => setConfirmTx(null)}
                onConfirm={async () => {
                    if (!confirmTx) return
                    if (!canRefund) {
                        toast.error("Not allowed", "Your current role cannot refund transactions")
                        setConfirmTx(null)
                        return
                    }
                    await onRefund(confirmTx)
                    setConfirmTx(null)
                }}
            />
        </div>
    )
}
