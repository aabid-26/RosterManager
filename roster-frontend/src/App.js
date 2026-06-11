import React, { useState, useEffect } from "react";

function App() {
  // Roster Data States
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Input States
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    jerseyNumber: "",
  });
  const [formError, setFormError] = useState(null);

  // Fetch the roster when the component mounts
  useEffect(() => {
    fetchRoster();
  }, []);

  const fetchRoster = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/players");
      if (!response.ok) {
        throw new Error("Could not connect to the backend server.");
      }
      const data = await response.json();
      setPlayers(data);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Handle keystrokes in the input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit the form data to the Java Server
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!formData.name || !formData.position || !formData.jerseyNumber) {
      setFormError("All fields are mandatory.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          position: formData.position,
          jerseyNumber: parseInt(formData.jerseyNumber, 10),
        }),
      });

      if (!response.ok) {
        throw new Error("Backend failed to process the player entry.");
      }

      const newPlayer = await response.json();

      // Update the local state with the newly created player instantly
      setPlayers((prevPlayers) => [...prevPlayers, newPlayer]);

      // Reset the form fields cleanly
      setFormData({ name: "", position: "", jerseyNumber: "" });
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <div className="max-w-5xl mx-auto">
        {/* Main Header */}
        <div className="mb-8 border-b-4 border-black pb-4 flex justify-between items-end">
          <h1 className="text-4xl font-bold uppercase tracking-widest">
            Roster Manager
          </h1>
          <p className="text-lg font-medium">
            Total Active Players: {players.length}
          </p>
        </div>

        {/* Error Notification Block */}
        {error && (
          <div className="mb-6 p-4 border-2 border-black bg-black text-white font-bold">
            CRITICAL ERROR: {error}
          </div>
        )}

        <div className="space-y-10">
          {/* Player Creation Form Card */}
          <div className="border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">
              Add New Player
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

              <div className="md:col-span-3 mt-2">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-black text-white hover:bg-gray-800 font-bold uppercase tracking-widest text-sm py-3 px-8 transition-colors border-2 border-black active:bg-white active:text-black"
                >
                  Add Player to Roster
                </button>
              </div>
            </form>
          </div>

          {/* Roster Display Section */}
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
                      <th className="p-4 border-b-2 border-black w-20">ID</th>
                      <th className="p-4 border-b-2 border-black">
                        Player Name
                      </th>
                      <th className="p-4 border-b-2 border-black">Position</th>
                      <th className="p-4 border-b-2 border-black w-32">
                        Jersey #
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {players.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
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
                          className="hover:bg-gray-50 transition-colors"
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
