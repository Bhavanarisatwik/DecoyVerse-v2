import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"

export function DashboardLayout() {
    return (
        <div className="flex h-screen bg-black-900">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto bg-black-900 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
