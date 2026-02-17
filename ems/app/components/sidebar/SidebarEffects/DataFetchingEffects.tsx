"use client";
import { useEffect } from "react";
import { SERVERID as SERVER_CONST } from "@/app/Constaint";

export const useDataFetchingEffects = ({
  SERVERID,
  showZone,
  showCircle,
  showNode,
  zoneToEdit,
  nodeZoneId,
  nodeCircleId,
  editNodeZoneId,
  showRemoveNodeModal,
  showAddZoneModal,
  showRemoveZoneModal,
  showEditZoneModal,
  setZones,
  setCircles,
  setNodes,
  setLoading,
  setIpStatus,
  nodes,
  circles,
}) => {
  // Stable values for optional props
  const removeNodeZoneId = showRemoveNodeModal?.zoneId ?? null;
  const removeNodeCircleId = showRemoveNodeModal?.circleId ?? null;

  // ---------------------------
  // Fetch zones
  // ---------------------------
  useEffect(() => {
    if (!showZone) return;

    const fetchZones = async () => {
      setLoading(prev => ({ ...prev, zones: true }));
      try {
        const token = JSON.parse(localStorage.getItem("emsToken") || "null");
        const response = await fetch(`http://${SERVERID}/api/v1/zones`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch zones");

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setZones(prevZones => {
            const existingIds = new Set(prevZones.map(z => z.zoneId));
            const merged = [...prevZones];
            data.data.forEach(z => {
              if (!existingIds.has(z.zoneId)) merged.push(z);
            });
            return merged;
          });
        }
      } catch (err) {
        console.error("Error fetching zones:", err);
      } finally {
        setLoading(prev => ({ ...prev, zones: false }));
      }
    };

    fetchZones();
  }, [showZone, SERVERID, setZones, setLoading]);

  // ---------------------------
  // Fetch circles
  // ---------------------------
  useEffect(() => {
    const fetchCircles = async () => {
      const newCircles = { ...circles };

      const zonesToFetch = [
        ...Object.keys(showCircle || {}).filter(zoneId => showCircle[zoneId]),
        ...(zoneToEdit && !circles[zoneToEdit] ? [zoneToEdit] : []),
        ...(nodeZoneId && !circles[nodeZoneId] ? [nodeZoneId] : []),
        ...(editNodeZoneId && !circles[editNodeZoneId] ? [editNodeZoneId] : []),
        ...(removeNodeZoneId && !circles[removeNodeZoneId] ? [removeNodeZoneId] : []),
      ];

      if (zonesToFetch.length === 0) return;

      setLoading(prev => ({ ...prev, circles: true }));

      try {
        for (const zoneId of zonesToFetch) {
          if (!newCircles[zoneId]) {
            const token = JSON.parse(localStorage.getItem("emsToken") || "null");
            const response = await fetch(`http://${SERVERID}/api/v1/circles/${zoneId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const data = await response.json();
              const circleMap: Record<number, string> = {};
              if (data.success && Array.isArray(data.data)) {
                data.data.forEach(circle => {
                  circleMap[circle.circleId] = circle.circleName;
                });
              }
              newCircles[zoneId] = circleMap;
            } else {
              newCircles[zoneId] = {};
            }
          }
        }
        setCircles(newCircles);
      } catch (err) {
        console.error("Error fetching circles:", err);
      } finally {
        setLoading(prev => ({ ...prev, circles: false }));
      }
    };

    fetchCircles();
  }, [
    showCircle,
    zoneToEdit,
    nodeZoneId,
    editNodeZoneId,
    removeNodeZoneId,
    circles,
    SERVERID,
    setCircles,
    setLoading,
  ]);

  // ---------------------------
  // Fetch nodes
  // ---------------------------
  useEffect(() => {
    const fetchNodesForCircles = async () => {
      const circlesToFetch = [
        ...Object.keys(showNode || {}).filter(circleId => showNode[circleId]),
        ...(removeNodeCircleId &&
        !nodes[removeNodeCircleId] &&
        !nodes[Number(removeNodeCircleId)]
          ? [removeNodeCircleId]
          : []),
      ];

      if (circlesToFetch.length === 0) return;

      setLoading(prev => ({ ...prev, nodes: true }));

      try {
        const newNodes = { ...nodes };

        for (const circleId of circlesToFetch) {
          const numericCircleId = Number(circleId);
          const existingNodes = nodes[circleId] || nodes[numericCircleId];

          if (!existingNodes || existingNodes.length === 0 || showNode[circleId] || showNode[numericCircleId]) {
            const token = JSON.parse(localStorage.getItem("emsToken") || "null");
            const response = await fetch(`http://${SERVERID}/api/v1/nodes/${numericCircleId}/1/100`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && Array.isArray(data.data)) {
                newNodes[numericCircleId] = data.data;
                data.data.forEach(node => {
                  setIpStatus(prev => ({ ...prev, [node.nodeIpAddress]: "loading" }));
                });
              }
            }
          }
        }

        setNodes(newNodes);
      } catch (err) {
        console.error("Error fetching nodes:", err);
      } finally {
        setLoading(prev => ({ ...prev, nodes: false }));
      }
    };

    fetchNodesForCircles();
  }, [showNode, removeNodeCircleId, nodes, SERVERID, setNodes, setLoading, setIpStatus]);

  // ---------------------------
  // Fetch nodes for AdjacentNE dropdown
  // ---------------------------
  useEffect(() => {
    if (!nodeCircleId) return;

    const numericNodeCircleId = Number(nodeCircleId);

    if ((nodes[nodeCircleId]?.length || nodes[numericNodeCircleId]?.length)) return;

    const fetchNodesForAdjacentNE = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("emsToken") || "null");
        const res = await fetch(`http://${SERVERID}/api/v1/nodes/${numericNodeCircleId}/1/100`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        const nodeList = json?.data?.content || json?.data || [];

        setNodes(prev => ({
          ...prev,
          [numericNodeCircleId]: nodeList,
        }));
      } catch (err) {
        console.error("Failed to fetch nodes for Adjacent NE", err);
      }
    };

    fetchNodesForAdjacentNE();
  }, [nodeCircleId, nodes, SERVERID, setNodes]);
};
