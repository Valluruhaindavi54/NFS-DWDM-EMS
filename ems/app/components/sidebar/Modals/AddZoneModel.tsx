"use client";

import { useState } from "react";
import { SERVERID } from "@/app/Constaint";

interface AddZoneModalProps {
  onZoneAdded: () => void;          // callback to refresh parent table
  onClose: () => void;              // callback to close modal
}

export default function AddZoneModal({ onZoneAdded, onClose }: AddZoneModalProps) {
  const [newZoneName, setNewZoneName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(
          data?.message || data?.error || "Zone already exists or backend rejected the request"
        );
      }

      setSuccessMessage("Zone added successfully!");
      setNewZoneName("");
      onZoneAdded(); // notify parent to refresh table
    } catch (err: any) {
      console.error("Add zone failed:", err);
      setErrorMessage(err.message || "Failed to add zone. Try again.");
    }
  };

  return (
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
        <div>{/* empty for layout balance */}</div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            setNewZoneName("");
            setErrorMessage("");
            setSuccessMessage("");
            onClose();
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
  );
}
