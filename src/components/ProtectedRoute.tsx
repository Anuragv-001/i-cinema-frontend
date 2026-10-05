import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  adminOnly = false,
}: ProtectedRouteProps) {
  const location = useLocation();

  const token = localStorage.getItem("iCinemaToken");

  if (!token) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{
          returnTo: location.pathname,
          message: "Please sign in to continue.",
        }}
      />
    );
  }

  if (adminOnly) {
    const currentUser = localStorage.getItem("iCinemaCurrentUser");

    let role = "";

    try {
      if (currentUser) {
        const user = JSON.parse(currentUser);
        role = user.role || "";
      }
    } catch {
      role = "";
    }

    if (role !== "ADMIN") {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}