import API_BASE_URL from "../../config/api";
import { FormEvent, useEffect, useState } from "react";
import { Edit3, Film, Plus, Trash2, X } from "lucide-react";

interface Movie {
  id: number;
  title: string;
  genre: string;
  language: string;
  rating: number;
  certificate: string;
  duration: number;
  releaseDate: string;
  description: string;
  posterUrl: string;
}

interface MovieForm {
  title: string;
  genre: string;
  language: string;
  rating: string;
  certificate: string;
  duration: string;
  releaseDate: string;
  description: string;
  posterUrl: string;
}

const emptyForm: MovieForm = {
  title: "",
  genre: "",
  language: "",
  rating: "",
  certificate: "",
  duration: "",
  releaseDate: "",
  description: "",
  posterUrl: "",
};

const AdminMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [form, setForm] = useState<MovieForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if(!success && !error) return;

    const timer = setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, success]);

  const API_URL = API_BASE_URL + "/api/admin/movies";

  const getHeaders = () => {
    const token = localStorage.getItem("iCinemaToken");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();
      setMovies(data);
    } catch {
      setError("Unable to load movies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleInputChange = (
    field: keyof MovieForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (movie: Movie) => {
    setEditingId(movie.id);

    setForm({
      title: movie.title || "",
      genre: movie.genre || "",
      language: movie.language || "",
      rating: movie.rating?.toString() || "",
      certificate: movie.certificate || "",
      duration: movie.duration?.toString() || "",
      releaseDate: movie.releaseDate || "",
      description: movie.description || "",
      posterUrl: movie.posterUrl || "",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        genre: form.genre.trim(),
        language: form.language.trim(),
        rating: Number(form.rating),
        certificate: form.certificate.trim(),
        duration: Number(form.duration),
        releaseDate: form.releaseDate,
        description: form.description.trim(),
        posterUrl: form.posterUrl.trim(),
      };

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          responseText || "Failed to save movie"
        );
      }

      setSuccess(
        editingId
          ? "Movie updated successfully."
          : "Movie added successfully."
      );

      closeForm();
      await fetchMovies();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save movie."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/${deleteId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete movie");
      }

      setSuccess("Movie deleted successfully.");
      setDeleteId(null);

      await fetchMovies();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete movie."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#171717]">
      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">

        <div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-7 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs tracking-[0.3em] text-[#b64b2a]">
              ADMIN / MANAGEMENT
            </p>

            <h1 className="font-serif text-4xl">
              Movies
            </h1>

            <p className="mt-2 text-sm text-black/50">
              Manage the movies available in I-Cinema.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b64b2a]"
          >
            <Plus size={17} />
            Add Movie
          </button>
        </div>

        {success && (
          <div className="mt-6 border border-green-700/20 bg-green-700/5 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mt-6 border border-[#b64b2a]/30 bg-[#b64b2a]/5 px-5 py-4 text-sm text-[#b64b2a]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <p className="text-xs tracking-[0.25em] text-black/40">
              LOADING MOVIES...
            </p>
          </div>
        ) : movies.length === 0 ? (
          <div className="mt-8 border border-black/10 bg-white/50 py-20 text-center">
            <Film
              size={35}
              strokeWidth={1}
              className="mx-auto text-black/30"
            />

            <p className="mt-4 font-serif text-2xl">
              No movies found
            </p>

            <p className="mt-2 text-sm text-black/40">
              Add your first movie to the cinema.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="overflow-hidden border rounded-xl border-black/10 bg-white/60"
              >
                <div className="aspect-[2/3] bg-black/5">
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Film
                        size={40}
                        strokeWidth={1}
                        className="text-black/20"
                      />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-serif text-xl">
                      {movie.title}
                    </h2>

                    <span className="shrink-0 text-xs text-black/40">
                      #{movie.id}
                    </span>
                  </div>

                  <p className="mt-2 text-xs uppercase tracking-wide text-[#b64b2a]">
                    {movie.genre} · {movie.language}
                  </p>

                  <div className="mt-4 space-y-1 text-xs text-black/50">
                    <p>
                      Certificate: {movie.certificate || "—"}
                    </p>

                    <p>
                      Duration: {movie.duration || "—"} min
                    </p>

                    <p>
                      Rating: {movie.rating || "—"}
                    </p>

                    <p>
                      Release: {movie.releaseDate || "—"}
                    </p>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() =>
                        openEditForm(movie)
                      }
                      className="flex flex-1 rounded-xl items-center justify-center gap-2 border border-black/10 px-3 py-2 text-xs font-semibold transition hover:border-[#b64b2a]/40 hover:text-[#b64b2a]"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        setDeleteId(movie.id)
                      }
                      className="flex items-center rounded-xl justify-center border border-black/10 px-3 py-2 text-[#b64b2a] transition hover:border-[#b64b2a]/40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-[#f4f0e8] p-6 md:p-8">

            <div className="flex items-start justify-between border-b border-black/10 pb-5">
              <div>
                <p className="text-xs tracking-[0.25em] text-[#b64b2a]">
                  {editingId
                    ? "EDIT MOVIE"
                    : "NEW MOVIE"}
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  {editingId
                    ? "Edit movie"
                    : "Add movie"}
                </h2>
              </div>

              <button
                onClick={closeForm}
                className="text-black/40 transition hover:text-[#b64b2a]"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide">
                    Title
                  </label>

                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      handleInputChange(
                        "title",
                        e.target.value
                      )
                    }
                    className="w-full border-b border-black/20 bg-transparent px-1 py-3 outline-none focus:border-[#b64b2a]"
                    placeholder="Movie title"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide">
                    Genre
                  </label>

                  <input
                    required
                    value={form.genre}
                    onChange={(e) =>
                      handleInputChange(
                        "genre",
                        e.target.value
                      )
                    }
                    className="w-full border-b border-black/20 bg-transparent px-1 py-3 outline-none focus:border-[#b64b2a]"
                    placeholder="Action, Drama"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide">
                    Language
                  </label>

                  <input
                    required
                    value={form.language}
                    onChange={(e) =>
                      handleInputChange(
                        "language",
                        e.target.value
                      )
                    }
                    className="w-full border-b border-black/20 bg-transparent px-1 py-3 outline-none focus:border-[#b64b2a]"
                    placeholder="English"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide">
                    Certificate
                  </label>

                  <input
                    required
                    value={form.certificate}
                    onChange={(e) =>
                      handleInputChange(
                        "certificate",
                        e.target.value
                      )
                    }
                    className="w-full border-b border-black/20 bg-transparent px-1 py-3 outline-none focus:border-[#b64b2a]"
                    placeholder="U/A"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide">
                    Rating
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) =>
                      handleInputChange(
                        "rating",
                        e.target.value
                      )
                    }
                    className="w-full border-b border-black/20 bg-transparent px-1 py-3 outline-none focus:border-[#b64b2a]"
                    placeholder="8.5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide">
                    Duration (minutes)
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={form.duration}
                    onChange={(e) =>
                      handleInputChange(
                        "duration",
                        e.target.value
                      )
                    }
                    className="w-full border-b border-black/20 bg-transparent px-1 py-3 outline-none focus:border-[#b64b2a]"
                    placeholder="150"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide">
                    Release Date
                  </label>

                  <input
                    required
                    type="date"
                    value={form.releaseDate}
                    onChange={(e) =>
                      handleInputChange(
                        "releaseDate",
                        e.target.value
                      )
                    }
                    className="w-full border-b border-black/20 bg-transparent px-1 py-3 outline-none focus:border-[#b64b2a]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide">
                  Poster URL
                </label>

                <input
                  required
                  type="url"
                  value={form.posterUrl}
                  onChange={(e) =>
                    handleInputChange(
                      "posterUrl",
                      e.target.value
                    )
                  }
                  className="w-full border-b border-black/20 bg-transparent px-1 py-3 outline-none focus:border-[#b64b2a]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide">
                  Description
                </label>

                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange(
                      "description",
                      e.target.value
                    )
                  }
                  className="w-full resize-none border border-black/10 bg-white/40 p-3 outline-none focus:border-[#b64b2a]"
                  placeholder="Movie description"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-black/10 pt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-black/10 px-5 py-3 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b64b2a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Movie"
                    : "Add Movie"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-[#f4f0e8] p-7">
            <p className="text-xs tracking-[0.25em] text-[#b64b2a]">
              DELETE MOVIE
            </p>

            <h2 className="mt-3 font-serif text-2xl">
              Are you sure?
            </h2>

            <p className="mt-3 text-sm leading-6 text-black/50">
              This movie will be permanently removed from
              the movie catalogue.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="border border-black/10 px-5 py-3 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="bg-[#b64b2a] px-5 py-3 text-sm font-semibold text-white"
              >
                Delete Movie
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;