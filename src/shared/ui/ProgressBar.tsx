type Props = { value: number }

export function ProgressBar({ value }: Props) {
    const v = Math.max(0, Math.min(100, Math.round(value)))
    return (
        <div
            className="h-2 w-[160px] rounded-full"
            style={{ background: "rgb(var(--panel-2))", border: "1px solid rgb(var(--border))" }}
        >
            <div
                className="h-full rounded-full"
                style={{
                    width: `${v}%`,
                    background: "rgb(var(--brand))",
                }}
            />
        </div>
    )
}
