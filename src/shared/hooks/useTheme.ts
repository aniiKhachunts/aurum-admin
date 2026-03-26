import { useCallback, useSyncExternalStore } from "react"
import {
    applyTheme,
    getInitialTheme,
    getTheme,
    subscribeTheme,
    type ThemeMode,
} from "../lib/theme"

export function useTheme() {
    const theme = useSyncExternalStore(subscribeTheme, getTheme, getInitialTheme)

    const setTheme = useCallback((next: ThemeMode) => {
        applyTheme(next)
    }, [])

    const toggle = useCallback(() => {
        applyTheme(theme === "dark" ? "light" : "dark")
    }, [theme])

    return {
        theme,
        setTheme,
        toggle,
    }
}