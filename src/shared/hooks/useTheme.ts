import { useEffect, useMemo, useState } from "react"
import { applyTheme, getInitialTheme, type ThemeMode } from "../lib/theme"

export function useTheme() {
    const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme())

    useEffect(() => {
        applyTheme(theme)
    }, [theme])

    const api = useMemo(() => {
        return {
            theme,
            setTheme,
            toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        }
    }, [theme])

    return api
}
