"use client";
import { useEffect } from "react";
import { useAbortOnRouteChange } from "@/app/useAbortOnRouteChange";

export const useDataFetchingEffects = ({
  SERVERID,
  showZone,
  showCircle,
  showNode,
  zoneToEdit,
  nodeZoneId,
  nodeCircleId,
  editNodeZoneId,
  setZones,
  setCircles,
  setNodes,
  setLoading,
  setIpStatus,
  nodes,
  circles,
  isZonesPage,
}) => {
  const { addController } = useAbortOnRouteChange();

  // ---------------- Fetch Zones ----------------
  useEffect(() => {
    if (!showZone || isZonesPage) return;

    const controller = new AbortController();
    addController(controller);

    const fetchZones = async () => {
      setLoading((prev) => ({ ...prev, zones: true }));
      try {
        const token = JSON.parse(localStorage.getItem("emsToken") || "null");
        const res = await fetch(`http://${SERVERID}/api/v1/zones`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch zones");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) setZones(data.data);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading((prev) => ({ ...prev, zones: false }));
      }
    };

    fetchZones();
  }, [showZone, SERVERID, setZones, setLoading, isZonesPage]);

  // ---------------- Fetch Circles ----------------
  useEffect(() => {
    if (isZonesPage) return;

    const controller = new AbortController();
    addController(controller);

    const fetchCircles = async () => {
      const newCircles = { ...circles };
      const zonesToFetch = [
        ...Object.keys(showCircle || {}).filter((z) => showCircle[z]),
        ...(zoneToEdit && !circles[zoneToEdit] ? [zoneToEdit] : []),
        ...(nodeZoneId && !circles[nodeZoneId] ? [nodeZoneId] : []),
        ...(editNodeZoneId && !circles[editNodeZoneId] ? [editNodeZoneId] : []),
      ];
      if (!zonesToFetch.length) return;

      setLoading((prev) => ({ ...prev, circles: true }));

      try {
        for (const zoneId of zonesToFetch) {
          if (!newCircles[zoneId]) {
            const token = JSON.parse(localStorage.getItem("emsToken") || "null");
            const res = await fetch(`http://${SERVERID}/api/v1/circles/${zoneId}`, {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
            });
            if (res.ok) {
              const data = await res.json();
              const circleMap: Record<number, string> = {};
              if (data.success && Array.isArray(data.data)) {
                data.data.forEach((circle) => {
                  circleMap[circle.circleId] = circle.circleName;
                });
              }
              newCircles[zoneId] = circleMap;
            } else newCircles[zoneId] = {};
          }
        }
        setCircles(newCircles);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading((prev) => ({ ...prev, circles: false }));
      }
    };

    fetchCircles();
  }, [showCircle, zoneToEdit, nodeZoneId, editNodeZoneId, circles, SERVERID, setCircles, setLoading, isZonesPage]);

  // ---------------- Fetch Nodes ----------------
  useEffect(() => {
    if (isZonesPage) return;

    const controller = new AbortController();
    addController(controller);

    const fetchNodesForCircles = async () => {
      const circlesToFetch = [...Object.keys(showNode || {}).filter((c) => showNode[c])];
      if (!circlesToFetch.length) return;

      setLoading((prev) => ({ ...prev, nodes: true }));

      try {
        const newNodes = { ...nodes };
        for (const circleId of circlesToFetch) {
          const numericId = Number(circleId);
          if (!newNodes[numericId] || newNodes[numericId].length === 0) {
            const token = JSON.parse(localStorage.getItem("emsToken") || "null");
            const res = await fetch(`http://${SERVERID}/api/v1/nodes/${numericId}/1/100`, {
              headers: { Authorization: `Bearer ${token}` },
              signal: controller.signal,
            });
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.data)) {
                newNodes[numericId] = data.data;
                data.data.forEach((node) => {
                  setIpStatus((prev) => ({ ...prev, [node.nodeIpAddress]: "loading" }));
                });
              }
            }
          }
        }
        setNodes(newNodes);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading((prev) => ({ ...prev, nodes: false }));
      }
    };

    fetchNodesForCircles();
  }, [showNode, nodes, SERVERID, setNodes, setLoading, setIpStatus, isZonesPage]);

  // ---------------- Fetch Nodes for AdjacentNE ----------------
  useEffect(() => {
    if (isZonesPage || !nodeCircleId) return;

    const controller = new AbortController();
    addController(controller);

    const numericNodeCircleId = Number(nodeCircleId);
    if ((nodes[nodeCircleId]?.length || nodes[numericNodeCircleId]?.length)) return;

    const fetchNodesForAdjacentNE = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("emsToken") || "null");
        const res = await fetch(`http://${SERVERID}/api/v1/nodes/${numericNodeCircleId}/1/100`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const json = await res.json();
        const nodeList = json?.data?.content || json?.data || [];
        setNodes((prev) => ({ ...prev, [numericNodeCircleId]: nodeList }));
      } catch (err: any) {
        if (err.name !== "AbortError") console.error(err);
      }
    };

    fetchNodesForAdjacentNE();
  }, [nodeCircleId, nodes, SERVERID, setNodes, isZonesPage]);
};
