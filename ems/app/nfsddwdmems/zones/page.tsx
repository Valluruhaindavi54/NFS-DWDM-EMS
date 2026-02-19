"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import SideBarWrapper from "../../components/sidebar/SideBarWrapper";
import { SERVERID } from "@/app/Constaint";
import AddZoneModal from "@/app/components/sidebar/Modals/AddZoneModel";
import EditZoneModel from "@/app/components/sidebar/Modals/EditZoneModel";
import DeleteZoneModal from "@/app/components/sidebar/Modals/DeleteZoneModal";

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [filteredZones, setFilteredZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newZoneName, setNewZoneName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingOperation, setLoadingOperation] = useState(false);

  const [zoneToEdit, setZoneToEdit] = useState("");
  const [editedZoneName, setEditedZoneName] = useState("");

  const [zoneToDelete, setZoneToDelete] = useState<number | null>(null);
  const [zoneToDeleteName, setZoneToDeleteName] = useState<string | null>(null);

  // Central modal state
  const [activeModal, setActiveModal] = useState<"add" | "edit" | "delete" | null>(null);

  // Sort state
  const [sortOption, setSortOption] = useState<"a-z" | "z-a" | "old-new" | "new-old">("a-z");

  const router = useRouter();

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
        headers: { Authorization: `Bearer ${token}` },
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

  // ---------------- SORT ZONES ----------------
  const getSortedZones = () => {
    const zonesCopy = [...filteredZones];
    switch (sortOption) {
      case "a-z":
        return zonesCopy.sort((a, b) => a.zoneName.localeCompare(b.zoneName));
      case "z-a":
        return zonesCopy.sort((a, b) => b.zoneName.localeCompare(a.zoneName));
      case "old-new":
        return zonesCopy.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "new-old":
        return zonesCopy.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return zonesCopy;
    }
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
      if (!token) return setErrorMessage("Authentication token missing");

      const res = await fetch(`http://${SERVERID}/api/v1/zones`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ zoneName: newZoneName.trim() }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to add zone");

      setSuccessMessage("Zone added successfully!");
      setNewZoneName("");
      setActiveModal(null);
      fetchZones();
      setTimeout(() => setSuccessMessage(""), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to add zone. Try again.");
    }
  };

  // ---------------- EDIT ZONE ----------------
  const confirmEditZone = async () => {
    if (!zoneToEdit || !editedZoneName.trim()) return;
    try {
      setLoadingOperation(true);
      setErrorMessage("");
      setSuccessMessage("");

      const token = JSON.parse(localStorage.getItem("emsToken") || "null");
      if (!token) return setErrorMessage("Authentication token missing");

      const res = await fetch(`http://${SERVERID}/api/v1/zones/${zoneToEdit}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ zoneName: editedZoneName.trim() }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to edit zone");

      setSuccessMessage("Zone edited successfully!");
      setActiveModal(null);
      setZoneToEdit("");
      setEditedZoneName("");
      fetchZones();
      setTimeout(() => setSuccessMessage(""), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to edit zone");
    } finally {
      setLoadingOperation(false);
    }
  };

  // ---------------- DELETE ZONE ----------------
  const handleDeleteZone = async () => {
    if (!zoneToDelete) return;
    try {
      const token = JSON.parse(localStorage.getItem("emsToken") || "null");
      if (!token) return;

      const res = await fetch(`http://${SERVERID}/api/v1/zones/${zoneToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete zone");

      setSuccessMessage("Zone deleted successfully!");
      setActiveModal(null);
      setZoneToDelete(null);
      setZoneToDeleteName(null);
      fetchZones();
      setTimeout(() => setSuccessMessage(""), 1500);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete zone");
    }
  };

  return (
  
      <div className="bg-white  min-h-screen w-full">
          <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pt-2 sm:pt-0">
          <div className="flex items-center text-black">
            <h1 className="text-xl font-semibold text-gray-800">Zones</h1>
            <span className="px-3 py-1 bg-gray-100 rounded-md text-sm  text-black">
              Results {filteredZones.length}
            </span>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="px-2 py-1 border rounded-md text-sm text-black"
            >
              <option value="a-z">A → Z</option>
              <option value="z-a">Z → A</option>
             
            </select>
          </div>

          {/* Add Zone Button */}
          <button
            onClick={() => setActiveModal("add")}
            className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700"
          >
            + Add Zone
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 mb-6 text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200">
            {successMessage}
          </div>
        )}

        {/* Modals */}
        {activeModal === "add" && (
          <AddZoneModal
            onZoneAdded={handleAddZone}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === "edit" && (
          <EditZoneModel
            showEditForm={true}
            setShowEditForm={() => setActiveModal(null)}
            zoneToEdit={zoneToEdit}
            setZoneToEdit={setZoneToEdit}
            editedZoneName={editedZoneName}
            setEditedZoneName={setEditedZoneName}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            loadingOperation={loadingOperation}
            confirmEditZone={confirmEditZone}
            zones={zones}
          />
        )}

        {activeModal === "delete" && (
          <DeleteZoneModal
            show={true}
            setShow={() => setActiveModal(null)}
            zoneId={zoneToDelete}
            zoneName={zoneToDeleteName}
            confirmDelete={handleDeleteZone}
          />
        )}

        {/* Zones Table */}
        <div className="rounded-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 text-left text-sm text-gray-700">
              <tr>
                <th className="p-3 border-b">Zone ID</th>
                <th className="p-3 border-b">NAME</th>
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
              ) : getSortedZones().length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No zones found
                  </td>
                </tr>
              ) : (
                getSortedZones().map((zone) => (
                  <tr key={zone.zoneId} className="hover:bg-gray-50">
                    <td className="p-3 text-black">{zone.zoneId}</td>
                    <td className="p-3 ">
                      <span className="text-blue-600 hover:underline cursor-pointer">
                        {zone.zoneName}
                      </span>
                    </td>
                    <td className="p-3  text-right flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setZoneToEdit(zone.zoneId);
                          setEditedZoneName(zone.zoneName);
                          setActiveModal("edit");
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                        className="px-3 py-1 text-white rounded hover:bg-orange-500"
                      >
                        <Image
                          src="https://cdn-icons-png.flaticon.com/128/420/420140.png"
                          alt="Edit"
                          width={16}
                          height={16}
                        />
                      </button>

                      <button
                        onClick={() => {
                          setZoneToDelete(zone.zoneId);
                          setZoneToDeleteName(zone.zoneName);
                          setActiveModal("delete");
                        }}
                        className="px-3 py-1 text-white rounded hover:bg-red-300"
                      >
                        <Image
                          src="https://cdn-icons-png.flaticon.com/128/6861/6861362.png"
                          alt="Delete"
                          width={16}
                          height={16}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    
  );
}
