"use client";

import React from "react";

interface DeleteZoneModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  zoneId: number | null;
zoneName: string | null;
  confirmDelete: () => void;
}

const DeleteZoneModal: React.FC<DeleteZoneModalProps> = ({
  show,
  setShow,
  zoneId,
   zoneName,
  confirmDelete,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          Delete Zone
        </h2>

        <p className="mb-6 text-gray-700">
  Are you sure you want to delete{" "}
  <span className="font-semibold text-red-600">
    {zoneName}
  </span>{" "}
  zone?
</p>


        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 border rounded-md text-black hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteZoneModal;
