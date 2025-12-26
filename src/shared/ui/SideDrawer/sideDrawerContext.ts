import { createContext, useContext } from "react"

export type SideDrawerApi = {
    open: (node: React.ReactNode) => void
    close: () => void
}

export const SideDrawerContext = createContext<SideDrawerApi | null>(null)

export function useSideDrawer() {
    const ctx = useContext(SideDrawerContext)
    if (!ctx) throw new Error("useSideDrawer must be used within SideDrawerProvider")
    return ctx
}
