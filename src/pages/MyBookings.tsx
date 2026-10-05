import API_BASE_URL from "../config/api";
import {
  Ticket,
  ArrowLeft,
  XCircle,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

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
  paymentExpiry?: string;
  seats: string[];
  movieTitle: string;
  theatre: string;
  screen: string;
}

export default function MyBookings() {
  const navigate = useNavigate();

  const currentUser = localStorage.getItem(
    "iCinemaCurrentUser"
  );

  const userEmail = currentUser
    ? JSON.parse(currentUser).email
    : "";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        if (!userEmail) {
          setBookings([]);
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/bookings/user?email=${encodeURIComponent(
            userEmail
          )}`
        );

        if (!response.ok) {
          throw new Error("Unable to load bookings");
        }

        const bookingData = await response.json();

        const bookingsWithDetails = await Promise.all(
          bookingData.map(async (booking: any) => {
            const [
              seatsResponse,
              movieResponse,
              theatreResponse,
              screenResponse,
            ] = await Promise.all([
              fetch(
                `${API_BASE_URL}/api/bookings/booking-id/${booking.bookingId}/seats`
              ),
              fetch(
                `${API_BASE_URL}/api/movies/${booking.movieId}`
              ),
              fetch(
                `${API_BASE_URL}/api/theatres/${booking.theatreId}`
              ),
              fetch(
                `${API_BASE_URL}/api/screens/${booking.screenId}`
              ),
            ]);

            const seatsData = seatsResponse.ok
              ? await seatsResponse.json()
              : [];
            
            const actualSeatNumbers = await Promise.all(
              seatsData.map(async (bookingSeat: any) =>{
                const response = await fetch(`${API_BASE_URL}/api/seats/${bookingSeat.seatId}`);
                if(!response.ok){
                  return bookingSeat.seatNumber;
                }
                const seatData = await response.json();
                return seatData.seatNumber;
              })
            );

            const movieData = movieResponse.ok
              ? await movieResponse.json()
              : null;

            const theatreData = theatreResponse.ok
              ? await theatreResponse.json()
              : null;

            const screenData = screenResponse.ok
              ? await screenResponse.json()
              : null;

            return {
              ...booking,
              seats: actualSeatNumbers,
              movieTitle:
                movieData?.title || `Movie #${booking.movieId}`,
              theatre:
                theatreData?.name ||
                `Theatre #${booking.theatreId}`,
              screen: screenData
                ? `Screen ${screenData.screenNumber}`
                : `Screen #${booking.screenId}`,
            };
          })
        );

        setBookings(bookingsWithDetails);
      } catch (err) {
        setError("Unable to load your bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userEmail]);

  const handleCancelBooking = async (bookingId: string) => {
    setBookingToCancel(bookingId);
  }

  const confirmCancelBooking = async () => {
  if (!bookingToCancel) return;

  try {
    setCancelling(true);

    const booking = bookings.find(
      (item) => item.bookingId === bookingToCancel
    );

    if (!booking) return;

    const refundResponse = await fetch(
      `${API_BASE_URL}/api/payments/refund/booking/${booking.bookingId}`,
      {
        method: "PUT",
      }
    );

    if (!refundResponse.ok) {
      const refundError = await refundResponse.text();
      throw new Error(refundError || "Refund failed");
    }

    const cancelResponse = await fetch(
      `${API_BASE_URL}/api/bookings/${booking.id}/cancel`,
      {
        method: "PUT",
      }
    );

    if (!cancelResponse.ok) {
      throw new Error("Booking cancellation failed");
    }

    setBookings((current) =>
      current.map((item) =>
        item.bookingId === bookingToCancel
          ? { ...item, status: "CANCELLED" }
          : item
      )
    );

    setBookingToCancel(null);
  } catch (error) {
    console.error(error);
    alert(
      error instanceof Error
        ? error.message
        : "Unable to cancel booking."
    );
  } finally {
    setCancelling(false);
  }
};

  const downloadTicket = (booking: Booking) => {
    const pdf = new jsPDF();

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const isCancelled =
      booking.status === "CANCELLED";

    pdf.setFillColor(23, 23, 23);
    pdf.rect(0, 0, pageWidth, 297, "F");

    pdf.setFillColor(244, 240, 232);
    pdf.roundedRect(
      18,
      35,
      pageWidth - 36,
      210,
      6,
      6,
      "F"
    );

    pdf.setDrawColor(180, 75, 42);
    pdf.setLineWidth(1);
    pdf.line(
      18,
      92,
      pageWidth - 18,
      92
    );

    pdf.setDrawColor(80, 80, 80);
    pdf.setLineDashPattern([3, 3], 0);

    pdf.line(
      18,
      195,
      pageWidth - 18,
      195
    );

    pdf.setLineDashPattern([], 0);

    pdf.setFillColor(23, 23, 23);
    pdf.circle(18, 195, 5, "F");
    pdf.circle(
      pageWidth - 18,
      195,
      5,
      "F"
    );

    pdf.setTextColor(182, 75, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);

    pdf.text(
      "I-CINEMA",
      28,
      53
    );

    pdf.setTextColor(23, 23, 23);
    pdf.setFontSize(9);

    pdf.text(
      isCancelled
        ? "BOOKING CANCELLED"
        : "BOOKING CONFIRMED",
      pageWidth - 28,
      53,
      {
        align: "right",
      }
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(25);

    pdf.text(
      booking.movieTitle,
      28,
      78
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(90, 90, 90);

    pdf.text(
      "Movie Ticket · Cinema Experience",
      28,
      85
    );

    pdf.setTextColor(23, 23, 23);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);

    pdf.text(
      "THEATRE",
      28,
      110
    );

    pdf.text(
      "SCREEN",
      105,
      110
    );

    pdf.text(
      "DATE & TIME",
      145,
      110
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    pdf.text(
      booking.theatre,
      28,
      119
    );

    pdf.text(
      booking.screen,
      105,
      119
    );

    pdf.text(
      new Date(
        booking.showTime
      ).toLocaleString(),
      145,
      119
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);

    pdf.text(
      "SEATS",
      28,
      140
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);

    pdf.text(
      booking.seats.join(", "),
      28,
      150
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);

    pdf.text(
      "BOOKING ID",
      28,
      175
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    pdf.text(
      booking.bookingId,
      28,
      184
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);

    pdf.text(
      "TOTAL PAID",
      pageWidth - 28,
      175,
      {
        align: "right",
      }
    );

    pdf.setFontSize(18);

    pdf.text(
      `Rs.${booking.totalAmount}`,
      pageWidth - 28,
      186,
      {
        align: "right",
      }
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);

    pdf.text(
      `Tickets: Rs.${booking.ticketPrice}`,
      28,
      215
    );

    pdf.text(
      `Convenience Fee: Rs.${booking.convenienceFee}`,
      28,
      223
    );

    pdf.text(
      `Booked on: ${new Date(
        booking.bookingTime
      ).toLocaleString()}`,
      pageWidth - 28,
      215,
      {
        align: "right",
      }
    );

    pdf.setTextColor(23, 23, 23);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);

    if (isCancelled) {
      pdf.setTextColor(182, 75, 42);

      pdf.text(
        "BOOKING CANCELLED",
        pageWidth / 2,
        235,
        {
          align: "center",
        }
      );
    } else {
      pdf.text(
        "Thank you for choosing I-Cinema.",
        pageWidth / 2,
        235,
        {
          align: "center",
        }
      );
    }

    pdf.save(
      `I-Cinema-${booking.bookingId}.pdf`
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f0e8]">

      <main className="mx-auto max-w-6xl px-6 py-16">

        <button
          onClick={() => navigate("/")}
          className="mb-10 inline-flex items-center gap-2 text-sm text-black/50 transition hover:text-black"
        >
          <ArrowLeft size={17} />
          Back to movies
        </button>

        <div className="mb-12">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#b64b2a]">
            I-CINEMA
          </p>

          <h1 className="serif mt-4 text-6xl">
            My bookings.
          </h1>

          <p className="mt-4 max-w-xl text-black/50">
            Your tickets, showtimes and cinema
            experiences all in one place.
          </p>

        </div>

        {loading && (
          <section className="border border-black/10 bg-white/30 px-8 py-16 text-center">

            <Ticket
              size={42}
              className="mx-auto text-[#b64b2a]"
            />

            <h2 className="serif mt-6 text-3xl">
              Loading bookings...
            </h2>

          </section>
        )}

        {!loading && error && (
          <section className="border border-black/10 bg-white/30 px-8 py-16 text-center">

            <XCircle
              size={42}
              className="mx-auto text-[#b64b2a]"
            />

            <h2 className="serif mt-6 text-3xl">
              Unable to load bookings.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm text-black/50">
              Please check that the backend services
              are running and try again.
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="mt-8 rounded-full bg-[#171717] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#b64b2a]"
            >
              Try Again
            </button>

          </section>
        )}

        {!loading &&
          !error &&
          bookings.length === 0 && (
            <section className="border border-black/10 bg-white/30 px-8 py-16 text-center">

              <Ticket
                size={42}
                className="mx-auto text-[#b64b2a]"
              />

              <h2 className="serif mt-6 text-3xl">
                No bookings yet.
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm text-black/50">
                Your confirmed movie tickets will
                appear here.
              </p>

              <button
                onClick={() => navigate("/")}
                className="mt-8 rounded-full bg-[#171717] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#b64b2a]"
              >
                Browse Movies →
              </button>

            </section>
          )}

        {!loading &&
          !error &&
          bookings.length > 0 && (
            <div className="space-y-10">

              {bookings
                .slice()
                .reverse()
                .map((booking) => {

                  const isCancelled =
                    booking.status ===
                    "CANCELLED";

                  return (
                    <article
                      key={booking.bookingId}
                      className={`cinema-ticket ${
                        isCancelled
                          ? "cinema-ticket-cancelled"
                          : ""
                      }`}
                    >

                      <div className="ticket-top">

                        <div>

                          <p className="ticket-brand">
                            I-CINEMA
                          </p>

                          <p className="ticket-status">
                            {isCancelled
                              ? "BOOKING CANCELLED"
                              : "BOOKING CONFIRMED"}
                          </p>

                        </div>

                        <div className="ticket-booking-id">

                          <span>
                            BOOKING ID
                          </span>

                          <strong>
                            {booking.bookingId}
                          </strong>

                        </div>

                      </div>

                      <div className="ticket-main">

                        <h2 className="serif ticket-movie-title">
                          {booking.movieTitle}
                        </h2>

                        <p className="ticket-subtitle">
                          Movie Ticket · Cinema
                          Experience
                        </p>

                        <div className="ticket-info-grid">

                          <div>
                            <span>
                              Theatre
                            </span>

                            <strong>
                              {booking.theatre}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Screen
                            </span>

                            <strong>
                              {booking.screen}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Date & Time
                            </span>

                            <strong>
                              {new Date(
                                booking.showTime
                              ).toLocaleString()}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Seats
                            </span>

                            <strong>
                              {booking.seats.join(
                                ", "
                              )}
                            </strong>
                          </div>

                        </div>

                      </div>

                      <div className="ticket-perforation">

                        <span />

                        <div />

                        <span />

                      </div>

                      <div className="ticket-bottom">

                        <div className="ticket-price-details">

                          <div>
                            <span>
                              Tickets
                            </span>

                            <strong>
                              ₹
                              {
                                booking.ticketPrice
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              Convenience Fee
                            </span>

                            <strong>
                              ₹
                              {
                                booking.convenienceFee
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              Booked on
                            </span>

                            <strong>
                              {new Date(
                                booking.bookingTime
                              ).toLocaleString()}
                            </strong>
                          </div>

                        </div>

                        <div className="ticket-total">

                          <span>
                            Total Paid
                          </span>

                          <strong>
                            ₹
                            {
                              booking.totalAmount
                            }
                          </strong>

                        </div>

                      </div>

                      <div className="ticket-actions">

                        <div>

                          {isCancelled ? (
                            <p className="ticket-refund">
                              Booking cancelled
                              successfully.
                            </p>
                          ) : (
                            <p className="ticket-footer-text">
                              Enjoy your movie
                              experience.
                            </p>
                          )}

                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">

                          <button
                            onClick={() =>
                              downloadTicket(
                                booking
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b64b2a]"
                          >
                            <Download size={16} />
                            Download Ticket
                          </button>

                          {!isCancelled &&
                            booking.status ===
                              "CONFIRMED" && (
                              <button
                                onClick={() =>
                                  handleCancelBooking(
                                    booking.bookingId
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/20 px-5 py-2.5 text-sm font-semibold text-[#171717] transition hover:border-[#b64b2a] hover:bg-[#b64b2a] hover:text-white"
                              >
                                <XCircle size={16} />
                                Cancel Booking
                              </button>
                            )}

                        </div>

                      </div>

                    </article>
                  );
                })}

            </div>
          )}

      </main>

      <footer className="border-t border-black/10 px-6 py-8">

        <div className="mx-auto flex max-w-6xl justify-between">

          <strong className="serif text-xl">
            I-Cinema
          </strong>

          <span className="text-sm text-black/50">
            Discover · Decide · Book
          </span>

        </div>

      </footer>

      {bookingToCancel && (
      <div className="fixed inset-0 z-50 rounded-xl flex items-center justify-center bg-black/50 px-4">
        <div className="w-full rounded-xl max-w-md bg-[#f4f0e8] border border-black/10 shadow-2xl">
          <div className="p-8">
            <div className="mb-6">
              <p className="text-xs tracking-[0.25em] text-[#b64b2a] uppercase">
                I-Cinema
              </p>

              <h2 className="mt-3 text-3xl font-serif text-[#171717]">
                Cancel booking?
              </h2>

              <p className="mt-4 text-sm leading-6 text-gray-600">
                Are you sure you want to cancel this booking? This action will
                cancel your current ticket.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setBookingToCancel(null)}
                disabled={cancelling}
                className="flex-1 border rounded-xl border-black/20 px-5 py-3 text-sm transition hover:bg-black/5 disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={confirmCancelBooking}
                disabled={cancelling}
                className="flex-1 bg-[#b64b2a] px-5 rounded-xl py-3 text-sm text-white transition hover:bg-[#963c22] disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}