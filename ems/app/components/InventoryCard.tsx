"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard } from "./ClientWrappers";
import { usePathname } from "next/navigation";

type InventoryNode = {
  nodeId: number;
  rack: string;
  subrack: string;
  slot: number;
  port: number;
  firmware: string;
};

async function getInventory(controller?: AbortController): Promise<InventoryNode[]> {
  try {
    const res = await fetch(`/api/proxy?endpoint=inventory&_=${Date.now()}`, {
      cache: "no-store",
      signal: controller?.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data ?? [];
  } catch (err: any) {
    if (err.name !== "AbortError") console.error("Inventory fetch error:", err);
    return [];
  }
}

export default function InventoryCard() {
  const pathname = usePathname();
  const [items, setItems] = useState<InventoryNode[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const prevRef = useRef<Map<string, InventoryNode>>(new Map());
  const controllerRef = useRef<AbortController | null>(null);

  const rowKey = (item: InventoryNode) =>
    `${item.nodeId}-${item.rack}-${item.subrack}-${item.slot}-${item.port}`;

  const fetchInventoryData = async () => {
    if (pathname !== "/nfsdwdmems") return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const data = await getInventory(controller);
    if (!data.length) return;

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

    const topRows: InventoryNode[] = [];
    const restRows: InventoryNode[] = [];

    data.forEach((item) => {
      if (nodeIdsChanged.has(item.nodeId)) topRows.push(item);
      else restRows.push(item);
    });

    setItems([...topRows, ...restRows]);
    setHighlighted(changedKeys);
    prevRef.current = new Map(data.map((n) => [rowKey(n), n]));

    const timer = setTimeout(() => setHighlighted(new Set()), 5000);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    fetchInventoryData();
    const interval = setInterval(fetchInventoryData, 45000);

    return () => {
      controllerRef.current?.abort();
      clearInterval(interval);
    };
  }, []);

  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    background: "#f3f4f6", // light gray header
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
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 420, backgroundColor: "#ffffff",borderTop: "4px solid #38baad ",
    borderRadius: 8,  }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 12, color: "#111111" }}>
        Inventory
      </h2>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 360 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#ffffff" }}>
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
                    backgroundColor: isChanged ? "rgba(59,130,246,0.1)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={cellStyle}>{n.nodeId}</td>
                  <td style={cellStyle}>{n.rack}</td>
                  <td style={cellStyle}>{n.subrack}</td>
                  <td style={cellStyle}>{n.slot}</td>
                  <td style={cellStyle}>{n.port}</td>
                  <td style={{ ...cellStyle, color: "#3b82f6" }}>{n.firmware}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
