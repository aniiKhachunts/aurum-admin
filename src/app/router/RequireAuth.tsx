import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSessionStore } from "../../shared/lib/sessionStore"

export function RequireAuth() {
    const isAuthed = useSessionStore((s) => s.isAuthed)
    const location = useLocation()

    if (!isAuthed) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    return <Outlet />
}
