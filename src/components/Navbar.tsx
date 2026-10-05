import {
  Menu,
  UserRound,
  LogOut,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider";

export default function Navbar() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("iCinemaToken")
  );

  const [userName, setUserName] = useState("");

  useEffect(() => {
    const updateAuth = () => {
      const token = localStorage.getItem("iCinemaToken");

      setIsLoggedIn(!!token);

      const currentUser =
        localStorage.getItem("iCinemaCurrentUser");

      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          setUserName(user.name || "");
        } catch {
          setUserName("");
        }
      } else {
        setUserName("");
      }
    };

    updateAuth();

    window.addEventListener("authChanged", updateAuth);

    return () => {
      window.removeEventListener("authChanged", updateAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("iCinemaToken");
    localStorage.removeItem("iCinemaCurrentUser");
    localStorage.removeItem("iCinemaLoggedIn");
    localStorage.removeItem("iCinemaUser");

    setIsLoggedIn(false);
    setUserName("");

    window.dispatchEvent(new Event("authChanged"));

    showToast("Successfully logged out.", "success");

    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/30 bg-[#f4f0e8]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <img
            src="/logo.svg"
            alt="I-Cinema Logo"
            className="h-10 w-10 rounded-xl"
          />

          <span className="serif text-2xl font-bold">
            I-Cinema
          </span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <Link
            to="/"
            className="text-sm font-medium transition hover:text-[#b64b2a]"
          >
            Movies
          </Link>

          <a
            href="#experience"
            className="text-sm font-medium transition hover:text-[#b64b2a]"
          >
            Experience
          </a>

          <Link
            to="/about"
            className="text-sm font-medium transition hover:text-[#b64b2a]"
          >
            About
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <Link
                to="/signin"
                className="hidden rounded-full border border-black/20 px-5 py-2.5 text-sm font-semibold transition hover:bg-black hover:text-white sm:block"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b64b2a]"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/bookings"
                className="flex items-center gap-2 rounded-full border border-black/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-[#171717] hover:text-white"
              >
                <Ticket size={16} />
                <span>My Bookings</span>
              </Link>

              <div className="hidden items-center gap-2 lg:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-white">
                  <UserRound size={17} />
                </div>

                <span className="max-w-[120px] truncate text-sm font-semibold">
                  {userName}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-black/20 px-4 py-2.5 text-sm font-semibold transition hover:bg-[#171717] hover:text-white"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          )}

          <button
            className="ml-1 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}