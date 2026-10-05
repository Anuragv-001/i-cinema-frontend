import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";

interface Movie {
  id: number;
  title: string;
}

interface Theatre {
  id: number;
  name: string;
  city: string;
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

interface ShowForm {
  movieId: string;
  theatreId: string;
  screenId: string;
  showDate: string;
  startTime: string;
  endTime: string;
  ticketPrice: string;
  status: string;
}

const SHOW_API = API_BASE_URL + "/api/admin/shows";
const MOVIE_API = API_BASE_URL + "/api/admin/movies";
const THEATRE_API = API_BASE_URL + "/api/admin/theatres";
const SCREEN_API = API_BASE_URL + "/api/admin/screens";

const emptyForm: ShowForm = {
  movieId: "",
  theatreId: "",
  screenId: "",
  showDate: "",
  startTime: "",
  endTime: "",
  ticketPrice: "",
  status: "ACTIVE",
};

export default function AdminShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);

  const [form, setForm] = useState<ShowForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

      const [showResponse, movieResponse, theatreResponse, screenResponse] =
        await Promise.all([
          fetch(SHOW_API, {
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

      if (!showResponse.ok) {
        throw new Error("Failed to fetch shows.");
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

      const showData = await showResponse.json();
      const movieData = await movieResponse.json();
      const theatreData = await theatreResponse.json();
      const screenData = await screenResponse.json();

      setShows(showData);
      setMovies(movieData);
      setTheatres(theatreData);
      setScreens(screenData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load show data."
      );
    } finally {
      setLoading(false);
    }
  };

  const getMovieTitle = (movieId: number) => {
    return (
      movies.find((movie) => movie.id === movieId)?.title ||
      `Movie #${movieId}`
    );
  };

  const getTheatreName = (theatreId: number) => {
    return (
      theatres.find((theatre) => theatre.id === theatreId)?.name ||
      `Theatre #${theatreId}`
    );
  };

  const getScreenDetails = (screenId: number) => {
    const screen = screens.find((item) => item.id === screenId);

    if (!screen) {
      return `Screen #${screenId}`;
    }

    return `Screen ${screen.screenNumber} · ${screen.screenType}`;
  };

  const isShowExpired = (show: Show) => {
  const today = new Date();

  const currentDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (show.showDate < currentDate) {
    return true;
  }

  if (show.showDate > currentDate) {
    return false;
  }

  const [hours, minutes] = show.endTime
    .slice(0, 5)
    .split(":")
    .map(Number);

  const endTime = new Date();
  endTime.setHours(hours, minutes, 0, 0);

  return today >= endTime;
};

  const openAddForm = () => {
    setForm({
      ...emptyForm,
      movieId: movies.length > 0 ? String(movies[0].id) : "",
      theatreId: theatres.length > 0 ? String(theatres[0].id) : "",
      screenId: "",
    });

    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (show: Show) => {
    setForm({
      movieId: String(show.movieId),
      theatreId: String(show.theatreId),
      screenId: String(show.screenId),
      showDate: show.showDate,
      startTime: show.startTime.slice(0, 5),
      endTime: show.endTime.slice(0, 5),
      ticketPrice: String(show.ticketPrice),
      status: show.status,
    });

    setEditingId(show.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "theatreId") {
      setForm((prev) => ({
        ...prev,
        theatreId: value,
        screenId: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.movieId ||
      !form.theatreId ||
      !form.screenId ||
      !form.showDate ||
      !form.startTime ||
      !form.endTime ||
      !form.ticketPrice ||
      !form.status
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (Number(form.ticketPrice) <= 0) {
      setError("Ticket price must be greater than zero.");
      return;
    }

    const startMinutes =
  Number(form.startTime.split(":")[0]) * 60 +
  Number(form.startTime.split(":")[1]);

const endMinutes =
  Number(form.endTime.split(":")[0]) * 60 +
  Number(form.endTime.split(":")[1]);

let durationMinutes = endMinutes - startMinutes;

if (durationMinutes <= 0) {
  durationMinutes += 24 * 60;
}

if (durationMinutes <= 0 || durationMinutes > 12 * 60) {
  setError("Show duration must be between 1 minute and 12 hours.");
  return;
}

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing = editingId !== null;

      const payload = {
        movieId: Number(form.movieId),
        theatreId: Number(form.theatreId),
        screenId: Number(form.screenId),
        showDate: form.showDate,
        startTime: form.startTime,
        endTime: form.endTime,
        ticketPrice: Number(form.ticketPrice),
        status: form.status,
      };

      const response = await fetch(
        isEditing ? `${SHOW_API}/${editingId}` : SHOW_API,
        {
          method: isEditing ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save show.");
      }

      await fetchData();

      setSuccess(
        isEditing
          ? "Show updated successfully."
          : "Show added successfully."
      );

      closeForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save show."
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${SHOW_API}/${deleteId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete show.");
      }

      setShows((prev) =>
        prev.filter((show) => show.id !== deleteId)
      );

      setSuccess("Show deleted successfully.");
      setDeleteId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete show."
      );
      setDeleteId(null);
    }
  };

  const availableScreens = screens.filter(
    (screen) => String(screen.theatreId) === form.theatreId
  );

  return (
    <div className="min-h-screen bg-[#f4f0e8] px-6 py-10 text-[#171717] md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#b64b2a]">
              Admin / Management
            </p>

            <h1 className="serif text-5xl leading-none md:text-6xl">
              Shows
            </h1>

            <p className="mt-4 text-sm text-black/55">
              Manage movie schedules, screens, dates and ticket prices.
            </p>
          </div>

          <button
            onClick={openAddForm}
            disabled={
              movies.length === 0 ||
              theatres.length === 0 ||
              screens.length === 0
            }
            className="border rounded-xl border-[#171717] bg-[#171717] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#b64b2a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Add Show
          </button>
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
              Loading shows...
            </p>
          </div>
        ) : shows.length === 0 ? (
          <div className="border border-black/10 bg-white/50 px-6 py-16 text-center">
            <p className="serif text-3xl">No shows found</p>

            <p className="mt-3 text-sm text-black/50">
              Add a show to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {shows.map((show) => (
              <div
                key={show.id}
                className="border rounded-xl border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#b64b2a]">
                      Show #{show.id}
                    </p>

                    <h2 className="serif mt-2 text-3xl">
                      {getMovieTitle(show.movieId)}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-xl px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${
                        isShowExpired(show)
                        ? "bg-red-100 text-red-700"
                        : show.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-black/10 text-black/50"
                    }`}
                    >
                    {isShowExpired(show) ? "EXPIRED" : show.status}
                    </span>
                </div>

                <div className="space-y-4 border-t border-black/10 pt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Theatre
                    </p>

                    <p className="mt-1 text-sm">
                      {getTheatreName(show.theatreId)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Screen
                    </p>

                    <p className="mt-1 text-sm">
                      {getScreenDetails(show.screenId)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Date
                      </p>

                      <p className="mt-1 text-sm">
                        {show.showDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Price
                      </p>

                      <p className="mt-1 text-sm">
                        ₹{show.ticketPrice}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Showtime
                    </p>

                    <p className="mt-1 text-sm">
                      {show.startTime.slice(0, 5)} —{" "}
                      {show.endTime.slice(0, 5)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 border-t border-black/10 pt-5">
                  <button
                    onClick={() => openEditForm(show)}
                    className="flex-1 border rounded-xl border-black/20 px-4 py-2.5 text-xs uppercase tracking-[0.15em] transition hover:border-[#171717] hover:bg-[#171717] hover:text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteId(show.id)}
                    className="flex-1 border rounded-xl border-[#b64b2a]/40 px-4 py-2.5 text-xs uppercase tracking-[0.15em] text-[#b64b2a] transition hover:bg-[#b64b2a] hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-[#f4f0e8] p-7 md:p-9">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#b64b2a]">
                  Show Management
                </p>

                <h2 className="serif mt-2 text-4xl">
                  {editingId ? "Edit Show" : "Add Show"}
                </h2>
              </div>

              <button
                onClick={closeForm}
                className="text-2xl text-black/50 transition hover:text-black"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                  Movie
                </label>

                <select
                  name="movieId"
                  value={form.movieId}
                  onChange={handleChange}
                  className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                >
                  <option value="">Select Movie</option>

                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                  Theatre
                </label>

                <select
                  name="theatreId"
                  value={form.theatreId}
                  onChange={handleChange}
                  className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                >
                  <option value="">Select Theatre</option>

                  {theatres.map((theatre) => (
                    <option key={theatre.id} value={theatre.id}>
                      {theatre.name} — {theatre.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                  Screen
                </label>

                <select
                  name="screenId"
                  value={form.screenId}
                  onChange={handleChange}
                  disabled={!form.theatreId}
                  className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a] disabled:bg-black/5"
                >
                  <option value="">
                    {form.theatreId
                      ? "Select Screen"
                      : "Select Theatre First"}
                  </option>

                  {availableScreens.map((screen) => (
                    <option key={screen.id} value={screen.id}>
                      Screen {screen.screenNumber} —{" "}
                      {screen.screenType} — {screen.totalSeats} seats
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                  Show Date
                </label>

                <input
                  type="date"
                  name="showDate"
                  value={form.showDate}
                  onChange={handleChange}
                  className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                    Start Time
                  </label>

                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                    End Time
                  </label>

                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleChange}
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                    Ticket Price
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    name="ticketPrice"
                    value={form.ticketPrice}
                    onChange={handleChange}
                    placeholder="250"
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-black/15 bg-white px-4 py-2 outline-none transition focus:border-[#b64b2a]">
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                    </select>
                    </div>
                </div>
                <div className="flex gap-3 border-t border-black/10 pt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-black/20 px-5 py-3 text-xs uppercase tracking-[0.15em] transition hover:bg-black/5">
                    Cancel
                  </button>
                  <button
                    type = "submit"
                    disabled={saving}
                    className="flex-1 bg-[#171717] px-5 py-3 text-us uppercase tracking-[0.15em] text-white transition hover:bg-[#b64b2a] disabled:cursor-not-allowed diabled:opacity-50">
                        {saving? "Saving..." : editingId ? "Update Show" : "Add Show"}
                    </button>
                </div>
                </form>
            </div>
            </div>
      )}
      {deleteId!== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md bg-[#f4f0e8] p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-[#b64b2a]">
                    Confirm Action
                </p>
                <h2 className="serif mt-3 text-3xl">
                    Delete this show?
                </h2>
                <p className="mt-4 text-sm text-black/55 leading-6">
                    This action will permanently remove this show from the scheduling system.
                </p>
                <div className="mt-7 flex gap-3">
                    <button
                        onClick={() => setDeleteId(null)}
                        className="flex-1 border border-black/20 px-5 py-3 text-xs uppercase tracking-[0.15em]"
                        >
                            Cancel
                        </button>
                    <button
                        onClick={confirmDelete}
                        className="flex-1 bg-[#b64b2a] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-[#171717]"
                        >
                            Delete
                        </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}