"use client";

import { useEffect } from "react";

export const useFormEffects = ({
  editNodeCircleId,
  setShowNode,
  editNodeType,
  setEditChannelType,
  showEditNodeModal,
  setLoading,
  fetchAndSetNodeDetails,
  setEditNewIpAddress,
  setIsDeconfigured,
  setErrorMessage,
  setSuccessMessage,
  lastAddedNode,
  setNodes,
  SERVERID
}) => {

  /* ---------------------------------------------
   * Effect 1: When Circle changes (Edit Node)
   * --------------------------------------------- */
  useEffect(() => {
    if (!editNodeCircleId) return;

    setEditNewIpAddress("");
    setIsDeconfigured(false);
    setErrorMessage("");
    setSuccessMessage("");

    setShowNode(prev => ({
      ...prev,
      [editNodeCircleId]: true
    }));
  }, [editNodeCircleId]);


  /* ---------------------------------------------
   * Effect 2: Node Type handling
   * --------------------------------------------- */
  useEffect(() => {
    if (editNodeType === "TerminalwithAcSupply") {
      setEditChannelType("external");
    }
  }, [editNodeType]);


  /* ---------------------------------------------
   * Effect 3: Edit Node Modal Open
   * Fetch ONLY selected node details
   * --------------------------------------------- */

  useEffect(() => {
  if (!showEditNodeModal.visible || !showEditNodeModal.node?.nodeDetailsId) {
    return;
  }

  const fetchNodeData = async () => {
    setLoading(prev => ({ ...prev, nodeIPs: true }));

    try {
      const token = JSON.parse(localStorage.getItem("emsToken"));

      // ✅ AUTO-FETCH NODE DETAILS WHEN MODAL OPENS
      await fetchAndSetNodeDetails(showEditNodeModal.node.nodeDetailsId);

    } catch (error) {
      console.error("Error fetching node data:", error);
      setErrorMessage("Unable to fetch node data");
    } finally {
      setLoading(prev => ({ ...prev, nodeIPs: false }));
    }
  };

  fetchNodeData();
}, [
  showEditNodeModal.visible,
  showEditNodeModal.node?.nodeDetailsId
]);

  // useEffect(() => {
  //   if (!showEditNodeModal.visible) return;

  //   const fetchNodeData = async () => {
  //     try {
  //       setLoading(prev => ({ ...prev, nodeDetails: true }));

  //       if (showEditNodeModal.node?.nodeID) {
  //         await fetchAndSetNodeDetails(
  //           showEditNodeModal.node.nodeID,
  //           showEditNodeModal.node.nodeIPAddress
  //         );
  //       }

  //     } catch (error) {
  //       console.error("Error fetching node details:", error);
  //       setErrorMessage("Unable to fetch node details");
  //     } finally {
  //       setLoading(prev => ({ ...prev, nodeDetails: false }));
  //     }
  //   };

  //   fetchNodeData();
  // }, [
  //   showEditNodeModal.visible,
  //   showEditNodeModal.node?.nodeID
  // ]);


  /* ---------------------------------------------
   * Effect 4: After adding a new node
   * Refresh node list ONLY
   * --------------------------------------------- */
  useEffect(() => {
    if (!lastAddedNode?.circleID) return;

    const fetchUpdatedNodes = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("emsToken"));

        const nodeRes = await fetch(
          `http://${SERVERID}/api/v1/nodes/${lastAddedNode.circleID}/1/100`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const json = await nodeRes.json();
        const updatedNodes = json?.data?.content || json?.data || [];

        setNodes(prev => ({
          ...prev,
          [lastAddedNode.circleID]: updatedNodes
        }));

      } catch (error) {
        console.error("Error updating nodes after add:", error);
      }
    };

    fetchUpdatedNodes();
  }, [lastAddedNode]);


};

