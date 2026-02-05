import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import AppProviders from "./app/providers/AppProviders"
import { startMsw } from "./mock/msw/start"
import {applyTheme, getInitialTheme} from "./shared/lib/theme.ts";

async function bootstrap() {
    await startMsw()
    applyTheme(getInitialTheme())

    async function enableMocks() {
        if (typeof window === "undefined") return

        const { worker } = await import("./mock/msw/browser")
        return worker.start({
            onUnhandledRequest: "bypass",
        })
    }

    enableMocks().then(() => {
        createRoot(document.getElementById("root")!).render(
            <StrictMode>
                <AppProviders>
                    <App/>
                </AppProviders>
            </StrictMode>
        )
    })
}

bootstrap()
