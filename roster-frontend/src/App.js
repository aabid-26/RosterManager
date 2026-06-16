import React, { useState, useEffect } from "react";

function App() {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    jerseyNumber: "",
  });
  const [formError, setFormError] = useState(null);

  // NEW: State to track if we are currently editing a player
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

  // NEW: Function to load a player's data into the form
  const handleEditClick = (player) => {
    setFormData({
      name: player.name,
      position: player.position,
      jerseyNumber: player.jerseyNumber.toString(),
    });
    setEditingId(player.id);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to form
  };

  // NEW: Function to cancel an edit
  const cancelEdit = () => {
    setFormData({ name: "", position: "", jerseyNumber: "" });
    setEditingId(null);
    setFormError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name || !formData.position || !formData.jerseyNumber) {
      setFormError("All fields are mandatory.");
      return;
    }

    try {
      // Check if we are updating (PUT) or creating (POST)
      const isUpdating = editingId !== null;
      const url = isUpdating
        ? `http://localhost:8080/api/players/${editingId}`
        : "http://localhost:8080/api/players";

      const response = await fetch(url, {
        method: isUpdating ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
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
        // Find the old player in the array and replace them with the newly updated one
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) => (p.id === editingId ? savedPlayer : p))
        );
        setEditingId(null);
      } else {
        // Add the new player to the end of the array
        setPlayers((prevPlayers) => [...prevPlayers, savedPlayer]);
      }

      // Clean up the form
      setFormData({ name: "", position: "", jerseyNumber: "" });
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

      // If we delete the player we are currently editing, reset the form
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 border-b-4 border-black pb-4 flex justify-between items-end">
          <h1 className="text-4xl font-bold uppercase tracking-widest">
            Roster Manager
          </h1>
          <p className="text-lg font-medium">
            Total Active Players: {players.length}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 border-2 border-black bg-black text-white font-bold">
            ERROR: {error}
          </div>
        )}

        <div className="space-y-10">
          {/* Add/Edit Player Form */}
          <div className="border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white transition-all">
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">
              {editingId ? "Edit Player Details" : "Add New Player"}
            </h2>
            {formError && (
              <p className="mb-4 text-sm font-bold uppercase tracking-tight text-red-600">
                {formError}
              </p>
            )}

            <form
              onSubmit={handleFormSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border-2 border-black p-2 font-medium focus:outline-none focus:bg-gray-100"
                  placeholder="e.g. Stephen Curry"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full border-2 border-black p-2 font-medium focus:outline-none focus:bg-gray-100"
                  placeholder="e.g. Guard"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">
                  Jersey Number
                </label>
                <input
                  type="number"
                  name="jerseyNumber"
                  value={formData.jerseyNumber}
                  onChange={handleInputChange}
                  className="w-full border-2 border-black p-2 font-medium focus:outline-none focus:bg-gray-100"
                  placeholder="e.g. 30"
                />
              </div>

              <div className="md:col-span-3 mt-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 md:flex-none bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest text-sm py-3 px-8 transition-colors border-2 border-black active:bg-white active:text-black"
                >
                  {editingId ? "Save Changes" : "Add Player to Roster"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 md:flex-none bg-white text-black hover:bg-gray-200 font-bold uppercase tracking-widest text-sm py-3 px-8 transition-colors border-2 border-black"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Roster Display Table */}
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">
              Current Roster
            </h2>
            {isLoading ? (
              <p className="text-lg font-medium animate-pulse">
                Loading secure roster stream...
              </p>
            ) : (
              <div className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black text-white uppercase text-xs tracking-widest">
                      <th className="p-4 border-b-2 border-black w-16">ID</th>
                      <th className="p-4 border-b-2 border-black">
                        Player Name
                      </th>
                      <th className="p-4 border-b-2 border-black">Position</th>
                      <th className="p-4 border-b-2 border-black w-24">
                        Jersey #
                      </th>
                      <th className="p-4 border-b-2 border-black w-48 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {players.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-12 text-center text-lg font-medium border-b-2 border-black text-gray-500"
                        >
                          The roster is completely empty. Use the form above to
                          add an athlete.
                        </td>
                      </tr>
                    ) : (
                      players.map((player) => (
                        <tr
                          key={player.id}
                          className={`hover:bg-gray-50 transition-colors group ${
                            editingId === player.id ? "bg-gray-100" : ""
                          }`}
                        >
                          <td className="p-4 border-b-2 border-black font-bold">
                            {player.id}
                          </td>
                          <td className="p-4 border-b-2 border-black font-semibold">
                            {player.name}
                          </td>
                          <td className="p-4 border-b-2 border-black font-medium">
                            {player.position}
                          </td>
                          <td className="p-4 border-b-2 border-black font-bold">
                            {player.jerseyNumber}
                          </td>
                          <td className="p-4 border-b-2 border-black text-right space-x-2">
                            <button
                              onClick={() => handleEditClick(player)}
                              className="text-xs font-bold uppercase tracking-wider text-black hover:text-white hover:bg-black border-2 border-transparent hover:border-black px-3 py-1 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(player.id)}
                              className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-white hover:bg-red-600 border-2 border-transparent hover:border-red-600 px-3 py-1 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
