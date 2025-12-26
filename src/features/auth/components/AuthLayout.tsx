import type {ReactNode} from "react"
import { Link } from "react-router-dom"

type Props = {
    title: string
    subtitle?: string
    children: ReactNode
}

export function AuthLayout({ title, subtitle, children }: Props) {
    return (
        <div className="min-h-screen px-4 py-10" style={{ background: "rgb(var(--bg))" }}>
            <div className="mx-auto w-full max-w-md">
                <div className="mb-8 flex items-center justify-between">
                    <Link to="/" className="text-sm font-semibold tracking-wide">
                        Aurum Admin
                    </Link>
                    <span
                        className="text-[11px] px-2 py-1 rounded-full"
                        style={{
                            color: "rgb(var(--muted))",
                            border: "1px solid rgb(var(--border))",
                            background: "rgb(var(--panel))",
                        }}
                    >
            Secure
          </span>
                </div>

                <div
                    className="rounded-2xl p-6"
                    style={{
                        background: "rgb(var(--panel))",
                        border: "1px solid rgb(var(--border))",
                        boxShadow: "var(--sh-md)",
                    }}
                >
                    <div className="mb-6">
                        <h1 className="text-xl font-semibold">{title}</h1>
                        {subtitle ? (
                            <p className="mt-1 text-sm" style={{ color: "rgb(var(--muted))" }}>
                                {subtitle}
                            </p>
                        ) : null}
                    </div>

                    {children}
                </div>

                <div className="mt-6 text-center text-xs" style={{ color: "rgb(var(--muted))" }}>
                    Admin surfaces only. All activity is logged.
                </div>
            </div>
        </div>
    )
}
