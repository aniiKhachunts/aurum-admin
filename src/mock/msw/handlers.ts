import {http, HttpResponse} from "msw"
import {getDb} from "../seed/db"
import {addAudit, listAudit} from "../../server/db/auditDb"
import {analyticsHandlers} from "../handlers/analyticsHandlers.ts";
import {parseSortParam} from "../../shared/lib/tableUrlState.ts";

function parseNumber(v: string | null, fallback: number) {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
}

function contains(hay: string, needle: string) {
    return hay.toLowerCase().includes(needle.toLowerCase())
}

function actorRole(request: Request) {
    return request.headers.get("x-role") || "viewer"
}

function compare(a: any, b: any, dir: "asc" | "desc") {
    const x = a ?? ""
    const y = b ?? ""
    const res = String(x).localeCompare(String(y), undefined, {numeric: true, sensitivity: "base"})
    return dir === "asc" ? res : -res
}

function parseSort(sortParam: string | null): { id: string; desc: boolean }[] {
    if (!sortParam) return []
    try {
        const decoded = decodeURIComponent(sortParam)
        const parts = decoded.split(",").map((s) => s.trim()).filter(Boolean)
        return parts.map((p) => {
            const [id, dir] = p.split(":")
            return {id, desc: (dir || "asc").toLowerCase() === "desc"}
        })
    } catch {
        return []
    }
}

function toCompatAudit(a: any) {
    return {
        id: a.id,
        createdAt: a.ts,
        actorId: "u_demo",
        actorRole: a.actorRole,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        meta: a.meta || {},
    }
}

export const handlers = [
    ...analyticsHandlers,
    http.get("/api/organizations", () => {
        const {orgs} = getDb()
        return HttpResponse.json({items: orgs})
    }),

    http.get("/api/users", ({request}) => {
        const {users} = getDb()
        const url = new URL(request.url)
        const page = parseNumber(url.searchParams.get("page"), 1)
        const pageSize = parseNumber(url.searchParams.get("pageSize"), 20)
        const search = (url.searchParams.get("search") || "").trim()
        const status = (url.searchParams.get("status") || "").trim()
        const sortParam = url.searchParams.get("sort")
        const sort = parseSort(sortParam)

        let items = users.slice()

        if (search) items = items.filter((u) => contains(u.name, search) || contains(u.email, search))
        if (status) items = items.filter((u) => u.status === status)

        if (sort.length) {
            const {id, desc} = sort[0]
            items = items.slice().sort((a: any, b: any) => compare(a[id], b[id], desc ? "desc" : "asc"))
        }

        const total = items.length
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const pageItems = items.slice(start, end)

        return HttpResponse.json({items: pageItems, page, pageSize, total})
    }),

    http.get("/api/users/:id", ({params}) => {
        const {users} = getDb()
        const u = users.find((x) => x.id === params.id)
        if (!u) return HttpResponse.json({message: "User not found", code: "NOT_FOUND"}, {status: 404})
        return HttpResponse.json({item: u})
    }),

    http.patch("/api/users/:id", async ({params, request}) => {
        const db = getDb()
        const u = db.users.find((x) => x.id === params.id)
        if (!u) return HttpResponse.json({message: "User not found", code: "NOT_FOUND"}, {status: 404})

        const prev = {...u}

        const body = (await request.json()) as Partial<{
            name: string
            role: string
            tags: string[]
            status: string
        }>

        if (typeof body.name === "string") u.name = body.name
        if (typeof body.role === "string") u.role = body.role as any
        if (Array.isArray(body.tags)) u.tags = body.tags as any
        if (typeof body.status === "string") u.status = body.status as any

        addAudit({
            actorRole: actorRole(request),
            action: "users.update",
            entityType: "user",
            entityId: String(params.id),
            meta: {fields: Object.keys(body || {}), prevStatus: prev.status, nextStatus: u.status},
        })

        return HttpResponse.json({item: u})
    }),

    http.post("/api/users/invite", async ({request}) => {
        const db = getDb()
        const body = (await request.json()) as { email: string; role: string }

        const email = (body.email || "").trim().toLowerCase()
        if (!email) return HttpResponse.json({message: "Email is required", code: "VALIDATION"}, {status: 400})

        if (email.endsWith("@blocked.com")) {
            return HttpResponse.json({message: "This email domain is blocked", code: "DOMAIN_BLOCKED"}, {status: 400})
        }

        const exists = db.users.some((u) => u.email.toLowerCase() === email)
        if (exists) {
            return HttpResponse.json({message: "User already exists", code: "ALREADY_EXISTS"}, {status: 409})
        }

        const id = `u_${String(db.users.length + 1).padStart(4, "0")}`
        const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())
        const now = new Date().toISOString()

        const newUser = {
            id,
            name,
            email,
            role: (body.role as any) || "viewer",
            status: "Invited",
            orgId: "org_demo",
            tags: [],
            createdAt: now,
            lastActiveAt: now,
        }

        db.users.unshift(newUser as any)

        addAudit({
            actorRole: actorRole(request),
            action: "users.invite",
            entityType: "user",
            entityId: id,
            meta: {email, role: newUser.role, status: "Invited"},
        })

        return HttpResponse.json({item: newUser}, {status: 201})
    }),

    http.post("/api/users/:id/suspend", ({params, request}) => {
        const db = getDb()
        const u = db.users.find((x) => x.id === params.id)
        if (!u) return HttpResponse.json({message: "User not found", code: "NOT_FOUND"}, {status: 404})

        const prevStatus = u.status
        u.status = "Suspended"

        addAudit({
            actorRole: actorRole(request),
            action: "users.suspend",
            entityType: "user",
            entityId: String(params.id),
            meta: {prevStatus, nextStatus: "Suspended"},
        })

        return HttpResponse.json({item: u})
    }),

    http.post("/api/users/:id/deactivate", ({params, request}) => {
        const db = getDb()
        const u = db.users.find((x) => x.id === params.id)
        if (!u) return HttpResponse.json({message: "User not found", code: "NOT_FOUND"}, {status: 404})

        const prevStatus = u.status
        u.status = "Deactivated"

        addAudit({
            actorRole: actorRole(request),
            action: "users.deactivate",
            entityType: "user",
            entityId: String(params.id),
            meta: {prevStatus, nextStatus: "Deactivated"},
        })

        return HttpResponse.json({item: u})
    }),

    http.get("/api/transactions", ({request}) => {
        const {transactions} = getDb()
        const url = new URL(request.url)
        const page = parseNumber(url.searchParams.get("page"), 1)
        const pageSize = parseNumber(url.searchParams.get("pageSize"), 20)
        const status = (url.searchParams.get("status") || "").trim()

        let items = transactions.slice()
        if (status) items = items.filter((t) => t.status === status)

        const total = items.length
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const pageItems = items.slice(start, end)

        return HttpResponse.json({items: pageItems, page, pageSize, total})
    }),

    http.post("/api/transactions/:id/refund", ({params, request}) => {
        const db = getDb()
        const t = db.transactions.find((x) => x.id === params.id)
        if (!t) return HttpResponse.json({message: "Transaction not found", code: "NOT_FOUND"}, {status: 404})

        if (t.status === "Refunded") {
            return HttpResponse.json({message: "Already refunded", code: "ALREADY_REFUNDED"}, {status: 409})
        }

        if (t.status !== "Paid") {
            return HttpResponse.json({
                message: "Only paid transactions can be refunded",
                code: "INVALID_STATE"
            }, {status: 400})
        }

        const prev = {...t}
        t.status = "Refunded"

        addAudit({
            actorRole: actorRole(request),
            action: "transactions.refund",
            entityType: "transaction",
            entityId: String(params.id),
            meta: {prevStatus: prev.status, nextStatus: "refunded", amount: prev.amount},
        })

        return HttpResponse.json({item: t})
    }),

    http.get("/api/ai/jobs", ({request}) => {
        const {aiJobs} = getDb()
        const url = new URL(request.url)

        const status = (url.searchParams.get("status") || "").trim()
        const page = parseNumber(url.searchParams.get("page"), 1)
        const pageSize = parseNumber(url.searchParams.get("pageSize"), 20)

        const sortRaw = url.searchParams.get("sort") || ""
        const sort = parseSortParam(sortRaw)

        let items = aiJobs.slice()

        if (status) items = items.filter((j) => j.status === status)

        if (sort.length) {
            const s = sort[0]
            const id = String(s.id)
            const desc = Boolean(s.desc)

            items.sort((a, b) => {
                const av = (a as Record<string, unknown>)[id]
                const bv = (b as Record<string, unknown>)[id]

                if (av == null && bv == null) return 0
                if (av == null) return desc ? 1 : -1
                if (bv == null) return desc ? -1 : 1

                if (typeof av === "number" && typeof bv === "number") return desc ? bv - av : av - bv
                const as = String(av)
                const bs = String(bv)
                return desc ? bs.localeCompare(as) : as.localeCompare(bs)
            })
        }

        const total = items.length
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const pageItems = items.slice(start, end)

        return HttpResponse.json({items: pageItems, page, pageSize, total})
    }),

    http.get("/api/ai/jobs/:id", ({params}) => {
        const {aiJobs} = getDb()
        const item = aiJobs.find((j) => j.id === params.id)
        if (!item) return HttpResponse.json({message: "Job not found", code: "NOT_FOUND"}, {status: 404})
        return HttpResponse.json({item})
    }),

    http.post("/api/ai/jobs/:id/start", ({params, request}) => {
        const db = getDb()
        const job = db.aiJobs.find((j) => j.id === params.id)
        if (!job) return HttpResponse.json({message: "Job not found", code: "NOT_FOUND"}, {status: 404})

        if (job.status === "Completed" || job.status === "Canceled") {
            return HttpResponse.json({message: "Job cannot be started", code: "INVALID_STATE"}, {status: 400})
        }

        const prevStatus = job.status
        job.status = "Running"
        job.updatedAt = new Date().toISOString()
        job.runs.unshift({id: `run_${Date.now()}`, startedAt: new Date().toISOString()})

        addAudit({
            actorRole: actorRole(request),
            action: "ai_jobs.start",
            entityType: "ai_job",
            entityId: job.id,
            meta: {prevStatus, nextStatus: "Running"},
        })

        return HttpResponse.json({item: job})
    }),

    http.post("/api/ai/jobs/:id/pause", ({params, request}) => {
        const db = getDb()
        const job = db.aiJobs.find((j) => j.id === params.id)
        if (!job) return HttpResponse.json({message: "Job not found", code: "NOT_FOUND"}, {status: 404})

        if (job.status !== "Running") {
            return HttpResponse.json({message: "Only running jobs can be paused", code: "INVALID_STATE"}, {status: 400})
        }

        const prevStatus = job.status
        job.status = "Paused"
        job.updatedAt = new Date().toISOString()

        addAudit({
            actorRole: actorRole(request),
            action: "ai_jobs.pause",
            entityType: "ai_job",
            entityId: job.id,
            meta: {prevStatus, nextStatus: "paused"},
        })

        return HttpResponse.json({item: job})
    }),

    http.post("/api/ai/jobs/:id/cancel", ({params, request}) => {
        const db = getDb()
        const job = db.aiJobs.find((j) => j.id === params.id)
        if (!job) return HttpResponse.json({message: "Job not found", code: "NOT_FOUND"}, {status: 404})

        if (job.status === "Completed" || job.status === "Canceled") {
            return HttpResponse.json({message: "Job cannot be canceled", code: "INVALID_STATE"}, {status: 400})
        }

        const prevStatus = job.status
        job.status = "Canceled"
        job.progress = 100
        job.updatedAt = new Date().toISOString()

        addAudit({
            actorRole: actorRole(request),
            action: "ai_jobs.cancel",
            entityType: "ai_job",
            entityId: job.id,
            meta: {prevStatus, nextStatus: "canceled"},
        })

        return HttpResponse.json({item: job})
    }),

    http.get("/api/audit/events", ({request}) => {
        const url = new URL(request.url)

        const entityType = (url.searchParams.get("entityType") || "").trim()
        const entityId = (url.searchParams.get("entityId") || "").trim()
        const action = (url.searchParams.get("action") || "").trim()
        const q = (url.searchParams.get("q") || "").trim().toLowerCase()
        const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || 100)))

        let items = listAudit({limit: 500}).map(toCompatAudit)

        if (entityType) items = items.filter((e: any) => e.entityType === entityType)
        if (entityId) items = items.filter((e: any) => e.entityId === entityId)
        if (action) items = items.filter((e: any) => e.action === action)

        if (q) {
            items = items.filter(
                (e: any) =>
                    String(e.actorId || "").toLowerCase().includes(q) ||
                    String(e.entityId || "").toLowerCase().includes(q) ||
                    String(e.actorRole || "").toLowerCase().includes(q) ||
                    String(e.action || "").toLowerCase().includes(q)
            )
        }

        items.sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt))

        return HttpResponse.json({items: items.slice(0, limit)})
    }),

    http.get("/api/settings", () => {
        const {settings} = getDb()
        return HttpResponse.json({item: settings})
    }),

    http.patch("/api/settings", async ({request}) => {
        const db = getDb()
        const patch = (await request.json()) as any

        db.settings = {
            ...db.settings,
            ...patch,
            features: {...db.settings.features, ...(patch.features || {})},
            controls: {...db.settings.controls, ...(patch.controls || {})},
        }

        addAudit({
            actorRole: actorRole(request),
            action: "settings.update",
            entityType: "settings",
            entityId: "global",
            meta: {keys: Object.keys(patch || {})},
        })

        return HttpResponse.json({item: db.settings})
    }),

    http.get("/api/audit", ({request}) => {
        const url = new URL(request.url)
        const entityType = url.searchParams.get("entityType") || ""
        const entityId = url.searchParams.get("entityId") || ""
        const limit = Number(url.searchParams.get("limit") || "50")

        const items = listAudit({
            entityType: entityType || undefined,
            entityId: entityId || undefined,
            limit: Number.isFinite(limit) ? limit : 50,
        })

        return HttpResponse.json({items})
    }),
]
