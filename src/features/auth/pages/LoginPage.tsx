import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AuthLayout } from "../components/AuthLayout.tsx"
import { useSessionStore } from "../../../shared/lib/sessionStore.ts"

const schema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const login = useSessionStore((s) => s.login)

    const [serverError, setServerError] = useState<string | null>(null)
    const from = useMemo(() => {
        const state = location.state as { from?: string } | null
        return state?.from || "/"
    }, [location.state])

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
        mode: "onSubmit",
    })

    async function onSubmit(values: FormValues) {
        setServerError(null)

        await new Promise((r) => setTimeout(r, 600))

        const blocked = values.email.toLowerCase().endsWith("@blocked.com")
        if (blocked) {
            setServerError("This email domain is not allowed.")
            return
        }

        login(values.email)
        navigate(from, { replace: true })
    }

    const inputStyle: React.CSSProperties = {
        background: "rgb(var(--panel))",
        border: "1px solid rgb(var(--border))",
        borderRadius: "12px",
        outline: "none",
    }

    const focusStyle: React.CSSProperties = {
        boxShadow: `0 0 0 4px rgba(${getComputedStyle(document.documentElement).getPropertyValue("--ring") || "99 102 241"}, 0.18)`,
    }

    return (
        <AuthLayout
            title="Sign in"
            subtitle="Use your admin credentials to access internal systems."
        >
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                        Email
                    </label>
                    <input
                        type="email"
                        autoComplete="email"
                        className="w-full px-3 py-2 text-sm"
                        style={inputStyle}
                        {...register("email")}
                        onFocus={(e) => {
                            e.currentTarget.style.boxShadow = focusStyle.boxShadow as string
                            e.currentTarget.style.borderColor = "rgba(var(--ring), 0.55)"
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.boxShadow = "none"
                            e.currentTarget.style.borderColor = "rgb(var(--border))"
                        }}
                    />
                    {errors.email ? (
                        <div className="mt-1 text-xs" style={{ color: "rgb(var(--danger))" }}>
                            {errors.email.message}
                        </div>
                    ) : null}
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium" style={{ color: "rgb(var(--muted))" }}>
                        Password
                    </label>
                    <input
                        type="password"
                        autoComplete="current-password"
                        className="w-full px-3 py-2 text-sm"
                        style={inputStyle}
                        {...register("password")}
                        onFocus={(e) => {
                            e.currentTarget.style.boxShadow = focusStyle.boxShadow as string
                            e.currentTarget.style.borderColor = "rgba(var(--ring), 0.55)"
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.boxShadow = "none"
                            e.currentTarget.style.borderColor = "rgb(var(--border))"
                        }}
                    />
                    {errors.password ? (
                        <div className="mt-1 text-xs" style={{ color: "rgb(var(--danger))" }}>
                            {errors.password.message}
                        </div>
                    ) : null}
                </div>

                {serverError ? (
                    <div
                        className="rounded-xl px-3 py-2 text-sm"
                        style={{
                            background: "rgba(239,68,68,0.10)",
                            border: "1px solid rgba(239,68,68,0.30)",
                            color: "rgb(var(--danger))",
                        }}
                    >
                        {serverError}
                    </div>
                ) : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl px-4 py-2 text-sm font-medium transition-opacity"
                    style={{
                        background: "rgb(var(--brand))",
                        color: "white",
                        opacity: isSubmitting ? 0.7 : 1,
                        boxShadow: "var(--sh-sm)",
                    }}
                >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                </button>

                <div className="flex items-center justify-between text-xs">
                    <Link to="/forgot-password" style={{ color: "rgb(var(--muted))" }}>
                        Forgot password?
                    </Link>
                    <span style={{ color: "rgb(var(--muted))" }}>
            Tip: try <span style={{ color: "rgb(var(--text))" }}>anything@demo.com</span>
          </span>
                </div>
            </form>
        </AuthLayout>
    )
}
