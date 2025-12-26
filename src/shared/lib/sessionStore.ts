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

export const useSessionStore = create<SessionState>((set) => ({
    isAuthed: false,
    email: null,
    userId: null,
    orgId: null,
    role: "admin",

    login: (email) =>
        set({
            isAuthed: true,
            email,
            userId: "u_demo",
            orgId: "org_demo",
        }),

    logout: () =>
        set({
            isAuthed: false,
            email: null,
            userId: null,
            orgId: null,
            role: "admin",
        }),

    setRole: (role) => set({ role }),
}))
