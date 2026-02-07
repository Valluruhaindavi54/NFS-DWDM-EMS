"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard } from "./ClientWrappers";

type InventoryNode = {
  nodeId: number;
  rack: string;
  subrack: string;
  slot: number;
  port: number;
  firmware: string;
};

async function getInventory(): Promise<InventoryNode[]> {
  try {
    const res = await fetch(`/api/proxy?endpoint=inventory`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch (err) {
    console.error("Inventory fetch error:", err);
    return [];
  }
}

export default function InventoryCard() {
  const [items, setItems] = useState<InventoryNode[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const prevRef = useRef<Map<string, InventoryNode>>(new Map());

  // Generate unique key per row
  const rowKey = (item: InventoryNode) =>
    `${item.nodeId}-${item.rack}-${item.subrack}-${item.slot}-${item.port}`;

  useEffect(() => {
    const fetchInventory = async () => {
      const data = await getInventory();
      const changedKeys = new Set<string>();
      const nodeIdsChanged = new Set<number>();

      data.forEach((item) => {
        const key = rowKey(item);
        const prev = prevRef.current.get(key);
        if (
          !prev ||
          prev.rack !== item.rack ||
          prev.subrack !== item.subrack ||
          prev.slot !== item.slot ||
          prev.port !== item.port ||
          prev.firmware !== item.firmware
        ) {
          changedKeys.add(key);
          nodeIdsChanged.add(item.nodeId);
        }
      });

      // Move all rows of changed nodes to top
      const topRows: InventoryNode[] = [];
      const restRows: InventoryNode[] = [];

      data.forEach((item) => {
        if (nodeIdsChanged.has(item.nodeId)) topRows.push(item);
        else restRows.push(item);
      });

      setItems([...topRows, ...restRows]);
      setHighlighted(changedKeys);
      prevRef.current = new Map(data.map((n) => [rowKey(n), n]));

      // Clear highlights after 5s
      setTimeout(() => setHighlighted(new Set()), 5000);
    };

    fetchInventory();
    const id = setInterval(fetchInventory, 45000);
    return () => clearInterval(id);
  }, []);

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
        Inventory
      </h2>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 360 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Node ID", "Rack", "Subrack", "Slot", "Port", "Firmware"].map((h) => (
                <th key={h} style={headerStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((n) => {
              const key = rowKey(n);
              const isChanged = highlighted.has(key);
              return (
                <tr
                  key={key}
                  style={{
                    backgroundColor: isChanged
                      ? "rgba(59,130,246,0.2)"
                      : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={cellStyle}>{n.nodeId}</td>
                  <td style={cellStyle}>{n.rack}</td>
                  <td style={cellStyle}>{n.subrack}</td>
                  <td style={cellStyle}>{n.slot}</td>
                  <td style={cellStyle}>{n.port}</td>
                  <td style={{ ...cellStyle, color: "#38bdf8" }}>{n.firmware}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}