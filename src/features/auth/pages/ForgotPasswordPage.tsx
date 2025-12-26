import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import { AuthLayout } from "../components/AuthLayout"

const schema = z.object({
    email: z.string().email("Enter a valid email"),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
    const [sentTo, setSentTo] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "" },
        mode: "onSubmit",
    })

    async function onSubmit(values: FormValues) {
        await new Promise((r) => setTimeout(r, 700))
        setSentTo(values.email)
    }

    const inputStyle: React.CSSProperties = {
        background: "rgb(var(--panel))",
        border: "1px solid rgb(var(--border))",
        borderRadius: "12px",
        outline: "none",
    }

    if (sentTo) {
        return (
            <AuthLayout
                title="Check your inbox"
                subtitle="If an account exists, you’ll receive a reset link."
            >
                <div
                    className="rounded-xl px-3 py-3 text-sm"
                    style={{
                        background: "rgba(59,130,246,0.10)",
                        border: "1px solid rgba(59,130,246,0.25)",
                        color: "rgb(var(--text))",
                    }}
                >
                    Email sent to <span className="font-medium">{sentTo}</span>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs">
                    <Link to="/login" style={{ color: "rgb(var(--muted))" }}>
                        Back to sign in
                    </Link>
                    <button
                        type="button"
                        className="text-xs"
                        style={{ color: "rgb(var(--muted))" }}
                        onClick={() => setSentTo(null)}
                    >
                        Try another email
                    </button>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Reset password"
            subtitle="Enter your email and we’ll send a reset link."
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
                    />
                    {errors.email ? (
                        <div className="mt-1 text-xs" style={{ color: "rgb(var(--danger))" }}>
                            {errors.email.message}
                        </div>
                    ) : null}
                </div>

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
                    {isSubmitting ? "Sending..." : "Send reset link"}
                </button>

                <div className="text-xs">
                    <Link to="/login" style={{ color: "rgb(var(--muted))" }}>
                        Back to sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    )
}
