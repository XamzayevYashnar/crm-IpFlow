import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TerminalAuthProvider } from "./context/TerminalAuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { TerminalProtectedRoute } from "./routes/TerminalProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import Movements from "./pages/Movements";
import Employees from "./pages/Employees";
import Workers from "./pages/Workers";
import Products from "./pages/Products";
import Operations from "./pages/Operations";
import TerminalLogin from "./pages/terminal/TerminalLogin";
import TerminalHome from "./pages/terminal/TerminalHome";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/terminal/*"
          element={
            <TerminalAuthProvider>
              <Routes>
                <Route path="/" element={<TerminalLogin />} />
                <Route element={<TerminalProtectedRoute />}>
                  <Route path="/home" element={<TerminalHome />} />
                </Route>
              </Routes>
            </TerminalAuthProvider>
          }
        />

        <Route
          path="*"
          element={
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/materials" element={<Materials />} />
                    <Route path="/materials/movements" element={<Movements />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/workers" element={<Workers />} />
                    <Route path="/models" element={<Products />} />
                    <Route path="/operations" element={<Operations />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
