import { Navigate, Outlet, useLocation } from "react-router-dom"

/**
 * Guarde les routes privées.
 *
 * - `authStatus === "checking"`  → écran de chargement
 * - `authStatus === "anonymous"` → redirection vers /login
 * - sinon                        → laisse passer la route
 */
export default function RequireAuth({ authStatus, redirectTo = "/login" }) {
  const location = useLocation()

  if (authStatus === "checking") {
    return (
      <div className="route-loader" role="status" aria-live="polite">
        Chargement…
      </div>
    )
  }

  if (authStatus === "anonymous") {
    // `state.from` permet de revenir à la page demandée après connexion
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return <Outlet />
}

/**
 * Variante pour une seule route (pas de layout imbriqué).
 */
export function RequireAuthElement({ authStatus, redirectTo = "/login", children }) {
  const location = useLocation()

  if (authStatus === "checking") {
    return (
      <div className="route-loader" role="status" aria-live="polite">
        Chargement…
      </div>
    )
  }

  if (authStatus === "anonymous") {
    return <Navigate to={redirectTo} replace state={{ from: location }} />
  }

  return children
}