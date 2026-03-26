import {useDashboardData} from "./hooks/useDashboardData"
import {KPIGrid} from "./components/KPIGrid"
import {RevenueChart} from "./components/RevenueChart"
import {JobsChart} from "./components/JobsChart"
import {ActivityList} from "./components/ActivityList"
import {fmtCompact, fmtUsd} from "./utils/formatters.ts"
import {Header} from "../../shared/ui/Header.tsx";
import {SectionCard} from "../../shared/ui/SectionCard.tsx";

export default function DashboardPage() {
    const {
        overview,
        revenue,
        jobsSeries,
        events,
        totals,
        loading,
    } = useDashboardData()

    const kpi = [
        {
            label: "Total users",
            value: overview?.users.total ?? null,
            display: overview ? fmtCompact(overview.users.total) : "—",
            hint: "Accounts in system",
        },
        {
            label: "AI jobs",
            value: overview?.aiJobs.total ?? null,
            display: overview ? fmtCompact(overview.aiJobs.total) : "—",
            hint: overview ? `${overview.aiJobs.failed} failed` : "—",
        },
        {
            label: "Transactions",
            value: overview?.billing.totalTransactions ?? null,
            display: overview ? fmtCompact(overview.billing.totalTransactions) : "—",
            hint: overview ? `${overview.billing.refunded} refunded` : "—",
        },
        {
            label: "Revenue (30d)",
            value: revenue.length ? totals.revenue30 : null,
            display: revenue.length ? fmtUsd(totals.revenue30) : "—",
            hint: revenue.length ? `Refunds: ${fmtUsd(totals.refunds30)}` : "—",
        },
    ]

    const gradients = [
        "rgba(96,165,250,0.25)",
        "rgba(168,85,247,0.25)",
        "rgba(34,197,94,0.25)",
        "rgba(236,72,153,0.25)",
    ]

    return (
        <div className="space-y-2">

            <Header
                title="Operations Dashboard"
                subtitle="AI pipelines, billing health, and system activity."
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KPIGrid kpi={kpi} loading={loading} gradients={gradients}/>
            </div>

            <SectionCard title="Revenue & refunds (30 days)">
                <RevenueChart data={revenue}/>
            </SectionCard>

            <SectionCard title="AI job flow (30 days)">
                <JobsChart data={jobsSeries}/>
            </SectionCard>

            <SectionCard title="Recent activity">
                <ActivityList events={events}/>
            </SectionCard>

        </div>
    )
}