import { Routes, Route, Navigate } from "react-router-dom";
import AdminLoginPage from "./pages/Login";
import AdminLayout from "./pages/AdminLayout";
import ProtectedRoute  from "./ProtectedRoute";

const App = () => {
  

  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/*" element={<AdminLayout />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default App;
