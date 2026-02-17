"use client";
import {SERVERID} from '@/app/Constaint';
export const useCircleHandlers = ({
    SERVERID,
    zones,
    circles,
    setCircles,
    nodes,
    setNodes,
    newCircleName,
    setNewCircleName,
    zoneToEdit,
    setZoneToEdit,
    topologyType,
    setTopologyType,
    circleToEdit,
    setCircleToEdit,
    editedCircleName,
    setEditedCircleName,
    setLoadingOperation,
    setErrorMessage,
    setSuccessMessage,
    setShowCircle
  }) => {
  const handleAddCircle = async () => {
  if (!newCircleName.trim() || !zoneToEdit || !topologyType) return;

  //  const token = localStorage.getItem("token"); //

  setLoadingOperation(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
    let token = JSON.parse(localStorage.getItem("emsToken"));
      if (!token) {
        throw new Error("Authentication token not found");
      }
    const response = await fetch(
      `http://${SERVERID}/api/v1/circles/${zoneToEdit}`,
      {
        method: "POST",
        headers: {
           Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          circleName: newCircleName.trim(),
          topologyType: topologyType.toLowerCase(), // match your API (mesh)
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      throw new Error(responseData.message || "Failed to add circle");
    }

    // Update local state
    setCircles((prev) => {
      const newCircles = { ...prev };
      if (!newCircles[zoneToEdit]) newCircles[zoneToEdit] = {};
      newCircles[zoneToEdit][responseData.data.circleId] = responseData.data.circleName;
      return newCircles;
    });

    setShowCircle((prev) => ({ ...prev, [zoneToEdit]: true }));
    setSuccessMessage(responseData.message || "Circle added successfully!");
    setErrorMessage("");

    // // Reset inputs after 2 seconds
    // setTimeout(() => {
    //   setNewCircleName("");
    //   setZoneToEdit("");
    //   setTopologyType("");
    //   setSuccessMessage("");
    //   setErrorMessage("");
    // }, 2000);

  } catch (error) {
    console.error("Error adding circle:", error);
    setErrorMessage(error.message);
  } finally {
    setLoadingOperation(false);
  }
};

  
   const handleEditCircle = async () => {
  if (!circleToEdit || !editedCircleName.trim()) return;

  setLoadingOperation(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
       let token = JSON.parse(localStorage.getItem("emsToken"));
      if (!token) {
        throw new Error("Authentication token not found");
      }
    const response = await fetch(
      `http://${SERVERID}/api/v1/circles/${circleToEdit}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          circleName: editedCircleName.trim(),
        }),
      }
    );

    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      throw new Error(responseData.message || "Failed to edit circle");
    }

    //  Update local state
    setCircles((prev) => {
      const updated = { ...prev };
      if (updated[zoneToEdit]) {
        updated[zoneToEdit][circleToEdit] = responseData.data.updatedName;
      }
      return updated;
    });

    setSuccessMessage(responseData.message);

  } catch (error) {
    console.error("Error editing circle:", error);
    setErrorMessage(error.message);
  } finally {
    setLoadingOperation(false);
  }
};

  
  const handleRemoveCircle = async () => {
  if (!zoneToEdit || !circleToEdit) return;

  setLoadingOperation(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
         let token = JSON.parse(localStorage.getItem("emsToken"));
      if (!token) {
        throw new Error("Authentication token not found");
      }
    const response = await fetch(
      `http://${SERVERID}/api/v1/circles/${circleToEdit}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      throw new Error(responseData.message || "Failed to remove circle");
    }

    //  Update Circles state
    setCircles((prev) => {
      const updated = { ...prev };

      if (updated[zoneToEdit]) {
        delete updated[zoneToEdit][circleToEdit];

        if (Object.keys(updated[zoneToEdit]).length === 0) {
          delete updated[zoneToEdit];
        }
      }
      return updated;
    });

    //  Update Nodes state (if dependent on circle)
    setNodes((prev) => {
      const updated = { ...prev };
      delete updated[circleToEdit];
      return updated;
    });

    setSuccessMessage(responseData.message);

    // // optional auto-reset
    // setTimeout(() => {
    //   setZoneToEdit("");
    //   setCircleToEdit("");
    //   setSuccessMessage("");
    //   setErrorMessage("");
    // }, 2000);

  } catch (error) {
    console.error("Error removing circle:", error);
    setErrorMessage(error.message);
  } finally {
    setLoadingOperation(false);
  }
};

  
    return { handleAddCircle, handleEditCircle, handleRemoveCircle };
  };