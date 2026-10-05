import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Film,
  Building2,
  Monitor,
  CalendarDays,
  Ticket,
  LogOut,
  CreditCard,
} from "lucide-react";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("iCinemaToken");
    localStorage.removeItem("iCinemaLoggedIn");
    localStorage.removeItem("iCinemaCurrentUser");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/signin");
  };

  return (
    <header className="border-b border-black/10 bg-[#f4f0e8]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link
          to="/admin"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-white">
            <Film size={17} strokeWidth={1.5} />
          </div>

          <div>
            <p className="font-serif text-xl leading-none">
              I-Cinema
            </p>

            <p className="mt-1 text-[9px] tracking-[0.25em] text-[#b64b2a]">
              ADMIN
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            to="/admin"
            className="flex items-center gap-2 px-3 py-2 text-xs tracking-wide text-black/60 transition hover:text-[#b64b2a]"
          >
            <LayoutDashboard size={15} strokeWidth={1.5} />
            Dashboard
          </Link>

          <Link
            to="/admin/movies"
            className="flex items-center gap-2 px-3 py-2 text-xs tracking-wide text-black/60 transition hover:text-[#b64b2a]"
          >
            <Film size={15} strokeWidth={1.5} />
            Movies
          </Link>

          <Link
            to="/admin/theatres"
            className="flex items-center gap-2 px-3 py-2 text-xs tracking-wide text-black/60 transition hover:text-[#b64b2a]"
          >
            <Building2 size={15} strokeWidth={1.5} />
            Theatres
          </Link>

          <Link
            to="/admin/screens"
            className="flex items-center gap-2 px-3 py-2 text-xs tracking-wide text-black/60 transition hover:text-[#b64b2a]"
          >
            <Monitor size={15} strokeWidth={1.5} />
            Screens
          </Link>

          <Link
            to="/admin/shows"
            className="flex items-center gap-2 px-3 py-2 text-xs tracking-wide text-black/60 transition hover:text-[#b64b2a]"
          >
            <CalendarDays size={15} strokeWidth={1.5} />
            Shows
          </Link>

          <Link
            to="/admin/bookings"
            className="flex items-center gap-2 px-3 py-2 text-xs tracking-wide text-black/60 transition hover:text-[#b64b2a]"
          >
            <Ticket size={15} strokeWidth={1.5} />
            Bookings
          </Link>
          <Link
            to="/admin/payments"
            className="flex items-center gap-2 px-3 py-2 text-xs tracking-wide text-black/60 transition hover:text-[#b64b2a]"
          >
            <CreditCard size={15} strokeWidth={1.5} />
            Payments
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="flex rounded-xl items-center gap-2 border border-black/10 px-4 py-2 text-xs tracking-wide text-black/60 transition hover:border-[#b64b2a]/40 hover:text-[#b64b2a]"
        >
          <LogOut size={15} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;