import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminProtectedRoute() {
  const location = useLocation();

  const token = localStorage.getItem("iCinemaToken");
  const currentUser = localStorage.getItem("iCinemaCurrentUser");

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

  try {
    const user = JSON.parse(currentUser || "{}");

    if (user.role !== "ADMIN") {
      return <Navigate to="/" replace />;
    }
  } catch {
    localStorage.removeItem("iCinemaCurrentUser");
    localStorage.removeItem("iCinemaToken");
    localStorage.removeItem("iCinemaLoggedIn");

    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}