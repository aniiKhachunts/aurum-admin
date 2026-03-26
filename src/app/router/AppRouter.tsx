import {Navigate, Route, Routes} from "react-router-dom"
import {AppShell} from "../layout/AppShell"
import {RequireAuth} from "./RequireAuth"
import LoginPage from "../../features/auth/pages/LoginPage"
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage"
import SessionExpiredPage from "../../features/auth/pages/SessionExpiredPage"
import PermissionsPlaygroundPage from "../../features/team-roles/pages/PermissionsPlaygroundPage.tsx";
import DashboardPage from "../../pages/DashboardPage.tsx";
import UsersPage from "../../pages/UsersPage.tsx";
import UserDetailPage from "../../pages/UserDetailPage.tsx";
import OrganizationsPage from "../../pages/OrganizationsPage.tsx";
import TransactionsPage from "../../pages/TransactionsPage.tsx";
import AiJobsPage from "../../pages/AiJobsPage.tsx";
import AiJobDetailPage from "../../pages/AiJobDetailPage.tsx";
import AuditPage from "../../pages/AuditPage.tsx";
import SettingsPage from "../../pages/SettingsPage.tsx";
import {FeatureGuard} from "./FeatureGuard.tsx";

export function AppRouter() {
    return (
        <Routes>
             <Route path="/login" element={<LoginPage/>}/>
             <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
             <Route path="/session-expired" element={<SessionExpiredPage/>}/>
             <Route element={<RequireAuth/>}>
                <Route element={<AppShell/>}>
                    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                    <Route path="/dashboard" element={<DashboardPage/>}/>
                    <Route path="/team-roles/permissions" element={<PermissionsPlaygroundPage/>}/>

                    <Route path="/users" element={<UsersPage/>}/>
                    <Route path="/users/:id" element={<UserDetailPage/>}/>
                    <Route path="/organizations" element={<OrganizationsPage/>}/>
                    <Route path="/transactions" element={<TransactionsPage/>}/>

                    <Route element={<FeatureGuard feature="aiJobs"/>}>
                        <Route path="/ai-jobs" element={<AiJobsPage/>}/>
                        <Route path="/ai-jobs/:id" element={<AiJobDetailPage/>}/>
                    </Route>

                    <Route element={<FeatureGuard feature="audit"/>}>
                        <Route path="/audit" element={<AuditPage/>}/>
                    </Route>
                    <Route path="/settings" element={<SettingsPage/>}/>

                </Route>
            </Route>

            <Route path="*" element={<div className="p-6">Not found</div>}/>
        </Routes>
    )
}
