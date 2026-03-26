export function fmtUsd(n: number) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n)
}

export function fmtCompact(n: number) {
    return new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(n)
}

export function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    })
}

export function formatTimeAgo(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

export function formatActivity(e: any) {
    const actionMap: Record<string, string> = {
        "transactions.refund": "Refund issued",
        "transactions.create": "Transaction created",
        "ai_jobs.start": "AI job started",
        "ai_jobs.cancel": "AI job canceled",
        "ai_jobs.pause": "AI job paused",
        "ai_jobs.complete": "AI job completed",
    }

    const entityMap: Record<string, string> = {
        transaction: "Transaction",
        ai_job: "AI Job",
        user: "User",
    }

    return {
        title: actionMap[e.action] || e.action,
        entity: entityMap[e.entityType] || e.entityType,
    }
}

export function getActivityIcon(action: string) {
    if (action.includes("refund")) return "💸"
    if (action.includes("cancel")) return "✖"
    if (action.includes("start")) return "▶"
    if (action.includes("complete")) return "✔"
    return "•"
}

export function getTooltipStyles(theme: "light" | "dark") {
    const isDark = theme === "dark"

    return {
        container: {
            background: isDark
                ? "rgba(15,15,20,0.6)"
                : "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: isDark
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(0,0,0,0.06)",
            boxShadow: isDark
                ? "0 10px 30px rgba(0,0,0,0.3)"
                : "0 10px 25px rgba(0,0,0,0.08)",
        },
        title: isDark ? "text-white/50" : "text-black/60",
        text: isDark ? "text-white" : "text-black",
    }
}