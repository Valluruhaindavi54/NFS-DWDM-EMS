// ZoneHandlers.jsx
"use client";
export const useZoneHandlers = ({
    SERVERID,
    zones,
    setZones,
    newZoneName,
    setNewZoneName,
    zoneToEdit,
    setZoneToEdit,
    editedZoneName,
    setEditedZoneName,
    setLoadingOperation,
    setErrorMessage,
    setSuccessMessage
  }) => {
    const handleAddZone = async () => {
    if (!newZoneName.trim()) return;
    setLoadingOperation(true);
    setErrorMessage("");

    const zoneExists = zones.some(
      (zone) => zone.zoneName.toLowerCase() === newZoneName.trim().toLowerCase()
    );

    if (zoneExists) {
        setSuccessMessage(""); // clear previous success
      setErrorMessage(
        "This Zone Name already exists. Please try with another Zone Name."
      );
      setLoadingOperation(false);
      return;
    }

    try {
      let token = JSON.parse(localStorage.getItem("emsToken"));
      if (!token) {
        throw new Error("Authentication token not found");
      }
      const response = await fetch(`http://${SERVERID}/api/v1/zones`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ zoneName: newZoneName.trim() }),
      });

      const responseData = await response.json();
      
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to add zone");
      }

      // Add the new zone to the zones array
      const newZone = responseData.data;
      setZones((prev) => [...prev, {
        zoneId: newZone.zoneId,
        zoneName: newZone.zoneName
      }]);
      
      setSuccessMessage(responseData.message || "Zone added successfully!");
      setErrorMessage("");

      // setTimeout(() => {
      //   setNewZoneName("");
      //   setSuccessMessage("");
      //   setErrorMessage("");
      // }, 2000);
    } catch (error) {
      console.error("Error adding zone:", error);
      setErrorMessage(error.message || "An unexpected error occurred.");
    } finally {
      setLoadingOperation(false);
    }
  };


 const handleEditZone = async () => {
        if (!zoneToEdit || !editedZoneName.trim()) return;
        setLoadingOperation(true);
        setErrorMessage("");
    
        const zoneExists = zones.some(
          (zone) =>
            zone.zoneId !== zoneToEdit &&
            zone.zoneName.toLowerCase() === editedZoneName.trim().toLowerCase()
        );
    
        if (zoneExists) {
             setSuccessMessage(""); // clear previous success

          setErrorMessage(
            "This Zone Name already exists. Please try with another Zone Name."
          );
          setLoadingOperation(false);
          return;
        }
    
        try {
          if (!SERVERID) {
            throw new Error("Server ID not configured");
          }

          const id = Number(zoneToEdit);
          let token = JSON.parse(localStorage.getItem("emsToken"));
          if (!token) throw new Error("Auth token missing");

          const url = `http://${SERVERID}/api/v1/zones/${encodeURIComponent(id)}`;
          console.debug("Editing zone, request:", url, { zoneName: editedZoneName.trim() });

          const response = await fetch(url, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              zoneName: editedZoneName.trim(),
            }),
          });

          const responseData = await response.json();

          if (!response.ok || !responseData.success) {
            throw new Error(responseData.message || "Failed to edit zone");
          }

          // Use the server-returned zone data to update local state
          const updatedZone = responseData.data;
          setZones((prev) =>
            prev.map((zone) =>
              zone.zoneId === updatedZone.zoneId
                ? { ...zone, zoneName: updatedZone.zoneName }
                : zone
            )
          );
          setSuccessMessage(responseData.message || "Zone edited successfully!");
          setErrorMessage("");
    
          // setTimeout(() => {
          //   setZoneToEdit("");
          //   setEditedZoneName("");
          //   setSuccessMessage("");
          //   setErrorMessage("");
          // }, 2000);
        } catch (error) {
          console.error("Error editing zone:", error);
          setSuccessMessage("");
          setErrorMessage(error.message);
        } finally {
          setLoadingOperation(false);
        }
      };



  
      const handleRemoveZone = async () => {
  if (!zoneToEdit) return;
  setLoadingOperation(true);
  setErrorMessage("");

  try {
    const id = Number(zoneToEdit);
    if (isNaN(id)) {
      throw new Error("Invalid zone ID");
    }

    let token = JSON.parse(localStorage.getItem("emsToken"));
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`http://${SERVERID}/api/v1/zones/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        //"Content-Type": "application/json",
      },
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      throw new Error(responseData.message || "Failed to remove zone");
    }

    setZones((prev) => prev.filter((zone) => zone.zoneId !== id));
    setSuccessMessage(responseData.message || "Zone removed successfully!");
    setErrorMessage("");

    // setTimeout(() => {
    //   setZoneToEdit(null);
    //   setSuccessMessage("");
    //   setErrorMessage("");
    // }, 2000);
  } catch (error) {
    console.error("Error removing zone:", error);
    setErrorMessage(error.message || "An unexpected error occurred.");
  } finally {
    setLoadingOperation(false);
  }
};
    return { handleAddZone, handleEditZone, handleRemoveZone };
  };