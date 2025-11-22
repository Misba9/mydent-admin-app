import { Routes, Route, Navigate } from "react-router-dom";
import AdminLoginPage from "./pages/Login";
import AdminLayout from "./pages/AdminLayout";

const App = () => {
  const isAdmin =
    localStorage.getItem("token") && localStorage.getItem("role") === "admin";

  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/*"
        element={
          isAdmin ? <AdminLayout /> : <Navigate to="/admin/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default App;
