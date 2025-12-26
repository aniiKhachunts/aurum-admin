import './App.css'
import {AppRouter} from "./app/router/AppRouter";
import {useEffect} from "react";
import {useSettingsStore} from "./shared/lib/settingsStore.ts";
import {ToastViewport} from "./shared/ui/Toast/ToastViewport.tsx";

function App() {
    const load = useSettingsStore((s) => s.load)

    useEffect(() => {
        load()
    }, [load])

    return (
        <>
            <AppRouter/>
            <ToastViewport/>
        </>
    )
}

export default App
