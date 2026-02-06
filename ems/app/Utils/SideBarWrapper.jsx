"use client";
import React, { useState } from "react";
import HomeComponent from "./HomeComponent";
import Header from "../components/Header";

const SideBarWrapper = ({ children, SelectedIp }) => {
  const [showZone, setShowZone] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);

  const toggleZone = () => setShowZone(!showZone);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const loggedInUserId = "26e44737-a774-48ac-9e76-38eb8f0cd23d";

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="bg-gray-900 text-gray-200 border-r border-gray-700 flex flex-col transition-all duration-300 ">
        <div className=" px-4 py-4 font-bold text-xl border-b border-gray-700 flex justify-between items-center cursor-pointer">
          <span className={`${sidebarCollapsed ? "hidden" : "block"}`}>
            EMS Dashboard
          </span>
        </div>

        <div className="mt-4">
          <HomeComponent
            showZone={showZone}
            toggleZone={toggleZone}
            setShowAddZoneModal={setShowAddZoneModal}
          />
          {showZone && !sidebarCollapsed && (
            <div className="ml-9 mt-2">
              <div className="text-gray-400 py-1 px-2">No zones found</div>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col bg-gray-800 text-gray-100 overflow-auto">
        {/* Header inside main content */}
        <Header loggedInUserId={loggedInUserId} />

        {/* Page content */}
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  );
};

export default SideBarWrapper;
