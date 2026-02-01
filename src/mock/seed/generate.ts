import type {SeedOrg, SeedTransaction, SeedUser, SeedRole, SeedUserStatus} from "./types"
import type {AiJob, AiJobStatus} from "./aiTypes.ts";
import type {AuditEvent} from "./auditTypes.ts";
import type {AppSettings} from "./settingsTypes.ts";

function isoDaysAgo(days: number) {
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function pick<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)]
}

function id(prefix: string, n: number) {
    return `${prefix}_${String(n).padStart(4, "0")}`
}

const firstNames = ["Ani", "Mila", "Arman", "David", "Lia", "Noah", "Emma", "Leo", "Nare", "Sona", "Mark", "Iva"]
const lastNames = ["Khachunts", "Petrosyan", "Hakobyan", "Smith", "Brown", "Taylor", "Garcia", "Lee", "Kim", "Ivanov"]

const tagsPool = ["vip", "kyc", "high-risk", "trial", "priority", "enterprise", "beta"]

const jobStatuses: AiJobStatus[] = ["Queued", "Running", "Paused", "Failed", "Completed", "Canceled"]

export type SeedDb = {
    orgs: SeedOrg[]
    users: SeedUser[]
    transactions: SeedTransaction[]
    aiJobs: AiJob[]
    audit: AuditEvent[]
    settings: AppSettings
}

export function generateSeed(): SeedDb {
    const orgs: SeedOrg[] = [
        {
            id: "org_demo",
            name: "Aurum Labs",
            plan: "enterprise",
            seatsUsed: 18,
            seatsTotal: 25,
            createdAt: isoDaysAgo(320),
        },
        {
            id: "org_0002",
            name: "Northwind AI",
            plan: "pro",
            seatsUsed: 7,
            seatsTotal: 10,
            createdAt: isoDaysAgo(210),
        },
        {
            id: "org_0003",
            name: "FluxOps Studio",
            plan: "free",
            seatsUsed: 2,
            seatsTotal: 3,
            createdAt: isoDaysAgo(80),
        },
    ]

    const roles: SeedRole[] = ["owner", "admin", "analyst", "support", "viewer"]
    const statuses: SeedUserStatus[] = ["Active", "Active", "Active", "Invited", "Suspended", "Deactivated"]

    const users: SeedUser[] = Array.from({length: 64}).map((_, i) => {
        const fn = pick(firstNames)
        const ln = pick(lastNames)
        const org = pick(orgs)
        const role = pick(roles)
        const status = pick(statuses)
        const createdAgo = 10 + Math.floor(Math.random() * 400)
        const lastActiveAgo = Math.floor(Math.random() * 35)

        const tagsCount = Math.random() < 0.5 ? 0 : 1 + Math.floor(Math.random() * 3)
        const tags = Array.from({length: tagsCount}).map(() => pick(tagsPool))

        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@demo.com`

        return {
            id: id("u", i + 1),
            name: `${fn} ${ln}`,
            email,
            role,
            status,
            orgId: org.id,
            tags: Array.from(new Set(tags)),
            createdAt: isoDaysAgo(createdAgo),
            lastActiveAt: isoDaysAgo(lastActiveAgo),
        }
    })

    const transactions: SeedTransaction[] = Array.from({length: 120}).map((_, i) => {
        const org = pick(orgs)
        const u = pick(users.filter((x) => x.orgId === org.id))
        const status = pick(["Paid", "Paid", "Paid", "Failed", "Refunded"] as const)
        const provider = pick(["Stripe", "Paypal"] as const)
        const createdAgo = Math.floor(Math.random() * 120)
        const base = 20 + Math.floor(Math.random() * 480)
        const amount = Math.round(base * 100) / 100

        return {
            id: id("tx", i + 1),
            orgId: org.id,
            userId: u.id,
            amount,
            currency: "USD",
            status,
            provider,
            createdAt: isoDaysAgo(createdAgo),
        }
    })

    const aiJobs: AiJob[] = Array.from({length: 48}).map((_, i) => {
        const org = pick(orgs)
        const creator = pick(users.filter((u) => u.orgId === org.id))
        const status = pick(jobStatuses)
        const createdAgo = 2 + Math.floor(Math.random() * 60)
        const updatedAgo = Math.floor(Math.random() * 8)
        const progress =
            status === "Completed" ? 100 : status === "Failed" || status === "Canceled" ? 100 : Math.floor(Math.random() * 95)

        const startedAt = isoDaysAgo(createdAgo - 1)
        const endedAt = status === "Running" || status === "Queued" || status === "Paused" ? undefined : isoDaysAgo(updatedAgo)

        return {
            id: id("job", i + 1),
            name: `Ingestion Pipeline #${i + 1}`,
            status,
            model: pick(["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1", "o3-mini"] as const),
            priority: pick(["low", "normal", "high"] as const),
            progress,
            createdAt: isoDaysAgo(createdAgo),
            updatedAt: isoDaysAgo(updatedAgo),
            orgId: org.id,
            createdBy: creator.id,
            dataset: pick(["creators_q4", "payments_risk", "support_tickets", "audit_rollups", "media_index"] as const),
            tokensBudget: 2_000_000 + Math.floor(Math.random() * 10_000_000),
            costCapUsd: 50 + Math.floor(Math.random() * 400),
            runs: [
                {
                    id: id("run", i + 1),
                    startedAt,
                    endedAt,
                    outcome: endedAt ? status : undefined,
                },
            ],
        }
    })

    const audit: AuditEvent[] = Array.from({length: 40}).map((_, i) => {
        const actor = pick(users)
        const entityType = pick(["user", "transaction", "ai_job", "settings"] as const)
        const entityId =
            entityType === "user"
                ? pick(users).id
                : entityType === "transaction"
                    ? pick(transactions).id
                    : entityType === "ai_job"
                        ? pick(aiJobs).id
                        : "settings_global"

        return {
            id: id("ae", i + 1),
            createdAt: isoDaysAgo(Math.floor(Math.random() * 30)),
            actorId: actor.id,
            actorRole: actor.role,
            action: pick(["Created", "Updated", "Started", "Paused", "Canceled", "Refunded"] as const),
            entityType,
            entityId,
            meta: {source: "seed"},
        }
    })

    const settings: AppSettings = {
        maintenanceMode: false,
        features: { aiJobs: true, refunds: true, audit: true },
        controls: { supportRefundLimit: 200, maxAiConcurrentRuns: 3 },
    }

    return { orgs, users, transactions, aiJobs, audit, settings }
}
