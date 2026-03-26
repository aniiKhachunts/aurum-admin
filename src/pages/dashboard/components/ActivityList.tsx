import {
    formatActivity,
    formatTimeAgo,
    getActivityIcon
} from "../utils/formatters"
import type {AuditEventDto} from "../../../mock/seed/types.ts";

type Props = {
    events: AuditEventDto[]
}

export function ActivityList({ events }: Props) {
    if (!events.length) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center"
                 style={{ color: "rgba(255,255,255,0.5)" }}>
                <div className="text-2xl mb-2">🕒</div>
                <div className="text-sm font-medium">No recent activity</div>
            </div>
        )
    }

    return events.map((e: AuditEventDto, i: number) => {
        const f = formatActivity(e)
        const icon = getActivityIcon(e.action)

        return (
            <div key={e.id ?? i}
                 className="rounded-xl p-2 m-2"
                 style={{
                     background: "rgba(255,255,255,0.04)",
                     border: "1px solid rgba(255,255,255,0.06)",
                 }}>
                <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                        <div>{icon}</div>
                        <div>
                            <div>{f.title}</div>
                            <div className="text-xs opacity-60">
                                {f.entity}
                            </div>
                        </div>
                    </div>

                    <div className="text-xs opacity-50 flex items-center">
                        {formatTimeAgo(e.createdAt)}
                    </div>
                </div>
            </div>
        )
    })
}