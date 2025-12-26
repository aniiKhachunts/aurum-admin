import { BrowserRouter } from "react-router-dom"
import QueryProvider from "./QueryProvider"
import { ToastProvider } from "../../shared/ui/Toast"
import { ConfirmDialogProvider } from "../../shared/ui/Dialog"
import { SideDrawerProvider } from "../../shared/ui/SideDrawer"

export default function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <ConfirmDialogProvider>
                <SideDrawerProvider>
                    <QueryProvider>
                        <BrowserRouter>{children}</BrowserRouter>
                    </QueryProvider>
                </SideDrawerProvider>
            </ConfirmDialogProvider>
        </ToastProvider>
    )
}
