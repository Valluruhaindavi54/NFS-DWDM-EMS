"use client";
import React from "react";

type ConfirmationState = {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  action?: string | null;
};

const ConfirmationModal = ({
  showConfirmationModal,
  setShowConfirmationModal,
}: {
  showConfirmationModal: ConfirmationState;
  setShowConfirmationModal: React.Dispatch<React.SetStateAction<ConfirmationState>>;
}) => {
  if (!showConfirmationModal || !showConfirmationModal.visible) return null;
const handleConfirm = async () => {
  // Call the passed in onConfirm function
  await showConfirmationModal.onConfirm?.();

  // Close the modal
  setShowConfirmationModal({
    visible: false,
    action: null,
    message: "",
    onConfirm: () => {},
  });
};


  const handleCancel = () => {
    setShowConfirmationModal({
      visible: false,
      action: null,
      message: "",
      onConfirm: () => {},
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-96">
        <div className="bg-yellow-500 text-white px-4 py-3 rounded-t-lg">
          <h3 className="font-semibold text-lg">Confirm Action</h3>
        </div>
        <div className="p-4 text-gray-700">
          <p>{showConfirmationModal.message}</p>
        </div>
        <div className="flex justify-end gap-2 bg-gray-100 px-4 py-3 rounded-b-lg">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirm
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 font-medium hover:text-gray-800 border border-gray-300 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
