import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";

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

interface ScreenForm {
  theatreId: string;
  screenNumber: string;
  totalSeats: string;
  screenType: string;
}

const SCREEN_API = API_BASE_URL + "/api/admin/screens";
const THEATRE_API = API_BASE_URL + "/api/admin/theatres";

const emptyForm: ScreenForm = {
  theatreId: "",
  screenNumber: "",
  totalSeats: "",
  screenType: "STANDARD",
};

export default function AdminScreens() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);

  const [form, setForm] = useState<ScreenForm>(emptyForm);
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

      const [screenResponse, theatreResponse] = await Promise.all([
        fetch(SCREEN_API, {
          headers: getHeaders(),
        }),
        fetch(THEATRE_API, {
          headers: getHeaders(),
        }),
      ]);

      if (!screenResponse.ok) {
        throw new Error("Failed to fetch screens.");
      }

      if (!theatreResponse.ok) {
        throw new Error("Failed to fetch theatres.");
      }

      const screenData = await screenResponse.json();
      const theatreData = await theatreResponse.json();

      setScreens(screenData);
      setTheatres(theatreData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load screen data."
      );
    } finally {
      setLoading(false);
    }
  };

  const getTheatreName = (theatreId: number) => {
    const theatre = theatres.find((item) => item.id === theatreId);
    return theatre?.name || `Theatre #${theatreId}`;
  };

  const openAddForm = () => {
    setForm({
      ...emptyForm,
      theatreId: theatres.length > 0 ? String(theatres[0].id) : "",
    });

    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (screen: Screen) => {
    setForm({
      theatreId: String(screen.theatreId),
      screenNumber: String(screen.screenNumber),
      totalSeats: String(screen.totalSeats),
      screenType: screen.screenType || "STANDARD",
    });

    setEditingId(screen.id);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.theatreId ||
      !form.screenNumber ||
      !form.totalSeats ||
      !form.screenType
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (
      Number(form.screenNumber) <= 0 ||
      Number(form.totalSeats) <= 0
    ) {
      setError("Screen number and total seats must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing = editingId !== null;

      const payload = {
        theatreId: Number(form.theatreId),
        screenNumber: Number(form.screenNumber),
        totalSeats: Number(form.totalSeats),
        screenType: form.screenType,
      };

      const response = await fetch(
        isEditing ? `${SCREEN_API}/${editingId}` : SCREEN_API,
        {
          method: isEditing ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save screen.");
      }

      await fetchData();

      setSuccess(
        isEditing
          ? "Screen updated successfully."
          : "Screen added successfully."
      );

      closeForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save screen."
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

      const response = await fetch(`${SCREEN_API}/${deleteId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete screen.");
      }

      setScreens((prev) =>
        prev.filter((screen) => screen.id !== deleteId)
      );

      setSuccess("Screen deleted successfully.");
      setDeleteId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete screen."
      );
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f0e8] px-6 py-10 text-[#171717] md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#b64b2a]">
              Admin / Management
            </p>

            <h1 className="serif text-5xl leading-none md:text-6xl">
              Screens
            </h1>

            <p className="mt-4 text-sm text-black/55">
              Manage screens and seating capacity for your theatres.
            </p>
          </div>

          <button
            onClick={openAddForm}
            disabled={theatres.length === 0}
            className="border rounded-xl border-[#171717] bg-[#171717] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#b64b2a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Add Screen
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
              Loading screens...
            </p>
          </div>
        ) : screens.length === 0 ? (
          <div className="border border-black/10 bg-white/50 px-6 py-16 text-center">
            <p className="serif text-3xl">No screens found</p>

            <p className="mt-3 text-sm text-black/50">
              Add a screen to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {screens.map((screen) => (
              <div
                key={screen.id}
                className="border rounded-xl border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#b64b2a]">
                      Screen #{screen.screenNumber}
                    </p>

                    <h2 className="serif mt-2 text-3xl">
                      {screen.screenType}
                    </h2>
                  </div>

                  <span className="bg-black rounded-xl px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-white">
                    ID {screen.id}
                  </span>
                </div>

                <div className="space-y-4 border-t border-black/10 pt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Theatre
                    </p>

                    <p className="mt-1 text-sm">
                      {getTheatreName(screen.theatreId)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Screen
                      </p>

                      <p className="mt-1 text-sm">
                        #{screen.screenNumber}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                        Capacity
                      </p>

                      <p className="mt-1 text-sm">
                        {screen.totalSeats} seats
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 border-t border-black/10 pt-5">
                  <button
                    onClick={() => openEditForm(screen)}
                    className="flex-1 border rounded-xl border-black/20 px-4 py-2.5 text-xs uppercase tracking-[0.15em] transition hover:border-[#171717] hover:bg-[#171717] hover:text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteId(screen.id)}
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-[#f4f0e8] p-7 md:p-9">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#b64b2a]">
                  Screen Management
                </p>

                <h2 className="serif mt-2 text-4xl">
                  {editingId ? "Edit Screen" : "Add Screen"}
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

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                    Screen Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="screenNumber"
                    value={form.screenNumber}
                    onChange={handleChange}
                    placeholder="1"
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                    Total Seats
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="totalSeats"
                    value={form.totalSeats}
                    onChange={handleChange}
                    placeholder="120"
                    className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                  Screen Type
                </label>

                <select
                  name="screenType"
                  value={form.screenType}
                  onChange={handleChange}
                  className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                >
                  <option value="STANDARD">STANDARD</option>
                  <option value="IMAX">IMAX</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </div>

              <div className="flex gap-3 border-t border-black/10 pt-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 border border-black/20 px-5 py-3 text-xs uppercase tracking-[0.15em] transition hover:bg-black/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#171717] px-5 py-3 text-xs uppercase tracking-[0.15em] text-white transition hover:bg-[#b64b2a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Screen"
                    : "Add Screen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md bg-[#f4f0e8] p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[#b64b2a]">
              Confirm Action
            </p>

            <h2 className="serif mt-3 text-3xl">
              Delete this screen?
            </h2>

            <p className="mt-4 text-sm leading-6 text-black/55">
              This action will permanently remove the screen from the
              theatre management system.
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