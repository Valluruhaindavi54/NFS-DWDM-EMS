"use client";

import React from "react";
import ThreeDModal from "./ThreeDModal";
import MagneticButton from "../../../MagneticButton";
import { useState } from "react";

interface EditZoneModelProps {
  showEditForm: boolean;
  setShowEditForm: (value: boolean) => void;
  zoneToEdit: string;
  setZoneToEdit: (value: string) => void;
  editedZoneName: string;
  setEditedZoneName: (value: string) => void;
  errorMessage: string;
  setErrorMessage: (value: string) => void;
  successMessage: string;
  setSuccessMessage: (value: string) => void;
  loadingOperation: boolean;
  confirmEditZone: () => void;
  zones: { zoneId: number; zoneName: string }[];
}
const EditZoneModel: React.FC<EditZoneModelProps> = ({
  showEditForm,
  setShowEditForm,
  zoneToEdit,
  setZoneToEdit,
  editedZoneName,
  setEditedZoneName,
  errorMessage,
  setErrorMessage,
  successMessage,
  setSuccessMessage,
  loadingOperation,
  confirmEditZone,
  zones,
}) => {
  const closeModal = () => {
    setShowEditForm(false);
    setZoneToEdit("");
    setEditedZoneName("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  if (!showEditForm) return null;
const selectedZone = zones.find(z => z.zoneId === zoneToEdit);
  return (
    <div className="border rounded-lg p-6 mb-6 bg-white">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
      Edit <span className="text-blue-600">{selectedZone?.zoneName}</span> Zone
    </h2>
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm shadow-inner">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-2 bg-green-100 text-green-600 rounded text-sm shadow-inner">
            {successMessage}
          </div>
        )}

        {/* Zone Select */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Zone Name
          </label>
          <input
            type="text"
            value={editedZoneName}
            onChange={(e) => {
              setEditedZoneName(e.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            placeholder="Enter new zone name"
            disabled={loadingOperation}
            className="w-full px-3 py-2 text-black rounded-lg bg-gray-50 border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>
         <div>{/* empty for layout balance */}</div>
        </div>
      

      {/* Footer */}
      <div className="flex justify-end bg-gray-60 backdrop-blur-md px-4 py-3 rounded-b-2xl gap-2">
        <button
          onClick={closeModal}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>

        <button
          onClick={confirmEditZone}
          disabled={!zoneToEdit || !editedZoneName.trim() || loadingOperation || successMessage !== ""}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        
        >
          {loadingOperation ? "Editing..." : "Edit Zone"}
        </button>
      </div>
   </div>
  );
};

export default EditZoneModel;
