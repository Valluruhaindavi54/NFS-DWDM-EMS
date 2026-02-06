"use client";
import React from "react";
import Arrow from "./Arrow.tsx";

const HomeComponent = ({
  showZone,
  toggleZone,
  setShowAddZoneModal,
  sidebarCollapsed = false, // added prop
}) => {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2 rounded-md 
                  hover:bg-gray-700 transition-colors duration-200 cursor-pointer`}
      onClick={toggleZone}
    >
      <div className="flex items-center flex-grow space-x-2">
        <Arrow open={showZone} />
        {/* Hide text when collapsed */}
        {<span className="font-semibold text-gray-200">Home(Network)</span>}
      </div>

      {/* Always show + if sidebar is collapsed */}
      <button
        className={`text-lg font-bold transition-colors duration-200 
                    ${sidebarCollapsed ? "text-green-400 opacity-100" : "text-white opacity-100 hover:text-green-400"}`}
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
