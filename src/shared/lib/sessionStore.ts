import { create } from "zustand"
import type { Role } from "./permissions"

type SessionState = {
    isAuthed: boolean
    email: string | null
    userId: string | null
    orgId: string | null
    role: Role

    login: (email: string) => void
    logout: () => void
    setRole: (role: Role) => void
}

type Persisted = {
    isAuthed: boolean
    email: string | null
    userId: string | null
    orgId: string | null
    role: Role
}

const KEY = "aurum_session"

function readPersisted(): Persisted {
    try {
        const raw = localStorage.getItem(KEY)
        if (!raw) {
            return { isAuthed: false, email: null, userId: null, orgId: null, role: "Admin" }
        }
        const v = JSON.parse(raw) as Partial<Persisted>
        const role = v.role ?? "Admin"
        return {
            isAuthed: Boolean(v.isAuthed),
            email: v.email ?? null,
            userId: v.userId ?? null,
            orgId: v.orgId ?? null,
            role,
        }
    } catch {
        return { isAuthed: false, email: null, userId: null, orgId: null, role: "Admin" }
    }
}

function writePersisted(p: Persisted) {
    localStorage.setItem(KEY, JSON.stringify(p))
}

export const useSessionStore = create<SessionState>((set, get) => {
    const initial = readPersisted()

    return {
        ...initial,

        login: (email) => {
            const next: Persisted = {
                isAuthed: true,
                email,
                userId: "u_demo",
                orgId: "org_demo",
                role: get().role,
            }
            writePersisted(next)
            set(next)
        },

        logout: () => {
            const next: Persisted = {
                isAuthed: false,
                email: null,
                userId: null,
                orgId: null,
                role: get().role,
            }
            writePersisted(next)
            set(next)
        },

        setRole: (role) => {
            const s = get()
            const next: Persisted = {
                isAuthed: s.isAuthed,
                email: s.email,
                userId: s.userId,
                orgId: s.orgId,
                role,
            }
            writePersisted(next)
            set({ role })
        },
    }
})
