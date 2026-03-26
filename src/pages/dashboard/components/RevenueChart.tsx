import {
    Area, AreaChart, CartesianGrid,
    Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts"
import { fmtUsd, fmtCompact, formatDateLabel } from "../utils/formatters"

function RevenueTooltip({ active, payload, label }: any) {
    if (!active || !payload || !payload.length) return null

    const map = Object.fromEntries(
        payload.map((p: any) => [p.dataKey, p.value])
    )

    const CONFIG = [
        { key: "revenueUsd", label: "Revenue", color: "rgb(var(--brand))" },
        { key: "refundsUsd", label: "Refunds", color: "rgb(var(--danger))" },
    ]

    return (
        <div
            className="min-w-[180px] rounded-xl p-3"
            style={{
                background: "rgba(15,15,20,0.6)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                pointerEvents: "none",
                transition: "none",
            }}
        >
            <div className="mb-2 text-xs text-white/50">
                {new Date(label).toLocaleDateString()}
            </div>

            {CONFIG.map((item) => {
                const value = map[item.key]
                if (value == null) return null

                return (
                    <div key={item.key} className="flex justify-between text-sm">
                        <span style={{ color: item.color }}>{item.label}</span>
                        <span className="font-semibold">
                            {fmtUsd(value)}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

type RevenuePoint = {
    date: string
    revenueUsd: number
    refundsUsd: number
    txCount: number
}

type Props = {
    data: RevenuePoint[]
}

export function RevenueChart({ data }: Props) {
    return (
        <div className="h-[320px]">
            <ResponsiveContainer>
                <AreaChart data={data}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false}/>
                    <XAxis dataKey="date" tickFormatter={formatDateLabel}/>
                    <YAxis tickFormatter={(v) => fmtCompact(Number(v))}/>
                    <Tooltip
                        content={<RevenueTooltip />}
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        wrapperStyle={{ transition: "none" }}
                    />
                    <Legend/>

                    <Area dataKey="revenueUsd" name="Revenue"
                          stroke="rgb(var(--brand))" fillOpacity={0.3}/>

                    <Area dataKey="refundsUsd" name="Refunds"
                          stroke="rgb(var(--danger))"/>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}