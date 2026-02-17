"use client";
import { useEffect, useState } from "react";
import SideBarWrapper from "../../components/sidebar/SideBarWrapper";
import { SERVERID } from "@/app/Constaint";

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [filteredZones, setFilteredZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ---------------- FETCH ZONES ----------------
  const fetchZones = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("emsToken") || "null");
      if (!token) {
        setErrorMessage("Authentication token missing");
        return;
      }
      const res = await fetch(`http://${SERVERID}/api/v1/zones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const zonesData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setZones(zonesData);
      setFilteredZones(zonesData);
    } catch (err) {
      console.error("Failed to fetch zones", err);
      setZones([]);
      setFilteredZones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  // ---------------- FILTER ZONES ----------------
  const handleSearch = () => {
    if (!searchText.trim()) {
      setFilteredZones(zones);
      return;
    }
    const filtered = zones.filter((zone) =>
      zone.zoneName?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredZones(filtered);
  };

  const handleReset = () => {
    setSearchText("");
    setFilteredZones(zones);
  };

  // ---------------- ADD ZONE ----------------
  const handleAddZone = async () => {
    if (!newZoneName.trim()) {
      setErrorMessage("Zone name is required");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");
      const token = JSON.parse(localStorage.getItem("emsToken") || "null");
      if (!token) {
        setErrorMessage("Authentication token missing");
        return;
      }

      const res = await fetch(`http://${SERVERID}/api/v1/zones`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ zoneName: newZoneName.trim() }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Zone already exists or backend rejected the request"
        );
      }

      setSuccessMessage("Zone added successfully!");
      setNewZoneName("");
      setShowAddForm(false);
      fetchZones();
    } catch (err: any) {
      console.error("Add zone failed:", err);
      setErrorMessage(err.message || "Failed to add zone. Try again.");
    }
  };

  return (
    <SideBarWrapper>
     <div className="bg-white p-4 sm:p-6 min-h-screen w-full">

        {/* Header */}
<div className="flex justify-between items-center mb-4 pt-2 sm:pt-0">

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-800">Zones</h1>
            <span className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
              Results {filteredZones.length}
            </span>
            <button className="px-3 py-1 border rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Filters
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)} // ← toggle behavior
            className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700"
          >
            {showAddForm ? "Cancel" : "+ Add Zone"}
          </button>
        </div>

        {/* Filters Panel */}
        <div className="border rounded-lg p-6 mb-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-black bg-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-200"
                placeholder="Search by zone name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saved Filter
              </label>
              <select className="w-full px-3 py-2 border rounded-md text-black bg-white focus:outline-none focus:ring focus:ring-blue-200">
                <option value="">Select</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Add Zone Panel – now matches Filters panel style */}
        {showAddForm && (
          <div className="border rounded-lg p-6 mb-6 bg-white">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Zone</h2>

            {errorMessage && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="Enter zone name"
                  className="w-full px-3 py-2 border rounded-md text-black bg-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>

              {/* You can add more fields here later (description, etc.) */}
              <div>{/* empty for layout balance */}</div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewZoneName("");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddZone}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Zone
              </button>
            </div>
          </div>
        )}

        {/* Zones Table */}
        <div className="border rounded-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 text-left text-sm text-gray-700">
              <tr>
                <th className="p-3 border-b">
                  <input type="checkbox" />
                </th>
                <th className="p-3 border-b">NAME</th>
                <th className="p-3 border-b">SITES</th>
                <th className="p-3 border-b">DESCRIPTION</th>
                <th className="p-3 border-b text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    Loading zones...
                  </td>
                </tr>
              ) : filteredZones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No zones found
                  </td>
                </tr>
              ) : (
                filteredZones.map((zone) => (
                  <tr key={zone.zoneId} className="hover:bg-gray-50">
                    <td className="p-3 border-b">
                      <input type="checkbox" />
                    </td>
                    <td className="p-3 border-b">
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {zone.zoneName}
                      </span>
                    </td>
                    <td className="p-3 border-b">{zone.siteCount || 0}</td>
                    <td className="p-3 border-b">—</td>
                    <td className="p-3 border-b text-right flex gap-2 justify-end">
                      <button className="px-3 py-1 bg-orange-400 text-white rounded hover:bg-orange-500">
                        ✏
                      </button>
                      <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SideBarWrapper>
  );
}