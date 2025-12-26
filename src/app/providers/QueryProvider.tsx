import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query"
import { QueryErrorResetBoundary } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"
import { useMemo } from "react"
import { useToast } from "../../shared/ui/Toast"

type Props = {
    children: React.ReactNode
}

function ErrorFallback({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary: () => void }) {
    const message = error instanceof Error ? error.message : "Something went wrong"
    return (
        <div className="min-h-screen grid place-items-center p-6">
            <div className="w-full max-w-md rounded-2xl border p-5">
                <div className="text-lg font-semibold">Unexpected error</div>
                <div className="mt-2 text-sm opacity-80">{message}</div>
                <button
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium"
                    onClick={resetErrorBoundary}
                    type="button"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}

export default function QueryProvider({ children }: Props) {
    const { push } = useToast()

    const client = useMemo(() => {
        return new QueryClient({
            queryCache: new QueryCache({
                onError: (error) => {
                    const message = error instanceof Error ? error.message : "Request failed"
                    push({ kind: "error", title: "Request error", message })
                }
            }),
            mutationCache: new MutationCache({
                onError: (error) => {
                    const message = error instanceof Error ? error.message : "Request failed"
                    push({ kind: "error", title: "Action failed", message })
                }
            }),
            defaultOptions: {
                queries: {
                    retry: 1,
                    staleTime: 60_000,
                    refetchOnWindowFocus: false
                },
                mutations: {
                    retry: 0
                }
            }
        })
    }, [push])

    return (
        <QueryClientProvider client={client}>
            <QueryErrorResetBoundary>
                {({ reset }) => (
                    <ErrorBoundary onReset={reset} fallbackRender={({ error, resetErrorBoundary }) => (
                        <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
                    )}>
                        {children}
                    </ErrorBoundary>
                )}
            </QueryErrorResetBoundary>
        </QueryClientProvider>
    )
}
