import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import MovieDetails from "./pages/MovieDetails";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import MyBookings from "./pages/MyBookings";
import About from "./pages/About";
import { ToastProvider } from "./components/ToastProvider";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNavbar from "./pages/AdminNavbar";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminMovies from "./pages/admin/AdminMovies";
import AdminTheatres from "./pages/admin/AdminTheatres";
import AdminScreens from "./pages/admin/AdminScreens";
import AdminShows from "./pages/admin/AdminShows";
import AdminBooking from "./pages/admin/AdminBooking";
import AdminPayments from "./pages/admin/AdminPayments";
import AIChat from "./components/AIChat";

function AppContent() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {location.pathname.startsWith("/admin") ? (
        <AdminNavbar />
      ) : (
        !hideNavbar && <Navbar />
      )}

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/signin"
          element={<SignIn />}
        />

        <Route
          path="/signup"
          element={<SignUp />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/movies/:id"
          element={<MovieDetails />}
        />

        <Route element={<AdminProtectedRoute />}>
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />
          <Route
            path="/admin/movies"
            element={<AdminMovies/>}
          />
          <Route
            path="/admin/theatres"
            element={<AdminTheatres/>}
          />
          <Route
            path="/admin/screens"
            element={<AdminScreens/>}
          />
          <Route
            path="/admin/shows"
            element={<AdminShows/>}
          />
          <Route
            path="/admin/bookings"
            element={<AdminBooking/>}
          />
          <Route
            path="/admin/payments"
            element={<AdminPayments/>}
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/seats/:id"
            element={<SeatSelection />}
          />

          <Route
            path="/payment"
            element={<Payment />}
          />

          <Route
            path="/confirmation"
            element={<Confirmation />}
          />

          <Route
            path="/bookings"
            element={<MyBookings />}
          />
        </Route>

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center bg-[#f4f0e8]">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.2em] text-[#b64b2a]">
                  404
                </p>

                <h1 className="serif mt-4 text-5xl">
                  Page not found
                </h1>
              </div>
            </div>
          }
        />
      </Routes>
      <AIChat/>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;