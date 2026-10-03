import { Routes, Route, Navigate } from "react-router-dom"

import Dashboard from "../components/pages/Dashboard/Dashboard"


function AppRoutes({ user, onLogout }) {

  return (
    <Routes>

      {/* Dashboard */}

      <Route
        path="/dashboard"
        element={
          <Dashboard
            page="Dashboard"
            user={user}
            onLogout={onLogout}
          />
        }
      />


      {/* Packages */}

      <Route
        path="/packages"
        element={
          <Dashboard
            page="Packages"
            user={user}
            onLogout={onLogout}
          />
        }
      />


      {/* Dealers */}

      <Route
        path="/dealers"
        element={
          <Dashboard
            page="Dealers"
            user={user}
            onLogout={onLogout}
          />
        }
      />


      {/* Credits */}

      <Route
        path="/credits"
        element={
          <Dashboard
            page="Credits"
            user={user}
            onLogout={onLogout}
          />
        }
      />


      {/* Settings */}

      <Route
        path="/settings"
        element={
          <Dashboard
            page="Settings"
            user={user}
            onLogout={onLogout}
          />
        }
      />


      {/* Help */}

      <Route
        path="/help"
        element={
          <Dashboard
            page="Help"
            user={user}
            onLogout={onLogout}
          />
        }
      />


      {/* Unknown route */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  )
}


export default AppRoutes