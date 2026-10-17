import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useOutletContext,
} from "react-router-dom";

import "./App.css";

import DashboardLayout from "./components/layout/DashboardLayout";
import RequireAuth from "./components/layout/RequireAuth";

import { DashboardHome, SettingsPage, HelpPage } from "./components/pages/Dashboard/Dashboard";

import BuyPackages from "./components/pages/Packages/BuyPackage.js";
import CountryRoute from "./components/pages/Packages/CountryRoute.js";
import Dealers from "./components/pages/Dealers/Dealers.js";
import Credits from "./components/pages/Credits/credits.js";
import Guide from "./Guide/guide.js";
import Policy from "./policy/CommunicationPolicy.js";

import KonnectiFlyLanding from "./components/pages/landing/vitrine";
import AuthPage from "./components/pages/landing/AuthPage";

import {
  getAgencyProfile,
  getAuthToken,
  clearAuthToken,
  getCachedProfile,
  saveCachedProfile,
  clearCachedProfile,
} from "./services/Api";

/* =====================================================
   PAGE 404
   ===================================================== */

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="route-loader">
      <h1>404</h1>

      <p>Cette page n&apos;existe pas.</p>

      <button
        type="button"
        className="route-loader-btn"
        onClick={() => navigate("/", { replace: true })}
      >
        Retour à l&apos;accueil
      </button>
    </div>
  );
}

/* =====================================================
   PAGES PUBLIQUES
   ===================================================== */

function LandingRoute({ user, onLogin, onLogout }) {
  return (
    <KonnectiFlyLanding
      user={user}
      onLogin={onLogin}
      onLogout={onLogout}
    />
  );
}

function LoginRoute({ onAuthenticated }) {
  const navigate = useNavigate();

  // Page d'origine mémorisée par RequireAuth (redirection après connexion)
  const { from } = useLocation();

  return (
    <AuthPage
      initialMode="login"
      onBack={() => navigate("/")}
      onAuthenticated={(loggedInUser) => {
        onAuthenticated(loggedInUser);

        const target =
          from && typeof from.pathname === "string" && !from.pathname.includes("/login")
            ? from.pathname
            : "/dashboard";

        navigate(target, { replace: true });
      }}
    />
  );
}

/* =====================================================
   APP — COQUILLE + ROUTES
   ===================================================== */

function App() {
  // 'checking' | 'authenticated' | 'anonymous'
  const [authStatus, setAuthStatus] = useState("checking");

  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  /* =====================================================
     RESTORE SESSION
     ===================================================== */

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setAuthStatus("anonymous");
      return;
    }

    const cached = getCachedProfile();

    if (cached) {
      setUser({ ...cached, token });
      setAuthStatus("authenticated");
    }

    getAgencyProfile(token)
      .then((profile) => {
        saveCachedProfile(profile);

        setUser({ ...profile, token });
        setAuthStatus("authenticated");
      })
      .catch(() => {
        clearAuthToken();
        clearCachedProfile();

        setUser(null);
        setAuthStatus("anonymous");
      });
  }, []);

  /* =====================================================
     LOGIN / LOGOUT
     ===================================================== */

  const handleAuthenticated = (loggedInUser) => {
    setUser(loggedInUser);
    setAuthStatus("authenticated");
  };

  const logout = () => {
    clearAuthToken();
    clearCachedProfile();

    setUser(null);
    setAuthStatus("anonymous");

    navigate("/", { replace: true });
  };

  /* =====================================================
     ROUTES
     ===================================================== */

  return (
    <Routes>
      {/* ---------- PUBLIC ---------- */}

      <Route
        path="/"
        element={
          <LandingRoute
            user={user}
            onLogin={() => navigate("/login")}
            onLogout={logout}
          />
        }
      />

      <Route
        path="/login"
        element={<LoginRoute onAuthenticated={handleAuthenticated} />}
      />

      {/* ---------- PRIVÉ ---------- */}

      <Route element={<RequireAuth authStatus={authStatus} />}>
        <Route
          path="/dashboard"
          element={
            <DashboardLayout user={user} onLogout={logout} />
          }
        >
          <Route index element={<DashboardRoute />} />
          <Route path="packages" element={<BuyPackages />} />
          <Route path="packages/:scope/:id" element={<CountryRoute />} />
          <Route path="dealers" element={<DealersRoute />} />
          <Route path="credits" element={<CreditsRoute />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="guide" element={<GuideRoute />} />
          <Route path="policy" element={<PolicyRoute />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Route>

      {/* ---------- REDIRECTIONS & 404 ---------- */}

      <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/* =====================================================
   PAGES PRIVÉES — récupèrent `user` via Outlet context
   ===================================================== */

function DashboardRoute() {
  const { user } = useOutletContext();
  return <DashboardHome user={user} />;
}

function DealersRoute() {
  const navigate = useNavigate();
  return <Dealers onBack={() => navigate("/dashboard")} />;
}

function CreditsRoute() {
  const navigate = useNavigate();
  return <Credits onBack={() => navigate("/dashboard")} />;
}

function GuideRoute() {
  const navigate = useNavigate();
  return <Guide onBack={() => navigate("/dashboard")} />;
}

function PolicyRoute() {
  const navigate = useNavigate();
  return <Policy onBack={() => navigate("/dashboard")} />;
}

export default App;