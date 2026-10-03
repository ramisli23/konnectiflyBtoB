import { useState, useEffect } from "react"
import "./App.css"

import Sidebar, { SidebarItem } from "./components/layout/Sidebar"
import Dashboard from "./components/pages/Dashboard/Dashboard"
import KonnectiFlyLanding from "./components/pages/landing/vitrine"
import AuthPage from "./components/pages/landing/AuthPage"

import {
  getAgencyProfile,
  getAuthToken,
  clearAuthToken,
  getCachedProfile,
  saveCachedProfile,
  clearCachedProfile,
} from "./services/Api"

import {
  LayoutDashboard,
  BarChart3,
  UserCircle,
  Package,
  Settings,
  LifeBuoy, BookOpen,      // Guide
  ShieldCheck, 
} from "lucide-react"


function App() {
  // 'checking' | 'landing' | 'auth' | 'dashboard'
  const [view, setView] = useState("checking")

  const [user, setUser] = useState(null)

  const [activePage, setActivePage] = useState("Dashboard")


  /* =====================================================
     RESTORE SESSION
     ===================================================== */

  useEffect(() => {
    const token = getAuthToken()

    if (!token) {
      setView("landing")
      return
    }

    const cached = getCachedProfile()

    if (cached) {
      setUser({
        ...cached,
        token,
      })

      setView("dashboard")
    }

    getAgencyProfile(token)
      .then((profile) => {
        saveCachedProfile(profile)

        setUser({
          ...profile,
          token,
        })

        setView("dashboard")
      })
      .catch(() => {
        clearAuthToken()
        clearCachedProfile()

        setUser(null)

        setView("landing")
      })
  }, [])


  /* =====================================================
     LOGOUT
     ===================================================== */

  const logout = () => {
    clearAuthToken()
    clearCachedProfile()

    setUser(null)

    setView("landing")
  }


  /* =====================================================
     CHECKING
     ===================================================== */

  if (view === "checking") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "system-ui, sans-serif",
          color: "#64748b",
        }}
      >
        Chargement…
      </div>
    )
  }


  /* =====================================================
     LANDING PAGE
     ===================================================== */

  if (view === "landing") {
    return (
      <KonnectiFlyLanding
        user={user}
        onLogin={() => setView("auth")}
        onLogout={logout}
      />
    )
  }


  /* =====================================================
     AUTH PAGE
     ===================================================== */

  if (view === "auth") {
    return (
      <AuthPage
        onBack={() => setView("landing")}
        onAuthenticated={(loggedInUser) => {
          setUser(loggedInUser)
          setView("dashboard")
        }}
      />
    )
  }


  /* =====================================================
     DASHBOARD
     ===================================================== */

  return (
    <div className="App flex">

      <Sidebar
        user={user}
        onLogout={logout}
      >

        {/* ================================================
            DASHBOARD
            ================================================ */}

        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={activePage === "Dashboard"}
          onClick={() => setActivePage("Dashboard")}
        />


        {/* ================================================
            PACKAGES
            ================================================ */}

        <SidebarItem
          icon={<BarChart3 size={20} />}
          text="Packages"
          active={activePage === "Packages"}
          onClick={() => setActivePage("Packages")}
        />


        {/* ================================================
            DEALERS
            ================================================ */}

        <SidebarItem
          icon={<UserCircle size={20} />}
          text="Dealers"
          alert
          active={activePage === "Dealers"}
          onClick={() => setActivePage("Dealers")}
        />


        {/* ================================================
            CREDITS
            ================================================ */}

        <SidebarItem
          icon={<Package size={20} />}
          text="Credits"
          active={activePage === "Credits"}
          onClick={() => setActivePage("Credits")}
        />


        <hr className="my-3" />


        {/* ================================================
            SETTINGS
            ================================================ */}

        <SidebarItem
          icon={<Settings size={20} />}
          text="Settings"
          active={activePage === "Settings"}
          onClick={() => setActivePage("Settings")}
        />

  <SidebarItem
          icon={<BookOpen size={20} />}
          text="Guide"
          active={activePage === "Guide"}
          onClick={() => setActivePage("Guide")}
        />
        <SidebarItem
          icon={<ShieldCheck size={20} />}
          text="Policy"
          active={activePage === "Policy"}
          onClick={() => setActivePage("Policy")}
        />
        {/* ================================================
            HELP
            ================================================ */}

        <SidebarItem
          icon={<LifeBuoy size={20} />}
          text="Help"
          active={activePage === "Help"}
          onClick={() => setActivePage("Help")}
        />

      </Sidebar>


      {/* ===================================================
          MAIN CONTENT
          =================================================== */}

      <main className="main-content">

        <Dashboard
          page={activePage}
          user={user}
          onLogout={logout}
        />

      </main>

    </div>
  )
}


export default App