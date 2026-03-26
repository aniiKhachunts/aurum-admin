export type ThemeMode = "light" | "dark"

const KEY = "aurum_theme"
const THEME_EVENT = "aurum-theme-change"

export function getInitialTheme(): ThemeMode {
    const saved = localStorage.getItem(KEY)
    if (saved === "light" || saved === "dark") return saved

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    return prefersDark ? "dark" : "light"
}

export function getTheme(): ThemeMode {
    const current = document.documentElement.dataset.theme
    if (current === "light" || current === "dark") return current
    return getInitialTheme()
}

export function applyTheme(mode: ThemeMode) {
    document.documentElement.dataset.theme = mode
    localStorage.setItem(KEY, mode)
    window.dispatchEvent(new CustomEvent<ThemeMode>(THEME_EVENT, { detail: mode }))
}

export function subscribeTheme(callback: () => void) {
    const onThemeChange = () => callback()
    const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) callback()
    }

    window.addEventListener(THEME_EVENT, onThemeChange)
    window.addEventListener("storage", onStorage)

    return () => {
        window.removeEventListener(THEME_EVENT, onThemeChange)
        window.removeEventListener("storage", onStorage)
    }
}