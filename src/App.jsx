import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth, can } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import Permissions from "./pages/Permissions.jsx";
import GateLog from "./pages/GateLog.jsx";
import Attendance from "./pages/Attendance.jsx";
import Inbox from "./pages/Inbox.jsx";
import Reports from "./pages/Reports.jsx";
import Roles from "./pages/Roles.jsx";

const HOME = { warden: "/", guard: "/gate", cr: "/attendance", student: "/permissions" };

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ action, children }) {
  const { user } = useAuth();
  if (!can(user, action)) return <Navigate to={HOME[user?.role] || "/"} replace />;
  return children;
}

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={HOME[user?.role] || "/"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<RoleRoute action="inbox"><Dashboard /></RoleRoute>} />
            <Route path="students" element={<RoleRoute action="manageStudents"><Students /></RoleRoute>} />
            <Route path="students/:id" element={<RoleRoute action="manageStudents"><StudentProfile /></RoleRoute>} />
            <Route path="permissions" element={<Permissions />} />
            <Route path="gate" element={<RoleRoute action="gateLog"><GateLog /></RoleRoute>} />
            <Route path="attendance" element={<RoleRoute action="attendance"><Attendance /></RoleRoute>} />
            <Route path="reports" element={<RoleRoute action="reports"><Reports /></RoleRoute>} />
            <Route path="inbox" element={<RoleRoute action="inbox"><Inbox /></RoleRoute>} />
            <Route path="roles" element={<RoleRoute action="assignCR"><Roles /></RoleRoute>} />
          </Route>
          <Route path="*" element={<RoleHome />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
