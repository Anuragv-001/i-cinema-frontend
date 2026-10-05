import API_BASE_URL from "../config/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles.css";

interface Movie {
  id: number;
  title: string;
  genre: string;
  language: string;
  rating: number;
  certificate: string;
  releaseDate: string;
  duration: number;
  description: string;
  posterUrl: string;
}

interface Theatre {
  id: number;
  name: string;
  location: string;
  city: string;
  status: string;
}

interface Screen {
  id: number;
  theatreId: number;
  screenNumber: number;
  totalSeats: number;
  screenType: string;
}

interface Show {
  id: number;
  movieId: number;
  theatreId: number;
  screenId: number;
  showDate: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  status: string;
}

const getLocalDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateOptions = () => {
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    dates.push({
      value: `${year}-${month}-${day}`,
      weekday: date
        .toLocaleDateString("en-IN", {
          weekday: "short",
        })
        .toUpperCase(),
      day: date.toLocaleDateString("en-IN", {
        day: "2-digit",
      }),
      month: date
        .toLocaleDateString("en-IN", {
          month: "short",
        })
        .toUpperCase(),
      label:
        i === 0
          ? "TODAY"
          : i === 1
          ? "TOMORROW"
          : "",
    });
  }

  return dates;
};

export default function MovieDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [shows, setShows] = useState<Show[]>([]);

  const [selectedTheatreId, setSelectedTheatreId] = useState<number | null>(
    null
  );

  const [selectedScreenId, setSelectedScreenId] = useState<number | null>(
    null
  );

  const [selectedDate, setSelectedDate] = useState(getLocalDate());

  const [loading, setLoading] = useState(true);
  const [theatreLoading, setTheatreLoading] = useState(true);
  const [screenLoading, setScreenLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const [error, setError] = useState("");
  const [theatreError, setTheatreError] = useState("");
  const [showError, setShowError] = useState("");

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/movies/${id}`
        );

        if (!response.ok) {
          throw new Error("Movie not found");
        }

        const data = await response.json();
        setMovie(data);
      } catch {
        setError("Unable to load movie details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovie();
    }
  }, [id]);

  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        setTheatreLoading(true);
        setTheatreError("");

        const response = await fetch(
          API_BASE_URL + "/api/theatres"
        );

        if (!response.ok) {
          throw new Error("Unable to load theatres");
        }

        const data: Theatre[] = await response.json();

        const activeTheatres = data.filter(
          (theatre) => theatre.status === "ACTIVE"
        );

        setTheatres(activeTheatres);

        if (activeTheatres.length > 0) {
          setSelectedTheatreId(activeTheatres[0].id);
        }
      } catch {
        setTheatreError("Unable to load theatres.");
      } finally {
        setTheatreLoading(false);
      }
    };

    fetchTheatres();
  }, []);

  useEffect(() => {
    const fetchScreens = async () => {
      if (!selectedTheatreId) {
        setScreens([]);
        setSelectedScreenId(null);
        return;
      }

      try {
        setScreenLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/screens/theatre/${selectedTheatreId}`
        );

        if (!response.ok) {
          throw new Error("Unable to load screens");
        }

        const data: Screen[] = await response.json();

        setScreens(data);

        if (data.length > 0) {
          setSelectedScreenId(data[0].id);
        } else {
          setSelectedScreenId(null);
        }
      } catch {
        setScreens([]);
        setSelectedScreenId(null);
      } finally {
        setScreenLoading(false);
      }
    };

    fetchScreens();
  }, [selectedTheatreId]);

  useEffect(() => {
    const fetchShows = async () => {
      if (!id || !selectedDate) {
        return;
      }

      try {
        setShowLoading(true);
        setShowError("");

        const response = await fetch(
          `${API_BASE_URL}/api/shows/movie/${id}/date/${selectedDate}`
        );

        if (!response.ok) {
          throw new Error("Unable to load shows");
        }

        const data: Show[] = await response.json();

        setShows(data);
      } catch {
        setShows([]);
        setShowError("Unable to load showtimes.");
      } finally {
        setShowLoading(false);
      }
    };

    fetchShows();
  }, [id, selectedDate]);

  const selectedTheatre = theatres.find(
    (theatre) => theatre.id === selectedTheatreId
  );

  const selectedScreen = screens.find(
    (screen) => screen.id === selectedScreenId
  );

const selectedShows = shows.filter((show) => {
  const matchesTheatre =
    Number(show.theatreId) === Number(selectedTheatreId);

  const matchesScreen =
    Number(show.screenId) === Number(selectedScreenId);

  const isActive =
    show.status?.toUpperCase() === "ACTIVE";

  if (!matchesTheatre || !matchesScreen || !isActive) {
    return false;
  }

  if (show.showDate !== selectedDate) {
    return false;
  }

  const now = new Date();

  const [hours, minutes] = show.startTime
    .slice(0, 5)
    .split(":")
    .map(Number);

  const showTimeInMinutes =
    hours * 60 + minutes;

  const currentTimeInMinutes =
    now.getHours() * 60 + now.getMinutes();

  if (show.showDate > getLocalDate()) {
    return true;
  }

  return showTimeInMinutes > currentTimeInMinutes;
});

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const goToSeats = (show: Show) => {
    if (!movie || !selectedTheatre || !selectedScreen) {
      return;
    }

    const token = localStorage.getItem("iCinemaToken");

    const showtime = formatTime(show.startTime);

    const bookingState = {
      movieTitle: movie.title,
      movieId: movie.id,
      showId: show.id,
      showtime,
      showDate: show.showDate,
      startTime: show.startTime,
      endTime: show.endTime,
      pricePerSeat: show.ticketPrice,
      theatre: selectedTheatre.name,
      theatreId: selectedTheatre.id,
      screen: `Screen ${selectedScreen.screenNumber}`,
      screenId: selectedScreen.id,
    };

    if (!token) {
      navigate("/signin", {
        state: {
          returnTo: `/seats/${id}`,
          ...bookingState,
        },
      });

      return;
    }

    navigate(`/seats/${id}`, {
      state: bookingState,
    });
  };

  if (loading) {
    return (
      <div className="movie-details-page">
        <section className="movie-details-hero">
          <div className="movie-details-content">
            <div className="movie-info">
              <p className="eyebrow">I-CINEMA</p>
              <h1>Loading movie...</h1>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-details-page">
        <section className="movie-details-hero">
          <button
            className="back-button"
            onClick={() => navigate("/")}
          >
            ← Back to movies
          </button>

          <div className="movie-details-content">
            <div className="movie-info">
              <p className="eyebrow">I-CINEMA</p>
              <h1>Movie not found</h1>
              <p className="movie-description">
                {error || "The requested movie could not be found."}
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const year = new Date(movie.releaseDate).getFullYear();

  const hours = Math.floor(movie.duration / 60);
  const minutes = movie.duration % 60;

  const duration =
    minutes === 0
      ? `${hours}h`
      : `${hours}h ${minutes}m`;

  const canBook =
    !theatreLoading &&
    !screenLoading &&
    !showLoading &&
    selectedTheatre &&
    selectedScreen;

  return (
    <div className="movie-details-page">
      <section className="movie-details-hero">

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back to movies
        </button>

        <div className="movie-details-content">

          <div className="movie-details-poster rounded-xl">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="movie-info">

            <p className="eyebrow">
              I-CINEMA
            </p>

            <p className="movie-meta">
              {movie.genre.toUpperCase()} &nbsp; • &nbsp;{" "}
              {movie.language}
            </p>

            <h1>{movie.title}</h1>

            <div className="movie-rating">
              <span>★</span>

              <strong>
                {movie.rating}
              </strong>

              <span className="rating-divider">
                |
              </span>

              <span>
                {movie.certificate}
              </span>
            </div>

            <p className="movie-year">
              {year} &nbsp; • &nbsp; {duration}
            </p>

            <p className="movie-description">
              {movie.description}
            </p>

          </div>
        </div>

      </section>

      <section className="showtime-section">

        <div className="section-heading">

          <div>
            <p className="eyebrow">
              SELECT YOUR EXPERIENCE
            </p>

            <h2>
              Choose theatre & screen.
            </h2>
          </div>

        </div>

        <div className="cinema-date-selector">

          <p className="cinema-date-label">
            SELECT DATE
          </p>

          <div className="cinema-date-grid">

            {getDateOptions().map((date) => (
              <button
                key={date.value}
                type="button"
                className={`cinema-date-card ${
                  selectedDate === date.value
                    ? "cinema-date-card-active"
                    : ""
                }`}
                onClick={() => setSelectedDate(date.value)}
              >

                <span className="cinema-date-top">
                  {date.label || date.weekday}
                </span>

                <strong>
                  {date.day}
                </strong>

                <span className="cinema-date-month">
                  {date.month}
                </span>

              </button>
            ))}

          </div>

        </div>

        {theatreLoading ? (
          <p className="movie-description">
            Loading theatres...
          </p>
        ) : theatreError ? (
          <p className="movie-description">
            {theatreError}
          </p>
        ) : theatres.length === 0 ? (
          <p className="movie-description">
            No theatres are currently available.
          </p>
        ) : (
          <>
            <div className="showtime-grid">

              {theatres.map((theatre) => (
                <button
                  key={theatre.id}
                  className="showtime-card rounded-xl"
                  onClick={() => setSelectedTheatreId(theatre.id)}
                  style={{
                    border:
                      selectedTheatreId === theatre.id
                        ? "2px solid #b64b2a"
                        : undefined,
                  }}
                >
                  <strong>{theatre.name}</strong>
                  <span>{theatre.city}</span>
                </button>
              ))}

            </div>

            {selectedTheatre && (
              <div style={{ marginTop: "30px" }}>

                <p className="select-screen-label">
                  SELECT SCREEN
                </p>

                {screenLoading ? (
                  <p className="movie-description">
                    Loading screens...
                  </p>
                ) : screens.length === 0 ? (
                  <p className="movie-description">
                    No screens available for this theatre.
                  </p>
                ) : (
                  <div className="showtime-grid">

                    {screens.map((screen) => (
                      <button
                        key={screen.id}
                        className="showtime-card rounded-xl"
                        onClick={() =>
                          setSelectedScreenId(screen.id)
                        }
                        style={{
                          border:
                            selectedScreenId === screen.id
                              ? "2px solid #b64b2a"
                              : undefined,
                        }}
                      >
                        <strong>
                          Screen {screen.screenNumber}
                        </strong>

                        <span>
                          {screen.screenType} • {screen.totalSeats} seats
                        </span>
                      </button>
                    ))}

                  </div>
                )}

              </div>
            )}

            <div style={{ marginTop: "50px" }}>

              <div className="section-heading">

                <div>
                  <p className="eyebrow">
                    SELECT YOUR SHOW
                  </p>

                  <h2>
                    Choose a showtime.
                  </h2>
                </div>

              </div>

              {showLoading ? (
                <p className="movie-description">
                  Loading showtimes...
                </p>
              ) : showError ? (
                <p className="movie-description">
                  {showError}
                </p>
              ) : !selectedTheatre || !selectedScreen ? (
                <p className="movie-description">
                  Select a theatre and screen first.
                </p>
              ) : selectedShows.length === 0 ? (
                <p
                  className="movie-description"
                  style={{ marginLeft: "100px" }}
                >
                  {selectedDate === getLocalDate()
                    ? "No more shows available today. Please select another date."
                    : "No shows available for this theatre and screen."}
                </p>
              ) : (
                <div className="showtime-grid">

                  {selectedShows.map((show) => {

                    const formattedTime = formatTime(
                      show.startTime
                    );

                    const [time, period] =
                      formattedTime.split(" ");

                    return (
                      <button
                        key={show.id}
                        className="showtime-card rounded-xl"
                        disabled={!canBook}
                        onClick={() => goToSeats(show)}
                      >
                        <strong>
                          {time}
                        </strong>

                        <span>
                          {period}  
                        </span>

                        <small>
                          ₹{show.ticketPrice}
                        </small>
                      </button>
                    );
                  })}

                </div>
              )}

            </div>

          </>
        )}

      </section>

      <footer className="movie-footer">

        <div>
          I-Cinema
        </div>

        <span>
          Discover. Decide. Book.
        </span>

      </footer>

    </div>
  );
}