"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard } from "./ClientWrappers";
import PerformanceChart from "./PerformanceChart";

export interface PerformanceData {
  nodeId: number;
  timestamp: string;
  latency: number;
  errorRate: number;
  bandwidthUtilization: number;
}


// API fetch helper
async function getData(endpoint: string) {
  const url = `/api/proxy?endpoint=${endpoint}&_=${Date.now()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
}
export default function PerformanceCard({ performance }: { performance: PerformanceData[] }) {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());

  const prevDataRef = useRef<Map<number, PerformanceData>>(new Map());
  const topDataRef = useRef<PerformanceData[]>([]);
const [orderedPerformance, setOrdedPerformance] = useState<PerformanceData[]>([]);
  useEffect(() => {
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

    setData([...topDataRef.current, ...remaining]);
    setHighlightedIds(changed);
    prevDataRef.current = new Map(performance.map((p) => [p.nodeId, p]));

    const timer = setTimeout(() => setHighlightedIds(new Set()), 5000);
    return () => clearTimeout(timer);
  }, [performance]);

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
        Live Performance Metrics
      </h2>

      <PerformanceChart data={data} />

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 300, marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerStyle}>Node</th>
              <th style={headerStyle}>Latency (ms)</th>
              <th style={headerStyle}>Error Rate (%)</th>
              <th style={headerStyle}>Bandwidth Utilization (%)</th>
              <th style={headerStyle}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isChanged = highlightedIds.has(row.nodeId);
              return (
                <tr
                  key={`${row.nodeId}-${row.timestamp}`}
                  style={{
                    backgroundColor: isChanged ? "rgba(59, 130, 246, 0.2)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={cellStyle}>{row.nodeId}</td>
                  <td style={cellStyle}>{row.latency}</td>
                  <td style={cellStyle}>{row.errorRate}</td>
                  <td style={cellStyle}>{row.bandwidthUtilization}</td>
                  <td style={{ ...cellStyle, color: "#94a3b8" }}>
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
