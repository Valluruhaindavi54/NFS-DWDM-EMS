"use client";

import React from "react";
import ThreeDModal from "./ThreeDModal";
import MagneticButton from "../../../MagneticButton";

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

  return (
       <div className="border rounded-lg p-6 mb-6 bg-white">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Zone</h2>

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
        <div className="mb-4 flex gap-4">
        <div className=" flex-1 m-0 p-0">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Zone Name
          </label>
          <select
            className="w-full px-3 py-2 text-black rounded-lg bg-gray-50 border border-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            value={zoneToEdit}
            onChange={(e) => {
              const val = e.target.value;
              setZoneToEdit(val);
              const found = zones.find((z) => String(z.zoneId) === String(val));
              setEditedZoneName(found ? found.zoneName : "");
              setErrorMessage("");
              setSuccessMessage("");
            }}
            disabled={loadingOperation}
          >
            <option value="">Select Zone</option>
            {zones.map((z) => (
              <option key={z.zoneId} value={z.zoneId}>
                {z.zoneName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4 flex-1 m-0 p-0">
          <label className="block  text-gray-700 text-sm font-semibold mb-2">
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
        </div>
      

      {/* Footer */}
      <div className="flex justify-end bg-gray-60 backdrop-blur-md px-4 py-3 rounded-b-2xl gap-2">
        <MagneticButton
          onClick={closeModal}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Close
        </MagneticButton>

        <MagneticButton
          onClick={confirmEditZone}
          disabled={!zoneToEdit || !editedZoneName.trim() || loadingOperation || successMessage !== ""}
          className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow active:translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingOperation ? "Editing..." : "Edit Zone"}
        </MagneticButton>
      </div>
   </div>
  );
};

export default EditZoneModel;
