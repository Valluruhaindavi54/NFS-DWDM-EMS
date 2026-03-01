"use client";

import { useState } from "react";
import { AppContext } from "./AppContext";
import DirectionInnerInfoPopup from "../Cards/Roadam/RoadamInnerPopups/DirectionInnerInfoPopup";
import RoadmInnerDirectionInfoTab from "../Cards/Roadam/RoadamInnerPopups/RoadmInnerDirectionInfoTab";
import DirectionSetting from "../Cards/Roadam/RoadamInnerPopups/DirectionSetting";
import RoadamDirectionPortPopup from "../Cards/Roadam/RoadamInnerPopups/RoadamDirectionPortPopup";

// eslint-disable-next-line react/prop-types
const ContextProvider = ({ children }) => {
  const [OBA_OID, setOBAOID] = useState(null);
  // show hide the subpopup
  const [isShowSubPopup, setIsshowSubPopup] = useState(false);
  const [SelectedRoadm, setSelectedRodam] = useState(null);
  // roadam inner popup name
  const [RoadamInnerPopupName, setRoadamInnerPopupName] = useState(null);
  // Store direction number for popup
  const [directionNumber, setDirectionNumber] = useState(undefined);
  const setNewOBAOID = (oid) => {
    setOBAOID(oid);
  };
  const { TabContent } = RoadmInnerDirectionInfoTab({
    onCancel: () => setIsshowSubPopup(false),
    directionNumber,
  });

  // Debug logging for popup state
  console.log(
    "isShowSubPopup:",
    isShowSubPopup,
    "RoadamInnerPopupName:",
    RoadamInnerPopupName,
  );

  // selected SubPopup
  const selectedSubPopup = () => {
    switch (RoadamInnerPopupName) {
      case "DirectionInfo":
        return (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[700px] max-h-[80vh] flex flex-col">
              {TabContent}
            </div>
          </div>
        );

      case "DirectionSetting":
        return (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <DirectionSetting
              directionNumber={directionNumber}
              onCancel={() => setIsshowSubPopup(false)}
            />
          </div>
        );

      case "DirectionPort":
        return (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <RoadamDirectionPortPopup
              onCancel={() => setIsshowSubPopup(false)}
            />
          </div>
        );
      default:
        break;
    }
  };

  // Helper to open DirectionSetting popup with direction number
  const openDirectionSettingPopup = (number) => {
    setDirectionNumber(number);
    setRoadamInnerPopupName("DirectionSetting");
    setIsshowSubPopup(true);
  };

  // Helper to open DirectionInfo popup with direction number
  const openDirectionInfoPopup = (number) => {
    setDirectionNumber(number);
    setRoadamInnerPopupName("DirectionInfo");
    setIsshowSubPopup(true);
  };

  const info = {
    OBA_OID,
    setNewOBAOID,
    isShowSubPopup,
    setIsshowSubPopup,
    selectedSubPopup,
    SelectedRoadm,
    setSelectedRodam,
    setRoadamInnerPopupName,
    directionNumber,
    setDirectionNumber,
    openDirectionSettingPopup,
    openDirectionInfoPopup,
  };
  return <AppContext.Provider value={info}>{children}</AppContext.Provider>;
};
export default ContextProvider;
