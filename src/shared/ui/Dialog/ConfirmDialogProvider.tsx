import { useMemo, useState } from "react"
import { ConfirmDialogContext, type ConfirmFn, type ConfirmOptions } from "./confirmDialogContext"

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [opts, setOpts] = useState<ConfirmOptions | null>(null)
    const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null)

    const confirm = useMemo<ConfirmFn>(
        () => (o) =>
            new Promise<boolean>((resolve) => {
                setOpts(o)
                setResolver(() => resolve)
                setOpen(true)
            }),
        []
    )

    function close(v: boolean) {
        setOpen(false)
        resolver?.(v)
        setResolver(null)
        setOpts(null)
    }

    return (
        <ConfirmDialogContext.Provider value={confirm}>
            {children}

            {open && opts ? (
                <div className="fixed inset-0 z-50 grid place-items-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => close(false)} />
                    <div className="relative w-full max-w-md rounded-2xl border bg-background p-5 shadow-sm">
                        {opts.title ? <div className="text-lg font-semibold">{opts.title}</div> : null}
                        <div className="mt-2 text-sm opacity-80">{opts.message}</div>
                        <div className="mt-5 flex justify-end gap-2">
                            <button className="h-10 rounded-xl border px-4 text-sm font-medium" onClick={() => close(false)} type="button">
                                {opts.cancelText ?? "Cancel"}
                            </button>
                            <button className="h-10 rounded-xl border px-4 text-sm font-medium" onClick={() => close(true)} type="button">
                                {opts.confirmText ?? "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </ConfirmDialogContext.Provider>
    )
}
