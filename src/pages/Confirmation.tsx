import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles.css";

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  const seats = location.state?.seats || ["H5", "H4"];
  const ticketPrice = location.state?.ticketPrice || 360;
  const convenienceFee = location.state?.convenienceFee || 36;
  const total = location.state?.total || 396;

  const movieTitle = location.state?.movieTitle || "Inception";
  const showtime = location.state?.showtime || "6:45 PM";
  const showDate =
  location.state?.showDate ||
  new Date().toISOString().split("T")[0];
  const theatre = location.state?.theatre || "Galaxy Cinema";
  const screen = location.state?.screen || "Screen 2";

  const bookingId =
    location.state?.bookingId ||
    `ICN-${Date.now().toString().slice(-8)}`;

  useEffect(() => {
    const currentUser = localStorage.getItem(
      "iCinemaCurrentUser"
    );

    if (!currentUser) {
      return;
    }

    const user = JSON.parse(currentUser);

    const existingBookings = JSON.parse(
      localStorage.getItem("iCinemaBookings") || "[]"
    );

    const alreadySaved = existingBookings.some(
      (booking: { bookingId: string }) =>
        booking.bookingId === bookingId
    );

    if (alreadySaved) {
      return;
    }

    const booking = {
      bookingId,
      movieTitle,
      showtime,
      showDate,
      theatre,
      screen,
      seats,
      ticketPrice,
      convenienceFee,
      total: Math.round(total),
      bookingDate: new Date().toLocaleDateString(),
      userEmail: user.email,
      status: "Confirmed",
    };

    localStorage.setItem(
      "iCinemaBookings",
      JSON.stringify([
        ...existingBookings,
        booking,
      ])
    );
  }, [
    bookingId,
    movieTitle,
    showtime,
    theatre,
    screen,
    seats,
    ticketPrice,
    convenienceFee,
    total,
  ]);

  return (
    <div className="confirmation-page">

      <main className="confirmation-container">

        <div className="confirmation-check">
          ✓
        </div>

        <p className="confirmation-label">
          BOOKING CONFIRMED
        </p>

        <h1>
          Your cinema
          <br />
          experience awaits.
        </h1>

        <p className="confirmation-message">
          Your tickets have been booked successfully.
          We look forward to seeing you at I-Cinema.
        </p>

        <div className="ticket-card">

          <div className="ticket-header">
            <span>I-CINEMA</span>
            <span>BOOKING CONFIRMED</span>
          </div>

          <div className="ticket-title">
            <h2>{movieTitle}</h2>
            <p>Movie Ticket · Cinema Experience</p>
          </div>

          <div className="ticket-details">

            <div>
              <span>THEATRE</span>
              <strong>{theatre}</strong>
            </div>

            <div>
              <span>SCREEN</span>
              <strong>{screen}</strong>
            </div>

            <div>
              <span>DATE & TIME</span>
              <strong>
              {new Date(`${showDate}T00:00:00`).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}{" "}
              · {showtime}
            </strong>
            </div>

            <div>
              <span>SEATS</span>
              <strong>{seats.join(", ")}</strong>
            </div>

          </div>

          <div className="ticket-total">
            <span>Total Paid</span>
            <strong>₹{Math.round(total)}</strong>
          </div>

          <div className="booking-id">
            Booking ID: <strong>{bookingId}</strong>
          </div>

        </div>

        <div className="confirmation-actions">

          <button
            className="primary-confirm-button"
            onClick={() => navigate("/")}
          >
            Browse More Movies →
          </button>

          <button
            className="secondary-confirm-button"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>

        </div>

      </main>

      <footer className="confirmation-footer">
        <strong>I-Cinema</strong>
        <span>Discover · Decide · Book</span>
      </footer>

    </div>
  );
}