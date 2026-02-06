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

export default function NodesCard() {

  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
const [orderedNodes, setOrderedNodes] = useState<Node[]>([]);
const prevRef = useRef<Map<string, Node>>(new Map());
const topRef = useRef<Node[]>([]);
const [nodes, setNodes] = useState<any[]>([]);
useEffect(() => {
  if (!nodes.length) return;

  const changed = new Set<string>();
  const newTop: Node[] = [];

  nodes.forEach((node) => {
    const prev = prevRef.current.get(node.id);
    if (!prev || prev.status !== node.status || prev.uptime !== node.uptime) {
      changed.add(node.id);
      if (!topRef.current.find((n) => n.id === node.id)) newTop.push(node);
    }
  });

  topRef.current = [
    ...newTop,
    ...topRef.current.filter((n) => !newTop.some((nn) => nn.id === n.id)),
  ];

  const rest = nodes.filter((n) => !topRef.current.some((t) => t.id === n.id));

  setOrderedNodes([...topRef.current, ...rest]);
  setHighlighted(changed);
  prevRef.current = new Map(nodes.map((n) => [n.id, n]));

  const timer = setTimeout(() => setHighlighted(new Set()), 5000);
  return () => clearTimeout(timer);
}, [nodes]);


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
            {orderedNodes.map((n) => {
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