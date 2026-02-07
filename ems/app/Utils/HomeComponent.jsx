"use client";
import React from "react";
import Arrow from "./Arrow.tsx";
const HomeComponent = ({
  showZone,
  toggleZone,
  setShowAddZoneModal,
  sidebarCollapsed = false,
}) => {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 cursor-pointer`}
      onClick={toggleZone}
    >
      <div className="flex items-center space-x-2">
        <Arrow open={showZone} />
        <span className="font-semibold text-gray-200">Home(Network)</span>
      </div>

      <button
        className={`ml-6 text-lg font-bold text-white transition-colors duration-200 hover:text-green-400`}
        onClick={(e) => {
          e.stopPropagation();
          setShowAddZoneModal(true);
        }}
      >
        +
      </button>
    </div>
  );
};

export default HomeComponent;
