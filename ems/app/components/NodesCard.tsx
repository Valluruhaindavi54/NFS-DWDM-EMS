"use client";

import React, { useState, useEffect, useRef } from "react";
import GlassCard from "./GlassCard";

async function getData(endpoint: string) {
  const url = `/api/proxy?endpoint=${endpoint}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (err: any) {
    console.error(`Fetch error for ${endpoint}:`, err.message);
    return [];
  }
}

export default function NodesCard() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const prevNodesRef = useRef<any[]>([]);
  const topNodesRef = useRef<any[]>([]); // persistent top nodes

  useEffect(() => {
    const fetchNodes = async () => {
      const fetchedData = await getData("nodes");

      const currentChanged = new Set<string>();
      const newOrChangedNodes: any[] = [];

      fetchedData.forEach((node: any) => {
        const prevNode = prevNodesRef.current.find((n) => n.id === node.id);
        if (!prevNode || JSON.stringify(node) !== JSON.stringify(prevNode)) {
          currentChanged.add(node.id);

          if (!topNodesRef.current.find((n) => n.id === node.id)) {
            newOrChangedNodes.push(node);
          }
        }
      });

      if (newOrChangedNodes.length > 0) {
        console.log("New/Changed Nodes:", newOrChangedNodes);
      }

      // Keep a copy of old top nodes for removal detection
      const oldTopNodes = [...topNodesRef.current];

      // Prepend new/changed nodes to top nodes
      topNodesRef.current = [
        ...newOrChangedNodes,
        ...topNodesRef.current.filter(
          (n) => !newOrChangedNodes.some((nn) => nn.id === n.id)
        ),
      ];

      // Find nodes removed from top
      const removedNodes = oldTopNodes.filter(
        (oldNode) => !topNodesRef.current.find((n) => n.id === oldNode.id)
      );
      if (removedNodes.length > 0) {
        console.log("Removed Nodes from Top:", removedNodes);
      }

      // Merge with other nodes not in top
      const otherNodes = fetchedData.filter(
        (n) => !topNodesRef.current.find((tn) => tn.id === n.id)
      );

      const sortedNodes = [...topNodesRef.current, ...otherNodes];

      setNodes(sortedNodes);
      setHighlightedNodes(currentChanged);
      prevNodesRef.current = fetchedData;
      setLoading(false);
    };

    fetchNodes();
    const interval = setInterval(fetchNodes, 2000);
    return () => clearInterval(interval);
  }, []);

  const tableHeaderStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    background: "#1e293b",
    zIndex: 2,
    fontSize: "10px",
    textTransform: "uppercase",
    color: "#ffffff",
    padding: "10px 8px",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const cellStyle: React.CSSProperties = {
    padding: "10px 8px",
    fontSize: "11px",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    color: "#ffffff",
  };

  if (loading) return <div>Loading Nodes...</div>;

  return (
    <GlassCard style={{minHeight: "420px", display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", color: "#ffffff" }}>
        Nodes List
      </h2>
    <div style={{ overflowY: "auto", flex: 1, maxHeight: "300px", minHeight: "360px"}}>

  <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>IP</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Type</th>
              <th style={tableHeaderStyle}>Region</th>
              <th style={tableHeaderStyle}>Uptime</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node, i) => {
              const isRecentlyUpdated = highlightedNodes.has(node.id);
              return (
                <tr
                  key={node.id || i}
                  style={{
                    backgroundColor: isRecentlyUpdated ? "rgba(59, 130, 246, 0.2)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={{ ...cellStyle, fontWeight: "500" }}>
                    {node.name} {isRecentlyUpdated && " ●"}
                  </td>
                  <td style={{ ...cellStyle, fontFamily: "monospace" }}>{node.ip}</td>
                  <td
                    style={{
                      ...cellStyle,
                      fontWeight: "bold",
                      color:
                        node.status?.toUpperCase() === "UP"
                          ? "#22c55e"
                          : node.status?.toUpperCase() === "DOWN"
                          ? "#ef4444"
                          : "#f97316",
                    }}
                  >
                    {node.status?.toUpperCase()}
                  </td>
                  <td style={cellStyle}>{node.type}</td>
                  <td style={cellStyle}>{node.region}</td>
                  <td style={cellStyle}>{node.uptime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
