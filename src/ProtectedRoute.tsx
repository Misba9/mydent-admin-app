import react from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute: React.FC = () => {
    const isAdmin =
        localStorage.getItem("token") && localStorage.getItem("role") === "admin";
    return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default ProtectedRoute;