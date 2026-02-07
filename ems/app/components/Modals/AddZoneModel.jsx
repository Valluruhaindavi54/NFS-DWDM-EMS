"use client";
import React from "react";
import ThreeDModal from "./ThreeDModal";
import MagneticButton from "../../MagneticButton";

/* ---------------- ADD ZONE MODAL ---------------- */
const AddZoneModal = ({
  showAddZoneModal,
  setShowAddZoneModal,
  newZoneName,
  setNewZoneName,
  errorMessage,
  successMessage,
  setErrorMessage,
  setSuccessMessage,
  loadingOperation,
  confirmAddZone,
}) => {
  const closeModal = () => {
    setShowAddZoneModal(false);
    setNewZoneName("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <ThreeDModal show={showAddZoneModal} title="Add Zone" onClose={closeModal}>
      <div className="p-4">
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

        {/* Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Zone Name
          </label>
          <input
            type="text"
            value={newZoneName}
            onChange={(e) => {
              setNewZoneName(e.target.value);
              setErrorMessage("");
              setSuccessMessage("");
            }}
            disabled={loadingOperation}
            autoFocus
            placeholder="Enter zone name"
            className={`
              w-full px-3 py-2 rounded-lg
              bg-gray-50
              border
              shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]
              focus:outline-none
              focus:shadow-[0_0_0_3px_rgba(59,130,246,0.35)]
              transition-all
              ${errorMessage ? "border-red-500" : "border-gray-300"}
            `}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end bg-white/70 backdrop-blur-md px-4 py-3 rounded-b-2xl gap-2">
        {/* Close */}
        <MagneticButton
          onClick={closeModal}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Close
        </MagneticButton>

        {/* Add Zone */}
        <MagneticButton
          onClick={confirmAddZone}
          disabled={!newZoneName.trim() || loadingOperation || successMessage}
          className="
            px-4 py-2 rounded-lg text-white
            bg-blue-600 hover:bg-blue-700
            shadow-[0_6px_12px_rgba(0,0,0,0.35)]
            active:translate-y-[1px]
            transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loadingOperation ? "Adding..." : "Add Zone"}
        </MagneticButton>
      </div>
    </ThreeDModal>
  );
};

export default AddZoneModal;
