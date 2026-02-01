import { http, HttpResponse } from "msw"
import type { Tx } from "../../features/transactions/api/transactionsApi"
import type { User } from "../../features/users/api/usersApi"
import { getDb } from "../seed/db"
import type {AiJob} from "../seed/aiTypes.ts";

type Db = {
    users: User[]
    aiJobs: AiJob[]
    transactions: Tx[]
}

function dayKey(d: Date) {
    return d.toISOString().slice(0, 10)
}

function lastNDays(n: number) {
    const out: string[] = []
    const now = new Date()
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        out.push(dayKey(d))
    }
    return out
}

type RevenueRow = {
    date: string
    revenueUsd: number
    refundsUsd: number
    txCount: number
}

type JobsRow = {
    date: string
    Queued: number
    Running: number
    Paused: number
    Failed: number
    Completed: number
    Canceled: number
}

export const analyticsHandlers = [
    http.get("/api/analytics/overview", () => {
        const db = getDb() as Db

        const totalUsers = db.users.length
        const totalJobs = db.aiJobs.length
        const totalTx = db.transactions.length
        const refunded = db.transactions.filter((t: Tx) => t.status === "Refunded").length
        const failedJobs = db.aiJobs.filter((j: AiJob) => j.status === "Failed").length

        return HttpResponse.json({
            users: { total: totalUsers },
            aiJobs: { total: totalJobs, failed: failedJobs },
            billing: { totalTransactions: totalTx, refunded },
        })
    }),

    http.get("/api/analytics/revenue-30d", () => {
        const db = getDb() as Db
        const days = lastNDays(30)

        const map = new Map<string, RevenueRow>()
        days.forEach((k) => map.set(k, { date: k, revenueUsd: 0, refundsUsd: 0, txCount: 0 }))

        db.transactions.forEach((t: Tx) => {
            const k = String(t.createdAt).slice(0, 10)
            const row = map.get(k)
            if (!row) return
            row.txCount += 1
            if (t.status === "Paid") row.revenueUsd += Number(t.amount) || 0
            if (t.status === "Refunded") row.refundsUsd += Number(t.amount) || 0
        })

        const series = days.map((k) => map.get(k)!)
        return HttpResponse.json({ series })
    }),

    http.get("/api/analytics/ai-jobs-30d", () => {
        const db = getDb() as Db
        const days = lastNDays(30)

        const map = new Map<string, JobsRow>()
        days.forEach((k) =>
            map.set(k, {
                date: k,
                Queued: 0,
                Running: 0,
                Paused: 0,
                Failed: 0,
                Completed: 0,
                Canceled: 0,
            })
        )

        db.aiJobs.forEach((j: AiJob) => {
            const k = String(j.createdAt).slice(0, 10)
            const row = map.get(k)
            if (!row) return
            row[j.status] += 1
        })

        const series = days.map((k) => map.get(k)!)
        return HttpResponse.json({ series })
    }),
]
