export type ThemeMode = "light" | "dark"

const KEY = "aurum_theme"

export function getInitialTheme(): ThemeMode {
    const saved = localStorage.getItem(KEY)
    if (saved === "light" || saved === "dark") return saved
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    return prefersDark ? "dark" : "light"
}

export function applyTheme(mode: ThemeMode) {
    document.documentElement.dataset.theme = mode
    localStorage.setItem(KEY, mode)
}
