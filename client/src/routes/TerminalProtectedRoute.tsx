import { Navigate, Outlet } from "react-router-dom";
import { useTerminalAuth } from "../context/TerminalAuthContext";

export function TerminalProtectedRoute() {
  const { worker } = useTerminalAuth();
  if (!worker) return <Navigate to="/terminal" replace />;
  return <Outlet />;
}
