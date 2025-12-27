import { useNavigate } from "react-router-dom"
import { SectionCard } from "../shared/ui/SectionCard"
import {Header} from "../shared/ui/Header.tsx";

export default function FeatureDisabledPage() {
    const navigate = useNavigate()
    return (
        <div className="space-y-4">
            <Header />
            <SectionCard>
                <div className="flex items-center justify-between">
                    <div className="text-sm" style={{ color: "rgb(var(--muted))" }}>
                        Ask an admin to enable it in Settings.
                    </div>
                    <button
                        className="rounded-xl px-3 py-2 text-sm font-medium"
                        style={{ border: "1px solid rgb(var(--border))", background: "rgb(var(--panel-2))" }}
                        onClick={() => navigate("/settings")}
                    >
                        Go to Settings
                    </button>
                </div>
            </SectionCard>
        </div>
    )
}
