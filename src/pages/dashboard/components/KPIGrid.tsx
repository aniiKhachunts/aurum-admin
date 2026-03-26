import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect } from "react"

function AnimatedNumber({ value }: { value: number }) {
    const motionValue = useMotionValue(0)
    const spring = useSpring(motionValue, { stiffness: 80, damping: 20 })
    const display = useTransform(spring, (latest) =>
        Math.round(latest).toLocaleString()
    )

    useEffect(() => {
        motionValue.set(value)
    }, [value])

    return <motion.span>{display}</motion.span>
}

function SkeletonCard() {
    return (
        <div className="rounded-2xl p-5 animate-pulse"
             style={{
                 background: "rgba(255,255,255,0.04)",
                 border: "1px solid rgba(255,255,255,0.06)",
             }}>
            <div className="h-3 w-20 bg-white/10 rounded mb-3"/>
            <div className="h-6 w-28 bg-white/10 rounded mb-2"/>
            <div className="h-3 w-24 bg-white/10 rounded"/>
        </div>
    )
}

type KPIItem = {
    label: string
    value: number | null
    display: string
    hint: string
}

type Props = {
    kpi: KPIItem[]
    loading: boolean
    gradients: string[]
}

export function KPIGrid({ kpi, loading, gradients }: Props) {
    if (loading) {
        return Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
    }

    return kpi.map((x, i) => (
        <div key={x.label}
             className="group relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
             style={{
                 background: "rgba(255,255,255,0.02)",
                 backdropFilter: "blur(16px)",
                 border: "1px solid rgba(255,255,255,0.08)",
                 boxShadow: "0 15px 50px rgba(0,0,0,0.45)",
             }}>
            <div className="absolute inset-0 opacity-60 pointer-events-none"
                 style={{
                     background: `radial-gradient(500px circle at 0% 0%, ${gradients[i]}, transparent 45%)`,
                 }}
            />

            <div className="text-[11px] uppercase tracking-[0.12em]"
                 style={{ color: "rgba(255,255,255,0.55)" }}>
                {x.label}
            </div>

            <div className="mt-2 text-3xl font-semibold">
                {typeof x.value === "number"
                    ? <AnimatedNumber value={x.value} />
                    : x.display}
            </div>

            <div className="mt-2 text-xs opacity-70">{x.hint}</div>
        </div>
    ))
}