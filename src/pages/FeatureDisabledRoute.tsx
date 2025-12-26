import { useLocation } from "react-router-dom"
import FeatureDisabledPage from "./FeatureDisabledPage"

export default function FeatureDisabledRoute() {
    const location = useLocation()
    const feature = (location.state as any)?.feature
    const title = feature === "aiJobs" ? "AI Jobs" : feature === "audit" ? "Audit" : "Feature"
    return <FeatureDisabledPage title={title} />
}
