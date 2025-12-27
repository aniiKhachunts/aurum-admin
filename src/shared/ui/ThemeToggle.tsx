import { useTheme } from "../hooks/useTheme"

export function ThemeToggle() {
    const { theme, toggle } = useTheme()

    return (
        <button
            type="button"
            className="rounded-xl px-3 py-2 text-sm font-medium"
            style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))" }}
            onClick={toggle}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
            {theme === "dark" ? "Dark" : "Light"}
        </button>
    )
}
