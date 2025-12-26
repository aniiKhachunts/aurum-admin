import { Link } from "react-router-dom"
import { AuthLayout } from "../components/AuthLayout"

export default function SessionExpiredPage() {
    return (
        <AuthLayout
            title="Session expired"
            subtitle="For your security, please sign in again."
        >
            <div
                className="rounded-xl px-3 py-3 text-sm"
                style={{
                    background: "rgba(245,158,11,0.12)",
                    border: "1px solid rgba(245,158,11,0.30)",
                    color: "rgb(var(--text))",
                }}
            >
                Your session is no longer valid.
            </div>

            <Link
                to="/login"
                className="mt-4 block w-full rounded-xl px-4 py-2 text-center text-sm font-medium"
                style={{
                    background: "rgb(var(--brand))",
                    color: "white",
                    boxShadow: "var(--sh-sm)",
                }}
            >
                Go to sign in
            </Link>
        </AuthLayout>
    )
}
