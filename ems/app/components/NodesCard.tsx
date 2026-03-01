"use client";

import React, { useState, useEffect, useRef } from "react";
import { GlassCard } from "./ClientWrappers";
import { usePathname } from "next/navigation";
import Image from "next/image";

type Node = {
  id: string;
  name: string;
  ip: string;
  status: "UP" | "DOWN" | "MAINTENANCE" | string;
  type: string;
  region: string;
  uptime: string;
};

// API fetch helper
async function getData(endpoint: string, controller?: AbortController) {
  try {
    const url = `/api/proxy?endpoint=${endpoint}&_=${Date.now()}`;
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller?.signal,
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.data || [];
  } catch (err: any) {
    if (err.name !== "AbortError") console.error("Node fetch failed:", err);
    return [];
  }
}

export default function NodesCard() {
  const pathname = usePathname();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [orderedNodes, setOrderedNodes] = useState<Node[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const prevRef = useRef<Map<string, Node>>(new Map());
  const topRef = useRef<Node[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchNodes = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const data = await getData("nodes", controller);
    if (!data.length) return;

    setNodes(data);
  };

  useEffect(() => {
    if (pathname !== "/nfsdwdmems") return;
    fetchNodes();
    const interval = setInterval(fetchNodes, 45000);

    return () => {
      controllerRef.current?.abort();
      clearInterval(interval);
    };
  }, []);

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

    const timer = setTimeout(() => setHighlighted(new Set()), 3000);
    return () => clearTimeout(timer);
  }, [nodes]);

  const statusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "UP": return "#10b981"; // green
      case "DOWN": return "#ef4444"; // red
      case "MAINTENANCE": return "#f97316"; // orange
      default: return "#facc15"; // yellow
    }
  };

  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    background: "#f3f4f6", // light gray
    zIndex: 2,
    fontSize: "10px",
    textTransform: "uppercase",
    color: "#374151", // dark gray
    padding: "10px 8px",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
  };

  const cellStyle: React.CSSProperties = {
    padding: "10px 8px",
    fontSize: "11px",
    borderBottom: "1px solid #e5e7eb",
    color: "#111111",
  };

  return (
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 420, backgroundColor: "#ffffff",   borderTop: "4px solid #22c55e",
    borderRadius: 8,   }}>
  {/* <div
  style={{
    display: "flex",
    alignItems: "center",          // vertically center icon and text
    gap: 12,                        // space between icon and text
    marginBottom: 16,
    height: 50,
   
    padding: "0 16px",
    borderRadius: 8,
   
  }}
> */}
  {/* Left Icon
  <Image
    src="/system.png"
    alt="Nodes"
    width={42}
    height={30}
    className="object-contain"
  /> */}

  <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px", color: "#111111" }}>
        Nodes
      </h2>






      <div style={{ flex: 1, overflowY: "auto", maxHeight: 360 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#ffffff" }}>
          <thead>
            <tr>
              {["Name", "IP", "Status", "Type", "Region", "Uptime"].map((h) => (
                <th key={h} style={headerStyle}>{h}</th>
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
                    backgroundColor: isChanged ? "rgba(59,130,246,0.1)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={cellStyle}>{n.name}</td>
                  <td style={{ ...cellStyle, color: "#6b7280" }}>{n.ip}</td> {/* gray IP */}
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
