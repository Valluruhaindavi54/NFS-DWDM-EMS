"use client";
import React from 'react';
import Arrow from "./Utils/Arrow";

const ZoneComponent = ({
  zoneId,
  zoneName,
  showCircle,
  toggleCircle,
  circles,
  loading,
  nodes,
  showNode,
  toggleNode,
  ipStatus,
  SelectedIp,
  setSearchParams,
  setShowZoneOptionsModal,
  setShowCircleOptionsModal,
  setShowNodeOptionsModal,
  setSelectedNode,
  fetchAndSetNodeDetails
}) => {
  return (
    <div className="group">
      <div className="flex items-center justify-between hover:bg-gray-100 sidebar-item">
        <div
          className="flex items-center cursor-pointer px-4 py-2 flex-grow text-black"
          onClick={() => toggleCircle(zoneId)}
        >
          {/* <Arrow open={showCircle[zoneId]} /> */}
          <span>Zone({zoneName})</span>
        </div>
        <button
          className="button2 sidebar-button "
          onClick={(e) => {
            e.stopPropagation();
            setShowZoneOptionsModal({
              visible: true,
              zoneId: zoneId,
              zoneName: zoneName,
            });
          }}
        >
          +
        </button>
      </div>

      {/* {showCircle[zoneId] && (
        <div className="pl-6">
          {loading.circles ? (
            <div className="text-gray-500 py-1 px-2">Loading circles...</div>
          ) : !circles[zoneId] || Object.keys(circles[zoneId]).length === 0 ? (
            <div className="text-gray-500 py-1 px-2">No circles found</div>
          ) : (
            Object.entries(circles[zoneId]).map(([circleId, circleName]) => (
              <CircleComponent
                key={circleId}
                zoneId={zoneId}
                circleId={circleId}
                circleName={circleName}
                nodes={nodes}
                loading={loading}
                showNode={showNode}
                toggleNode={toggleNode}
                ipStatus={ipStatus}
                SelectedIp={SelectedIp}
                setSearchParams={setSearchParams}
                setShowCircleOptionsModal={setShowCircleOptionsModal}
                setShowNodeOptionsModal={setShowNodeOptionsModal}
                setSelectedNode={setSelectedNode}
                fetchAndSetNodeDetails={fetchAndSetNodeDetails}
              />
            ))
          )}
        </div>
      )} */}
    </div>
  );
};

export default ZoneComponent;