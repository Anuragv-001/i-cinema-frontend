import API_BASE_URL from "../config/api";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles.css";

interface Seat {
  id: number;
  screenId: number;
  seatNumber: string;
  seatType: string;
  price: number;
  status: string;
}

export default function SeatSelection() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const {
    movieTitle = "Inception",
    showtime = "6:45 PM",
    theatre = "Galaxy Cinema",
    showDate = new Date().toISOString().split("T")[0],
    theatreId = 1,
    screen = "Screen 2",
    screenId = 2,
  } = location.state || {};

  const [seats, setSeats] = useState<Seat[]>([]);
  const [occupiedSeatIds, setOccupiedSeatIds] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const createShowTime = () => {
  const match = showtime.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (!match || !showDate) {
    return "";
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const hour = String(hours).padStart(2, "0");
  const minute = String(minutes).padStart(2, "0");

  return `${showDate}T${hour}:${minute}:00`;
};

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError("");

        const showTime = createShowTime();

        const [seatsResponse, occupiedResponse] = await Promise.all([
          fetch(
            `${API_BASE_URL}/api/seats/screen/${screenId}`
          ),
          fetch(
            `${API_BASE_URL}/api/bookings/occupied-seats?screenId=${screenId}&showTime=${encodeURIComponent(
              showTime
            )}`
          ),
        ]);

        if (!seatsResponse.ok) {
          throw new Error("Unable to load seats");
        }

        if (!occupiedResponse.ok) {
          throw new Error("Unable to load occupied seats");
        }

        const seatsData = await seatsResponse.json();
        const occupiedData = await occupiedResponse.json();

        setSeats(seatsData);
        setOccupiedSeatIds(occupiedData);
        setSelectedSeats([]);
      } catch (error) {
        setError("Unable to load seats.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [showtime, screenId]);

  const toggleSeat = (seatNumber: string) => {
    const seat = seats.find(
      (item) => item.seatNumber === seatNumber
    );

    if (!seat) {
      return;
    }

    const occupied =
      seat.status !== "AVAILABLE" ||
      occupiedSeatIds.includes(seat.id);

    if (occupied) {
      return;
    }

    setSelectedSeats((current) =>
      current.includes(seatNumber)
        ? current.filter((item) => item !== seatNumber)
        : [...current, seatNumber]
    );
  };

  const selectedSeatObjects = seats.filter((seat) =>
    selectedSeats.includes(seat.seatNumber)
  );

  const total = selectedSeatObjects.reduce(
    (sum, seat) => sum + seat.price,
    0
  );

  const rows = [
    ...new Set(
      seats.map((seat) => seat.seatNumber.charAt(0))
    ),
  ];

  return (
    <div className="seat-page">

      <header className="seat-header seat-animate-header">

        <button
          className="back-button"
          onClick={() => navigate(`/movies/${id}`)}
        >
          ← Back to showtime
        </button>

        <div className="seat-title">
          <span>I-CINEMA</span>
          <h1>Select your seats.</h1>
        </div>

        <div className="show-info">
          <strong>{movieTitle}</strong>
          <p>
            {new Date(`${showDate}T00:00:00`).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}{" "}
            · {showtime}
          </p>
          <p>
            {theatre} · {screen}
          </p>
        </div>

      </header>

      <main className="seat-content">

        <div className="screen-section seat-screen-animation">

          <p className="screen-label">
            SCREEN
          </p>

          <div className="cinema-screen">
            SCREEN
          </div>

        </div>

        {loading && (
          <div className="movie-info">
            <h2>Loading seats...</h2>
          </div>
        )}

        {error && (
          <div className="movie-info">
            <h2>{error}</h2>
          </div>
        )}

        {!loading && !error && seats.length > 0 && (
          <div className="seat-layout seat-layout-animation">

            {rows.map((row, rowIndex) => {

              const rowSeats = seats.filter(
                (seat) =>
                  seat.seatNumber.charAt(0) === row
              );

              return (
                <div
                  className="seat-row"
                  key={row}
                  style={{
                    animationDelay: `${rowIndex * 80}ms`,
                  }}
                >

                  <span className="row-label">
                    {row}
                  </span>

                  {rowSeats.map((seat) => {

                    const occupied =
                      seat.status !== "AVAILABLE" ||
                      occupiedSeatIds.includes(seat.id);

                    const selected =
                      selectedSeats.includes(
                        seat.seatNumber
                      );

                    return (
                      <button
                        key={seat.id}
                        className={`seat ${
                          occupied
                            ? "occupied"
                            : selected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          toggleSeat(
                            seat.seatNumber
                          )
                        }
                        disabled={occupied}
                      >
                        {seat.seatNumber.replace(
                          row,
                          ""
                        )}
                      </button>
                    );
                  })}

                  <span className="row-label">
                    {row}
                  </span>

                </div>
              );
            })}

          </div>
        )}

        <div className="seat-legend seat-legend-animation">

          <div>
            <span className="legend-box available"></span>
            Available
          </div>

          <div>
            <span className="legend-box selected-box"></span>
            Selected
          </div>

          <div>
            <span className="legend-box occupied-box"></span>
            Occupied
          </div>

        </div>

        <section className="booking-summary seat-summary-animation">

          <div>

            <p className="summary-label">
              YOUR SELECTION
            </p>

            <h2>
              {selectedSeats.length === 0
                ? "No seats selected"
                : selectedSeats.join(", ")}
            </h2>

            <p>
              {selectedSeats.length}{" "}
              {selectedSeats.length === 1
                ? "seat"
                : "seats"}{" "}
              · ₹
              {selectedSeats.length > 0
                ? selectedSeatObjects[0]?.price
                : 0}{" "}
              each
            </p>

          </div>

          <div className="price-section">

            <div>
              <span>Total</span>

              <strong>
                ₹{total}
              </strong>
            </div>

            <button
              className="payment-button rounded-xl seat-payment-button"
              disabled={
                selectedSeats.length === 0
              }
              onClick={() =>
                navigate("/payment", {
                  state: {
                    selectedSeats,
                    selectedSeatIds:
                      selectedSeatObjects.map(
                        (seat) => seat.id
                      ),
                    pricePerSeat:
                      selectedSeatObjects[0]?.price ||
                      0,
                    movieTitle,
                    movieId: Number(id),
                    showtime,
                    theatre,
                    showDate,
                    theatreId,
                    screen,
                    screenId,
                  },
                })
              }
            >
              Proceed to payment →
            </button>

          </div>

        </section>

      </main>

      <footer className="seat-footer">
        <strong>I-Cinema</strong>

        <span>
          Discover · Decide · Book
        </span>
      </footer>

    </div>
  );
}