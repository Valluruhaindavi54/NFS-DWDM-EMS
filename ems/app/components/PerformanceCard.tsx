"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard } from "./ClientWrappers";
import PerformanceChart from "./PerformanceChart";
import { usePathname } from "next/navigation";

export interface PerformanceData {
  nodeId: number;
  timestamp: string;
  latency: number;
  errorRate: number;
  bandwidthUtilization: number;
}

export default function PerformanceCard({ performance }: { performance: PerformanceData[] }) {
  const pathname = usePathname();
  const [data, setData] = useState<PerformanceData[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());

  const prevDataRef = useRef<Map<number, PerformanceData>>(new Map());
  const topDataRef = useRef<PerformanceData[]>([]);

  const [orderedPerformance, setOrderedPerformance] = useState<PerformanceData[]>([]);

  useEffect(() => {
    if (pathname !== "/nfsdwdmems") return;
    if (!performance.length) return;

    const changed = new Set<number>();
    const newOrChanged: PerformanceData[] = [];

    performance.forEach((p) => {
      const prev = prevDataRef.current.get(p.nodeId);
      if (
        !prev ||
        prev.latency !== p.latency ||
        prev.errorRate !== p.errorRate ||
        prev.bandwidthUtilization !== p.bandwidthUtilization
      ) {
        changed.add(p.nodeId);
        if (!topDataRef.current.find((t) => t.nodeId === p.nodeId)) newOrChanged.push(p);
      }
    });

    topDataRef.current = [
      ...newOrChanged,
      ...topDataRef.current.filter((t) => !newOrChanged.some((n) => n.nodeId === t.nodeId)),
    ];

    const remaining = performance.filter(
      (p) => !topDataRef.current.find((t) => t.nodeId === p.nodeId)
    );

    const finalList = [...topDataRef.current, ...remaining];
    setData(finalList);
    setOrderedPerformance(finalList);
    setHighlightedIds(changed);
    prevDataRef.current = new Map(performance.map((p) => [p.nodeId, p]));

    const timer = setTimeout(() => setHighlightedIds(new Set()), 5000);
    return () => clearTimeout(timer);
  }, [performance]);

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
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 420, backgroundColor: "#ffffff",borderTop: "4px solid #b4cf55",
    borderRadius: 8, }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 12, color: "#111111" }}>
        Live Performance Metrics
      </h2>

      <PerformanceChart data={data} />

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 300, marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#ffffff" }}>
          <thead>
            <tr>
              {["Node", "Latency (ms)", "Error Rate (%)", "Bandwidth Utilization (%)", "Timestamp"].map(
                (h) => (
                  <th key={h} style={headerStyle}>
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {orderedPerformance.map((row) => {
              const isChanged = highlightedIds.has(row.nodeId);
              return (
                <tr
                  key={`${row.nodeId}-${row.timestamp}`}
                  style={{
                    backgroundColor: isChanged ? "rgba(59, 130, 246, 0.1)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={cellStyle}>{row.nodeId}</td>
                  <td style={cellStyle}>{row.latency}</td>
                  <td style={cellStyle}>{row.errorRate}</td>
                  <td style={cellStyle}>{row.bandwidthUtilization}</td>
                  <td style={{ ...cellStyle, color: "#6b7280" }}>
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
