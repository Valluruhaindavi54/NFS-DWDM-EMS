"use client";

import React, { useState, useEffect, useRef } from "react";
import { GlassCard } from "./ClientWrappers";

type Node = {
  id: string;
  name: string;
  ip: string;
  status: "UP" | "DOWN" | "MAINTENANCE" | string;
  type: string;
  region: string;
  uptime: string;
};

async function getData(endpoint: string): Promise<Node[]> {
  try {
    const res = await fetch(`/api/proxy?endpoint=${endpoint}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch (err) {
    console.error(`Fetch error for ${endpoint}:`, err);
    return [];
  }
}

export default function NodesCard() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const prevRef = useRef<Map<string, Node>>(new Map());
  const topRef = useRef<Node[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      const data = await getData("nodes");
      const changed = new Set<string>();
      const newTop: Node[] = [];

      data.forEach((node) => {
        const prev = prevRef.current.get(node.id);
        if (!prev || prev.status !== node.status || prev.uptime !== node.uptime) {
          changed.add(node.id);
          if (!topRef.current.find((n) => n.id === node.id)) newTop.push(node);
        }
      });
      console.log("Changed Nodes:", Array.from(changed));
      topRef.current = [
        ...newTop,
        ...topRef.current.filter((n) => !newTop.some((nn) => nn.id === n.id)),
      ];

      const rest = data.filter((n) => !topRef.current.some((t) => t.id === n.id));
      setNodes([...topRef.current, ...rest]);
      setHighlighted(changed);
      prevRef.current = new Map(data.map((n) => [n.id, n]));

      // clear highlight after 5s
      setTimeout(() => setHighlighted(new Set()), 5000);
    };

    fetchNodes();
    const id = setInterval(fetchNodes, 45000);
    return () => clearInterval(id);
  }, []);

  const statusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "UP":
        return "#10b981";
      case "DOWN":
        return "#ef4444";
      case "MAINTENANCE":
        return "#f97316";
      default:
        return "#facc15";
    }
  };

  const headerStyle: React.CSSProperties = {
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

  return (
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 12, color: "#ffffff" }}>
        Nodes List
      </h2>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 360 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "IP", "Status", "Type", "Region", "Uptime"].map((h) => (
                <th key={h} style={headerStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nodes.map((n) => {
              const isChanged = highlighted.has(n.id);
              return (
                <tr
                  key={n.id}
                  style={{
                    backgroundColor: isChanged ? "rgba(59,130,246,0.2)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={cellStyle}>{n.name}</td>
                  <td style={{ ...cellStyle, color: "#94a3b8" }}>{n.ip}</td>
                  <td style={{ ...cellStyle, color: statusColor(n.status) }}>{n.status}</td>
                  <td style={cellStyle}>{n.type}</td>
                  <td style={cellStyle}>{n.region}</td>
                  <td style={cellStyle}>{n.uptime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}