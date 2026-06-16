import React, { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Plus,
  Save,
  X,
  Users,
  AlertCircle,
} from "lucide-react";

function App() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UPDATED: Split name into firstName and lastName
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    jerseyNumber: "",
  });
  const [formError, setFormError] = useState(null);

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRoster();
  }, []);

  const fetchRoster = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/players");
      if (!response.ok)
        throw new Error("Could not connect to the backend server.");
      const data = await response.json();
      setPlayers(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // UPDATED: Smartly split the name back into First and Last when editing
  const handleEditClick = (player) => {
    const nameParts = player.name.trim().split(" ");
    const fName = nameParts[0] || "";
    const lName = nameParts.slice(1).join(" ") || ""; // Handles multi-word last names

    setFormData({
      firstName: fName,
      lastName: lName,
      position: player.position,
      jerseyNumber: player.jerseyNumber.toString(),
    });
    setEditingId(player.id);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setFormData({
      firstName: "",
      lastName: "",
      position: "",
      jerseyNumber: "",
    });
    setEditingId(null);
    setFormError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (
      formData.firstName.trim() === "" ||
      formData.lastName.trim() === "" ||
      formData.position.trim() === "" ||
      formData.jerseyNumber.toString().trim() === ""
    ) {
      setFormError("All fields are mandatory.");
      return;
    }

    try {
      const isUpdating = editingId !== null;
      const url = isUpdating
        ? `http://localhost:8080/api/players/${editingId}`
        : "http://localhost:8080/api/players";

      // COMBINE the names before sending to the backend
      const combinedName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      const response = await fetch(url, {
        method: isUpdating ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: combinedName,
          position: formData.position,
          jerseyNumber: parseInt(formData.jerseyNumber, 10),
        }),
      });

      if (!response.ok)
        throw new Error(
          `Backend failed to ${isUpdating ? "update" : "create"} the player.`
        );

      const savedPlayer = await response.json();

      if (isUpdating) {
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) => (p.id === editingId ? savedPlayer : p))
        );
        setEditingId(null);
      } else {
        setPlayers((prevPlayers) => [...prevPlayers, savedPlayer]);
      }

      setFormData({
        firstName: "",
        lastName: "",
        position: "",
        jerseyNumber: "",
      });
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/players/${id}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error("Failed to delete player from the server.");
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player.id !== id)
      );

      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-body text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Oswald', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                Team Operations
              </p>
              <h1 className="mt-1 flex items-center gap-3 font-display text-3xl font-bold uppercase tracking-wide text-slate-50 md:text-4xl">
                <Users className="h-8 w-8 text-amber-400" strokeWidth={2.5} />
                Roster Manager
              </h1>
            </div>
            <div className="rounded-xl border border-slate-700 bg-black/40 px-5 py-3 text-center shadow-inner shadow-black/50">
              <p className="font-display text-3xl font-bold tabular-nums text-amber-400">
                {players.length.toString().padStart(2, "0")}
              </p>
              <p className="mt-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Active Players
              </p>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400/60 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-body text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-10">
          {/* Add/Edit Player Form */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/30 md:p-8">
            <h2 className="mb-5 flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-slate-100">
              {editingId ? (
                <>
                  <Pencil className="h-5 w-5 text-teal-400" /> Edit Player
                  Details
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-amber-400" /> Add New Player
                </>
              )}
            </h2>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="font-body text-sm font-medium">{formError}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
              {/* UPDATED: Form Grid layout to accommodate 4 inputs beautifully */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
                <div>
                  <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wider text-slate-500">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2.5 font-body text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    placeholder="e.g. Stephen"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2.5 font-body text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    placeholder="e.g. Curry"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2.5 font-body text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    placeholder="e.g. Point Guard"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Jersey Number
                  </label>
                  <input
                    type="number"
                    name="jerseyNumber"
                    value={formData.jerseyNumber}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2.5 font-body text-slate-100 placeholder:text-slate-600 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900 md:flex-none md:px-8"
                >
                  {editingId ? (
                    <>
                      <Save className="h-4 w-4" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add Player to Roster
                    </>
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wide text-slate-300 transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 md:flex-none md:px-8"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Roster Display */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-slate-100">
              <Users className="h-5 w-5 text-slate-500" /> Current Roster
            </h2>

            {isLoading ? (
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 border-b border-slate-800 px-5 py-4 last:border-0"
                  >
                    <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-32 animate-pulse rounded bg-slate-800" />
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20">
                {players.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                    <Users className="h-10 w-10 text-slate-700" />
                    <p className="font-body font-medium text-slate-300">
                      The roster is completely empty.
                    </p>
                    <p className="font-body text-sm text-slate-500">
                      Use the form above to add your first athlete.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-800/40 ${
                          editingId === player.id
                            ? "border-l-2 border-amber-400 bg-amber-400/5"
                            : "border-l-2 border-transparent"
                        }`}
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 font-display text-lg font-bold text-amber-400 ring-1 ring-slate-700 transition group-hover:ring-amber-400/40">
                          {player.jerseyNumber}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-body font-semibold text-slate-100">
                            {player.name}
                          </p>
                          {/* UPDATED: Added an explicit "POS:" label to the position badge */}
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                            <span className="text-amber-500">POS:</span>{" "}
                            {player.position}
                          </span>
                        </div>

                        <div className="flex shrink-0 gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                          <button
                            onClick={() => handleEditClick(player)}
                            aria-label={`Edit ${player.name}`}
                            className="rounded-lg bg-slate-800 p-2 text-slate-400 transition hover:bg-teal-500/20 hover:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(player.id)}
                            aria-label={`Remove ${player.name}`}
                            className="rounded-lg bg-slate-800 p-2 text-slate-400 transition hover:bg-rose-500/20 hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
