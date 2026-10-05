import API_BASE_URL from "../config/api";
import { useEffect, useState } from "react";
import {
  Film,
  Building2,
  Monitor,
  CalendarDays,
  Ticket,
  CheckCircle2,
  XCircle,
  IndianRupee,
} from "lucide-react";

interface DashboardStats {
  totalMovies: number;
  totalTheatres: number;
  totalScreens: number;
  totalShows: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("iCinemaToken");

        if (!token) {
          throw new Error("Admin authentication token not found");
        }

        const response = await fetch(
          API_BASE_URL + "/api/admin/stats/overview",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized. Please login again.");
          }

          if (response.status === 403) {
            throw new Error("Access denied. Admin privileges required.");
          }

          throw new Error("Failed to fetch dashboard statistics");
        }

        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = stats
    ? [
        {
          title: "TOTAL MOVIES",
          value: stats.totalMovies,
          icon: Film,
        },
        {
          title: "THEATRES",
          value: stats.totalTheatres,
          icon: Building2,
        },
        {
          title: "SCREENS",
          value: stats.totalScreens,
          icon: Monitor,
        },
        {
          title: "SHOWS",
          value: stats.totalShows,
          icon: CalendarDays,
        },
        {
          title: "TOTAL BOOKINGS",
          value: stats.totalBookings,
          icon: Ticket,
        },
        {
          title: "CONFIRMED",
          value: stats.confirmedBookings,
          icon: CheckCircle2,
        },
        {
          title: "CANCELLED",
          value: stats.cancelledBookings,
          icon: XCircle,
        },
        {
          title: "NET REVENUE",
          value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
          icon: IndianRupee,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#171717]">
      <div className="border-b border-black/10 px-6 py-5 md:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="mb-1 text-xs tracking-[0.3em] text-[#b64b2a] pl-11">
            I-CINEMA
          </p>

          <h1 className="font-serif text-3xl md:text-4xl pl-9">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-black/50 pl-9">
            Overview of your cinema operations
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        {loading && (
          <div className="py-20 text-center">
            <p className="text-sm tracking-widest text-black/50">
              LOADING DASHBOARD...
            </p>
          </div>
        )}

        {error && (
          <div className="border border-[#b64b2a]/30 bg-[#b64b2a]/5 p-5 text-sm text-[#b64b2a]">
            {error}
          </div>
        )}

        {!loading && !error && stats && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="group border rounded-xl border-black/10 bg-white/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#b64b2a]/40"
                  >
                    <div className="mb-8 flex items-start justify-between">
                      <span className="text-[10px] tracking-[0.2em] text-black/45">
                        {card.title}
                      </span>

                      <Icon
                        size={18}
                        strokeWidth={1.5}
                        className="text-[#b64b2a]"
                      />
                    </div>

                    <p className="font-serif text-3xl">
                      {card.value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 border-t border-black/10 pt-8">
              <h2 className="font-serif text-2xl">
                Cinema Overview
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                Manage movies, theatres, screens, shows, bookings and
                payments from the administration panel.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;