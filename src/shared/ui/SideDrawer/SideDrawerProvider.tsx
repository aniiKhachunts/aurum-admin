import { useMemo, useState } from "react"
import { SideDrawerContext, type SideDrawerApi } from "./sideDrawerContext"

export function SideDrawerProvider({ children }: { children: React.ReactNode }) {
    const [content, setContent] = useState<React.ReactNode | null>(null)

    const api = useMemo<SideDrawerApi>(() => ({
        open: (c) => setContent(() => c),
        close: () => setContent(null),
    }), [])

    return (
        <SideDrawerContext.Provider value={api}>
            {children}
            {content ? (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" onClick={api.close} />
                    <div className="absolute right-0 top-0 h-full w-[420px] max-w-[90vw] border-l bg-background p-4 shadow-sm">
                        <div className="flex justify-end">
                            <button className="h-9 w-9 rounded-xl border" onClick={api.close} type="button">
                                ×
                            </button>
                        </div>
                        <div className="mt-3">{content}</div>
                    </div>
                </div>
            ) : null}
        </SideDrawerContext.Provider>
    )
}
