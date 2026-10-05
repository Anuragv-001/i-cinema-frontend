import API_BASE_URL from "../../config/api";
import { useEffect, useState } from "react";

interface Theatre {
  id: number;
  name: string;
  location: string;
  city: string;
  status: string;
}

interface TheatreForm {
  name: string;
  location: string;
  city: string;
  status: string;
}

const API_URL = API_BASE_URL + "/api/admin/theatres";

const emptyForm: TheatreForm = {
  name: "",
  location: "",
  city: "",
  status: "ACTIVE",
};

export default function AdminTheatres() {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [form, setForm] = useState<TheatreForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchTheatres();
  }, []);

  useEffect(() => {
    if (!success && !error) return;

    const timer = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success, error]);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("iCinemaToken")}`,
  });

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch theatres.");
      }

      const data = await response.json();
      setTheatres(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load theatres."
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (theatre: Theatre) => {
    setForm({
      name: theatre.name || "",
      location: theatre.location || "",
      city: theatre.city || "",
      status: theatre.status || "ACTIVE",
    });

    setEditingId(theatre.id);
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

    if (!form.name.trim() || !form.location.trim() || !form.city.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to save theatre.");
      }

      await fetchTheatres();

      setSuccess(
        isEditing
          ? "Theatre updated successfully."
          : "Theatre added successfully."
      );

      closeForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save theatre."
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

      const response = await fetch(`${API_URL}/${deleteId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to delete theatre.");
      }

      setTheatres((prev) =>
        prev.filter((theatre) => theatre.id !== deleteId)
      );

      setSuccess("Theatre deleted successfully.");
      setDeleteId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete theatre."
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
              Theatres
            </h1>

            <p className="mt-4 text-sm text-black/55">
              Manage theatres available in I-Cinema.
            </p>
          </div>

          <button
            onClick={openAddForm}
            className="border rounded-xl border-[#171717] bg-[#171717] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#b64b2a]"
          >
            + Add Theatre
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
              Loading theatres...
            </p>
          </div>
        ) : theatres.length === 0 ? (
          <div className="border border-black/10 bg-white/50 px-6 py-16 text-center">
            <p className="serif text-3xl">No theatres found</p>

            <p className="mt-3 text-sm text-black/50">
              Add your first theatre to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {theatres.map((theatre) => (
              <div
                key={theatre.id}
                className="group border rounded-xl border-black/10 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#b64b2a]">
                      Theatre #{theatre.id}
                    </p>

                    <h2 className="serif mt-2 text-3xl">
                      {theatre.name}
                    </h2>
                  </div>

                  <span
                    className={`px-3 py-1 text-[10px] font-medium rounded-xl uppercase tracking-[0.15em] ${
                      theatre.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {theatre.status}
                  </span>
                </div>

                <div className="space-y-3 border-t border-black/10 pt-5 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      Location
                    </p>
                    <p className="mt-1">{theatre.location}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/40">
                      City
                    </p>
                    <p className="mt-1">{theatre.city}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 border-t border-black/10 pt-5">
                  <button
                    onClick={() => openEditForm(theatre)}
                    className="flex-1 border rounded-xl border-black/20 px-4 py-2.5 text-xs uppercase tracking-[0.15em] transition hover:border-[#171717] hover:bg-[#171717] hover:text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteId(theatre.id)}
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
                  Theatre Management
                </p>

                <h2 className="serif mt-2 text-4xl">
                  {editingId ? "Edit Theatre" : "Add Theatre"}
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
                  Theatre Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Galaxy Cinema"
                  className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                  Location
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Alpha 1"
                  className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-black/55">
                  City
                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Greater Noida"
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
                  className="w-full border border-black/15 bg-white px-4 py-3 outline-none transition focus:border-[#b64b2a]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
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
                    ? "Update Theatre"
                    : "Add Theatre"}
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
              Delete this theatre?
            </h2>

            <p className="mt-4 text-sm leading-6 text-black/55">
              This action will permanently remove the theatre from the
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