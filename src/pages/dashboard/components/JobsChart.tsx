import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts"
import {formatDateLabel, getTooltipStyles} from "../utils/formatters"
import {useTheme} from "../../../shared/hooks/useTheme"
import type {ThemeMode} from "../../../shared/lib/theme"

const STATUS_CONFIG = [
    {key: "queued", label: "Queued", color: "#3b82f6"},
    {key: "running", label: "Running", color: "#8b5cf6"},
    {key: "paused", label: "Paused", color: "#f59e0b"},
    {key: "completed", label: "Completed", color: "#22c55e"},
    {key: "failed", label: "Failed", color: "#ef4444"},
    {key: "canceled", label: "Canceled", color: "#64748b"},
] as const

type TooltipItem = {
    dataKey?: string
    value?: number
}

type JobsTooltipProps = {
    active?: boolean
    payload?: readonly TooltipItem[]
    label?: string | number
    theme: ThemeMode
}

function JobsTooltip({active, payload, label, theme}: JobsTooltipProps) {
    if (!active || !payload || payload.length === 0) return null

    const styles = getTooltipStyles(theme)

    const map = Object.fromEntries(
        payload.map((p) => [p.dataKey as string, Number(p.value ?? 0)])
    )

    return (
        <div
            className="min-w-[180px] rounded-xl p-3"
            style={{
                ...styles.container,
                pointerEvents: "none",
            }}
        >
            <div className={`mb-2 text-xs ${styles.title}`}>
                {new Date(String(label ?? "")).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                })}
            </div>

            {STATUS_CONFIG.map((s) => {
                const value = map[s.key] ?? 0
                if (value === 0) return null

                return (
                    <div key={s.key} className="flex justify-between text-sm">
                        <span style={{color: s.color}}>{s.label}</span>
                        <span className={`font-semibold ${styles.text}`}>{value}</span>
                    </div>
                )
            })}
        </div>
    )
}

type JobPoint = {
    date: string
    queued: number
    running: number
    paused: number
    completed: number
    failed: number
    canceled: number
}

type Props = {
    data: JobPoint[]
}

export function JobsChart({data}: Props) {
    const {theme} = useTheme()
    const isDark = theme === "dark"

    return (
        <div className="h-[320px]">
            <ResponsiveContainer>
                <BarChart key={theme} data={data} barSize={22}>
                    <CartesianGrid
                        stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"}
                        vertical={false}
                    />

                    <XAxis dataKey="date" tickFormatter={formatDateLabel}/>

                    <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]}/>

                    <Tooltip
                        content={(props) => <JobsTooltip {...props} theme={theme}/>}
                        cursor={{
                            fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                        }}
                        isAnimationActive={false}
                    />

                    <Legend
                        formatter={(value) => {
                            const item = STATUS_CONFIG.find((s) => s.key === value)
                            return item?.label || value
                        }}
                    />

                    {[...STATUS_CONFIG].reverse().map((s) => (
                        <Bar
                            key={s.key}
                            dataKey={s.key}
                            stackId="jobs"
                            fill={s.color}
                            isAnimationActive={false}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}