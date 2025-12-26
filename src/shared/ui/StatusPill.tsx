type Tone = "neutral" | "success" | "warn" | "danger" | "info"

const tones: Record<Tone, { fg: string; bg: string; bd: string }> = {
    neutral: { fg: "rgb(var(--muted))", bg: "rgb(var(--panel-2))", bd: "rgb(var(--border))" },
    success: { fg: "rgb(var(--success))", bg: "rgba(16,185,129,0.12)", bd: "rgba(16,185,129,0.30)" },
    warn: { fg: "rgb(var(--warn))", bg: "rgba(245,158,11,0.12)", bd: "rgba(245,158,11,0.30)" },
    danger: { fg: "rgb(var(--danger))", bg: "rgba(239,68,68,0.12)", bd: "rgba(239,68,68,0.30)" },
    info: { fg: "rgb(var(--info))", bg: "rgba(59,130,246,0.12)", bd: "rgba(59,130,246,0.30)" },
}

type Props = {
    label: string
    tone?: StatusTone
}

export type StatusTone = "success" | "info" | "warn" | "danger" | "neutral"

export function StatusPill({ label, tone = "neutral" }: Props) {
    const t = tones[tone]
    return (
        <span
            className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
                color: t.fg,
                background: t.bg,
                border: `1px solid ${t.bd}`,
            }}
        >
      <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: t.fg }}
      />
            {label}
    </span>
    )
}
