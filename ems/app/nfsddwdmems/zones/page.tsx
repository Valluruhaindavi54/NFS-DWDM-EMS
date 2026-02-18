"use client";
import { useEffect, useReducer, useState } from "react";
import Image from "next/image";
import {useRouter} from "next/navigation";

import SideBarWrapper from "../../components/sidebar/SideBarWrapper";
import { SERVERID } from "@/app/Constaint";
import AddZoneModal from "@/app/components/sidebar/Modals/AddZoneModel";
import EditZoneModel from "@/app/components/sidebar/Modals/EditZoneModel";
import DeleteZoneModal from "@/app/components/sidebar/Modals/DeleteZoneModal";

export default function ZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [filteredZones, setFilteredZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router=useRouter();

  const [showEditForm, setShowEditForm] = useState(false);
const [zoneToEdit, setZoneToEdit] = useState("");
const [editedZoneName, setEditedZoneName] = useState("");
const [loadingOperation, setLoadingOperation] = useState(false);
const [showRemoveZoneModal, setShowRemoveZoneModal] = useState(false);
const [zoneToDelete, setZoneToDelete] = useState<number | null>(null);
const [zoneToDeleteName, setZoneToDeleteName] = useState<string | null>(null);

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

  // --------------------EDit Zone--------------------
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
    setTimeout(() => setSuccessMessage(""), 1500);
    setShowEditForm(false);
    setZoneToEdit("");
    setEditedZoneName("");
    fetchZones();
  } catch (err: any) {
    setErrorMessage(err.message || "Failed to edit zone");
  } finally {
    setLoadingOperation(false);
  }
};
// Delete logic
const handleDeleteZone = async () => {
  if (!zoneToDelete) return;

  try {
    const token = JSON.parse(localStorage.getItem("emsToken") || "null");

    const res = await fetch(`http://${SERVERID}/api/v1/zones/${zoneToDelete}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to delete zone");

    setShowRemoveZoneModal(false);
    setZoneToDelete(null);
    fetchZones();
     
    setSuccessMessage("Zone deleted successfully!");
    setTimeout(() => setSuccessMessage(""), 1500);
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Failed to delete zone");
  }
};

  return (<SideBarWrapper>
  <div className="bg-white p-4 sm:p-6 min-h-screen w-full">

    {/* Header */}
    <div className="flex justify-between items-center mb-4 pt-2 sm:pt-0">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-800">Zones</h1>
        <span className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
          Results {filteredZones.length}
        </span>
      </div>

      {/* Add Zone Button */}
      <button
        onClick={() => setShowAddForm(true)}
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

    {/* Add and Edit Modals Side by Side */}
    <div className="flex gap-6 mb-6">
      {showAddForm && (
        <AddZoneModal
          onZoneAdded={() => {
            fetchZones();
            setSuccessMessage("Zone added successfully!");
            setShowAddForm(false);
           setTimeout(() => setSuccessMessage(""), 1500);
          }}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showEditForm && (
        <EditZoneModel
          showEditForm={showEditForm}
          setShowEditForm={setShowEditForm}
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

       {/* Delete Zone Modal */}
    {showRemoveZoneModal && (
      <DeleteZoneModal
        show={showRemoveZoneModal}
        setShow={setShowRemoveZoneModal}
        zoneId={zoneToDelete}
        zoneName={zoneToDeleteName}
        confirmDelete={handleDeleteZone}
      />)}
    </div>

    {/* Zones Table */}
    <div className="border rounded-md overflow-hidden">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 text-left text-sm text-gray-700">
          <tr>
            <th className="p-3 border-b"><input type="checkbox" /></th>
            <th className="p-3 border-b">NAME</th>
            <th className="p-3 border-b">SITES</th>
            <th className="p-3 border-b">DESCRIPTION</th>
            <th className="p-3 border-b text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">Loading zones...</td>
            </tr>
          ) : filteredZones.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">No zones found</td>
            </tr>
          ) : (
            filteredZones.map((zone) => (
              <tr key={zone.zoneId} className="hover:bg-gray-50">
                <td className="p-3 border-b"><input type="checkbox" /></td>
                <td className="p-3 border-b">
                  <span className="text-blue-600 hover:underline cursor-pointer">{zone.zoneName}</span>
                </td>
                <td className="p-3 border-b">{zone.siteCount || 0}</td>
                <td className="p-3 border-b">—</td>
                <td className="p-3 border-b text-right flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setZoneToEdit(zone.zoneId);
                      setEditedZoneName(zone.zoneName);
                      setShowEditForm(true);
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
    setShowRemoveZoneModal(true);
  }}
                  className="px-3 py-1 text-white rounded hover:bg-red-300">
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
</SideBarWrapper>

  );
}
