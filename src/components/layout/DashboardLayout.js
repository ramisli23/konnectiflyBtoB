import { Outlet } from "react-router-dom"

import Sidebar, { SidebarItem } from "./Sidebar"

import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Package,
  Receipt,
  Settings,
  LifeBuoy,
  BookOpen,
  ShieldCheck,
} from "lucide-react"

/* =====================================================
   LIENS DE LA SIDEBAR
   ===================================================== */

export const DASHBOARD_LINKS = [
  { to: "/dashboard", text: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/packages", text: "Packages", icon: BarChart3 },
  { to: "/dashboard/orders", text: "Orders", icon: Receipt },
  { to: "/dashboard/invoices", text: "Invoices", icon: FileText },
  { to: "/dashboard/credits", text: "Credits", icon: Package },
]

export const DASHBOARD_LINKS_SECONDARY = [
  { to: "/dashboard/settings", text: "Settings", icon: Settings },
  { to: "/dashboard/guide", text: "Guide", icon: BookOpen },
  { to: "/dashboard/policy", text: "Policy", icon: ShieldCheck },
  { to: "/dashboard/help", text: "Help", icon: LifeBuoy },
]

/* =====================================================
   LAYOUT — espace connecté (sidebar + contenu)
   ===================================================== */

export default function DashboardLayout({ user, onLogout }) {
  const renderLink = (link) => (
    <SidebarItem
      key={link.to}
      to={link.to}
      end={link.end}
      alert={link.alert}
      icon={<link.icon size={20} />}
      text={link.text}
    />
  )

  return (
    <div className="App flex">
      <Sidebar user={user} onLogout={onLogout}>
        {DASHBOARD_LINKS.map(renderLink)}

        <hr className="my-3" />

        {DASHBOARD_LINKS_SECONDARY.map(renderLink)}
      </Sidebar>

      <main className="main-content">
        {/* `user` est transmis aux pages enfants via le contexte Outlet */}
        <Outlet context={{ user }} />
      </main>
    </div>
  )
}