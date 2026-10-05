import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";

interface Booking {
  id: number;
  bookingId: string;
  userEmail: string;
  movieId: number;
  theatreId: number;
  screenId: number;
  showTime: string;
  ticketPrice: number;
  convenienceFee: number;
  totalAmount: number;
  status: string;
  bookingTime: string;
  paymentExpiry?: string | null;
}

interface BookingSeat {
  id: number;
  bookingId: string;
  seatId: number;
  seatNumber: string;
}

interface Movie {
  id: number;
  title: string;
}

interface Theatre {
  id: number;
  name: string;
}

interface Screen {
  id: number;
  theatreId: number;
  screenNumber: number;
  screenType: string;
}

const BOOKING_API = API_BASE_URL + "/api/admin/bookings";
const MOVIE_API = API_BASE_URL + "/api/admin/movies";
const THEATRE_API = API_BASE_URL + "/api/admin/theatres";
const SCREEN_API = API_BASE_URL + "/api/admin/screens";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const [bookingSeats, setBookingSeats] = useState<BookingSeat[]>([]);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusBooking, setStatusBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const [cancelBooking, setCancelBooking] =
    useState<Booking | null>(null);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("iCinemaToken")}`,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!success && !error) return;

    const timer = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, error]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        bookingResponse,
        movieResponse,
        theatreResponse,
        screenResponse,
      ] = await Promise.all([
        fetch(BOOKING_API, {
          headers: getHeaders(),
        }),
        fetch(MOVIE_API, {
          headers: getHeaders(),
        }),
        fetch(THEATRE_API, {
          headers: getHeaders(),
        }),
        fetch(SCREEN_API, {
          headers: getHeaders(),
        }),
      ]);

      if (!bookingResponse.ok) {
        throw new Error("Failed to fetch bookings.");
      }

      if (!movieResponse.ok) {
        throw new Error("Failed to fetch movies.");
      }

      if (!theatreResponse.ok) {
        throw new Error("Failed to fetch theatres.");
      }

      if (!screenResponse.ok) {
        throw new Error("Failed to fetch screens.");
      }

      const bookingData = await bookingResponse.json();
      const movieData = await movieResponse.json();
      const theatreData = await theatreResponse.json();
      const screenData = await screenResponse.json();

      setBookings(bookingData);
      setCurrentPage(1);
      setMovies(movieData);
      setTheatres(theatreData);
      setScreens(screenData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  const getMovieTitle = (movieId: number) =>
    movies.find((movie) => movie.id === movieId)?.title ||
    `Movie #${movieId}`;

  const getTheatreName = (theatreId: number) =>
    theatres.find((theatre) => theatre.id === theatreId)?.name ||
    `Theatre #${theatreId}`;

  const getScreenName = (screenId: number) => {
    const screen = screens.find((item) => item.id === screenId);

    if (!screen) return `Screen #${screenId}`;

    return `Screen ${screen.screenNumber} · ${screen.screenType}`;
  };

  const formatDateTime = (value: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatShowTime = (value: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const openDetails = async (booking: Booking) => {
    try {
      setSelectedBooking(booking);
      setBookingSeats([]);
      setDetailsLoading(true);
      setError("");

      const response = await fetch(
        `${BOOKING_API}/booking-id/${booking.bookingId}/seats`,
        {
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch booking seats.");
      }

      const data = await response.json();
      setBookingSeats(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load booking details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!statusBooking || !newStatus) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${BOOKING_API}/${statusBooking.id}/status?status=${encodeURIComponent(
          newStatus
        )}`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to update booking status.");
      }

      await fetchData();

      setSuccess("Booking status updated successfully.");
      setStatusBooking(null);
      setNewStatus("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update booking status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const performCancel = async () => {
    if (!cancelBooking) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${BOOKING_API}/${cancelBooking.id}/cancel`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to cancel booking.");
      }

      await fetchData();

      setSuccess("Booking cancelled successfully.");
      setCancelBooking(null);
      setSelectedBooking(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel booking."
      );
    } finally {
      setActionLoading(false);
    }
  };
    const totalPages = Math.ceil(bookings.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;

    const currentBookings = bookings.slice(
    startIndex,
    startIndex + itemsPerPage
    );

    const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    };

  const statusClass = (status: string) => {
    if (status === "CONFIRMED") {
      return "bg-green-100 text-green-700";
    }

    if (status === "CANCELLED") {
      return "bg-red-100 text-red-700";
    }

    if (status === "PENDING_PAYMENT") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-black/10 text-black/60";
  };

  return (
    <div className="min-h-screen bg-[#f4f0e8] px-6 py-10 text-[#171717] md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#b64b2a]">
            Admin / Management
          </p>

          <h1 className="serif text-5xl leading-none md:text-6xl">
            Bookings
          </h1>

          <p className="mt-4 text-sm text-black/55">
            Monitor and manage customer bookings.
          </p>
        </div>

        {success && (
          <div className="mb-6 border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="border border-black/10 bg-white/50 px-6 py-16 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-black/45">
              Loading bookings...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="border border-black/10 bg-white/50 px-6 py-16 text-center">
            <p className="serif text-3xl">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-hidden border rounded-xl border-black/10 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-black/10 bg-black/[0.03]">
                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Booking
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Customer
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Movie
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Show
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-black/45">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-black/10 transition hover:bg-black/[0.02]"
                    >
                      <td className="px-5 py-5">
                        <p className="font-medium">
                          {booking.bookingId}
                        </p>

                        <p className="mt-1 text-xs text-black/45">
                          {formatDateTime(booking.bookingTime)}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="max-w-[190px] truncate text-sm">
                          {booking.userEmail}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-medium">
                          {getMovieTitle(booking.movieId)}
                        </p>

                        <p className="mt-1 text-xs text-black/45">
                          {getTheatreName(booking.theatreId)}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm">
                          {formatShowTime(booking.showTime)}
                        </p>

                        <p className="mt-1 text-xs text-black/45">
                          {getScreenName(booking.screenId)}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-medium">
                          ₹{booking.totalAmount}
                        </p>

                        <p className="mt-1 text-xs text-black/45">
                          Ticket ₹{booking.ticketPrice}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-block px-3 rounded-xl py-1 text-[10px] uppercase tracking-[0.12em] ${statusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openDetails(booking)}
                            className="border rounded-xl border-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em] transition hover:bg-[#171717] hover:text-white"
                          >
                            View
                          </button>

                          <button
                            onClick={() => {
                              setStatusBooking(booking);
                              setNewStatus(booking.status);
                            }}
                            className="border rounded-xl border-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.12em] transition hover:bg-[#171717] hover:text-white"
                          >
                            Status
                          </button>

                          {booking.status !== "CANCELLED" && (
                            <button
                              onClick={() =>
                                setCancelBooking(booking)
                              }
                              className="border rounded-xl border-[#b64b2a]/40 px-3 py-2 text-[10px] uppercase tracking-[0.12em] text-[#b64b2a] transition hover:bg-[#b64b2a] hover:text-white"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4 border-t border-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
  <p className="text-xs text-black/50">
    Showing{" "}
    <span className="font-medium text-black">
      {bookings.length === 0 ? 0 : startIndex + 1}
    </span>
    {" – "}
    <span className="font-medium text-black">
      {Math.min(startIndex + itemsPerPage, bookings.length)}
    </span>
    {" of "}
    <span className="font-medium text-black">
      {bookings.length}
    </span>
    {" bookings"}
  </p>

  {totalPages > 1 && (
    <div className="flex items-center gap-2">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="border border-black/15 px-3 py-2 text-xs uppercase tracking-[0.1em] transition hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`min-w-9 border px-3 py-2 text-xs transition ${
              currentPage === page
                ? "border-[#171717] bg-[#171717] text-white"
                : "border-black/15 hover:bg-black/5"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="border border-black/15 px-3 py-2 text-xs uppercase tracking-[0.1em] transition hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next
      </button>
    </div>
  )}
</div>
</div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-[#f4f0e8] p-7 md:p-9">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#b64b2a]">
                  Booking Details
                </p>

                <h2 className="serif mt-2 text-4xl">
                  {selectedBooking.bookingId}
                </h2>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="text-2xl text-black/50 transition hover:text-black"
              >
                ×
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-10 text-center text-sm uppercase tracking-[0.15em] text-black/45">
                Loading details...
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-5 border-b border-black/10 pb-6 md:grid-cols-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Customer
                    </p>

                    <p className="mt-1 text-sm">
                      {selectedBooking.userEmail}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Status
                    </p>

                    <span
                      className={`mt-2 inline-block px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${statusClass(
                        selectedBooking.status
                      )}`}
                    >
                      {selectedBooking.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Movie
                    </p>

                    <p className="mt-1 text-sm">
                      {getMovieTitle(selectedBooking.movieId)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Theatre
                    </p>

                    <p className="mt-1 text-sm">
                      {getTheatreName(selectedBooking.theatreId)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Screen
                    </p>

                    <p className="mt-1 text-sm">
                      {getScreenName(selectedBooking.screenId)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Show Time
                    </p>

                    <p className="mt-1 text-sm">
                      {formatShowTime(selectedBooking.showTime)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                    Seats
                  </p>

                  {bookingSeats.length === 0 ? (
                    <p className="mt-2 text-sm text-black/50">
                      No seat details available.
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {bookingSeats.map((seat) => (
                        <span
                          key={seat.id}
                          className="border border-black/15 bg-white px-4 py-2 text-sm"
                        >
                          {seat.seatNumber}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-black/10 pt-6">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-black/50">
                      Ticket Price
                    </span>

                    <span>₹{selectedBooking.ticketPrice}</span>
                  </div>

                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-black/50">
                      Convenience Fee
                    </span>

                    <span>₹{selectedBooking.convenienceFee}</span>
                  </div>

                  <div className="mt-2 flex justify-between border-t border-black/10 pt-4">
                    <span className="font-medium">Total</span>

                    <span className="text-lg font-medium">
                      ₹{selectedBooking.totalAmount}
                    </span>
                  </div>
                </div>

                <div className="border-t border-black/10 pt-5 text-xs text-black/45">
                  Booking created:{" "}
                  {formatDateTime(selectedBooking.bookingTime)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {statusBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-[#f4f0e8] p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#b64b2a]">
          Booking Management
        </p>

        <h2 className="serif mt-3 text-3xl">
          Update status
        </h2>

        <p className="mt-3 text-sm text-black/55">
          {statusBooking.bookingId}
        </p>

        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="mt-6 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#b64b2a]"
        >
          <option value="PENDING_PAYMENT">
            PENDING_PAYMENT
          </option>

          <option value="CONFIRMED">
            CONFIRMED
          </option>

          <option value="CANCELLED">
            CANCELLED
          </option>
        </select>

        <div className="mt-7 flex gap-3">
          <button
            onClick={() => setStatusBooking(null)}
            disabled={actionLoading}
            className="flex-1 border border-black/20 px-5 py-3 text-xs uppercase tracking-[0.15em]"
          >
            Cancel
          </button>

          <button
            onClick={updateStatus}
            disabled={actionLoading}
            className="flex-1 bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-[#b64b2a] disabled:opacity-50"
          >
            {actionLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  )}

  {cancelBooking && (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-[#f4f0e8] p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#b64b2a]">
          Confirm Action
        </p>

        <h2 className="serif mt-3 text-3xl">
          Cancel this booking?
        </h2>

        <p className="mt-4 text-sm leading-6 text-black/55">
          Booking{" "}
          <span className="font-medium text-black">
            {cancelBooking.bookingId}
          </span>{" "}
          will be cancelled.
        </p>

        <div className="mt-7 flex gap-3">
          <button
            onClick={() => setCancelBooking(null)}
            disabled={actionLoading}
            className="flex-1 border border-black/20 px-5 py-3 text-xs uppercase tracking-[0.15em]"
          >
            Keep
          </button>

          <button
            onClick={performCancel}
            disabled={actionLoading}
            className="flex-1 bg-[#b64b2a] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-[#171717] disabled:opacity-50"
          >
            {actionLoading ? "Cancelling..." : "Cancel Booking"}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
}