"use client";
import { useEffect } from 'react';
import {SERVERID} from '@/app/Constaint';
export const useNodeStatusEffects = ({
  SERVERID,
  setIsNodeStatusPolling,
  nodes,
  ipStatus,
  setIpStatus
}) => {
  // Start/stop polling effect
  useEffect(() => {
    const startPolling = async () => {
      try {
        let token = JSON.parse(localStorage.getItem("emsToken"));
        await fetch(`http://${SERVERID}/api/v1/nodestatus/start`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsNodeStatusPolling(true);
        console.log("Node status polling started")
      } catch (error) {
        console.error("Error starting node status polling:", error);
      }
    };

    startPolling();

    return () => {
      const stopPolling = async () => {
        console.log("going to stop polling");
        try {
          let token = JSON.parse(localStorage.getItem("emsToken"));
          await fetch(`http://${SERVERID}/api/v1/nodestatus/stop`, {
            method: "POST",
            headers: {
            Authorization: `Bearer ${token}`,
          },
          });
          console.log("Node status polling stopped");
        } catch (error) {
          console.error("Error stopping node status polling:", error);
        }
      };
      stopPolling();
    };
  }, []);

  // Node reachability check effect
  useEffect(() => {
    const checkAllNodesReachability = async () => {
      const allNodes = Object.values(nodes).flat();
      if (allNodes.length === 0) return;

      // Collect all unique IPs that need status check
      const ipsToCheck = allNodes
        .map(node => node.nodeIpAddress)
        .filter(ip => ip !== "0.0.0.0" && (!ipStatus[ip] || ipStatus[ip] === "loading"));

      if (ipsToCheck.length === 0) return;

      try {
        let token = JSON.parse(localStorage.getItem("emsToken"));
        const statusRes = await fetch(`http://${SERVERID}/api/v1/nodestatus/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const statusData = await statusRes.json();

        // Update status for all IPs at once
        setIpStatus(prev => {
          const updated = { ...prev };
          ipsToCheck.forEach(ip => {
            updated[ip] = statusData[ip] || "0";
          });
          return updated;
        });
      } catch (error) {
        console.error("Error fetching node statuses:", error);
        setIpStatus(prev => {
          const updated = { ...prev };
          ipsToCheck.forEach(ip => {
            updated[ip] = "0";
          });
          return updated;
        });
      }
    };

    checkAllNodesReachability();
    const intervalId = setInterval(checkAllNodesReachability, 30000);
    return () => clearInterval(intervalId);
  }, [nodes]);
};