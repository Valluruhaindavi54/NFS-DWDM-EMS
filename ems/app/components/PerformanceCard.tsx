"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard } from "./ClientWrappers";
import PerformanceChart from "./PerformanceChart";

interface PerformanceData {
  nodeId: number;
  timestamp: string;
  latency: number;
  errorRate: number;
 bandwidthUtilization: number;
}

export default function PerformanceCard() {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());
  const prevDataRef = useRef<PerformanceData[]>([]);
  const topDataRef = useRef<PerformanceData[]>([]); // persist new/changed on top

const fetchPerformance = async () => {
  try {
    const res = await fetch("/api/proxy?endpoint=performance", { cache: "no-store" });
    if (!res.ok) throw new Error("API failed");

    const json = await res.json(); // <- call only once
    const incoming: PerformanceData[] = Array.isArray(json) ? json : json.data || [];

    const currentChanged = new Set<number>();
    const newOrChanged: PerformanceData[] = [];

    incoming.forEach((item) => {
      const prev = prevDataRef.current.find((p) => p.nodeId === item.nodeId);
      if (
        !prev ||
        prev.latency !== item.latency ||
        prev.errorRate !== item.errorRate ||
        prev.bandwidthUtilization !== item.bandwidthUtilization
      ) {
        currentChanged.add(item.nodeId);

        if (!topDataRef.current.find((t) => t.nodeId === item.nodeId)) {
          newOrChanged.push(item);
        }
      }
    });
     if (newOrChanged.length > 0) {
        console.log("New/Changed Performance:", newOrChanged);
      }

    topDataRef.current = [
      ...newOrChanged,
      ...topDataRef.current.filter(
        (t) => !newOrChanged.some((n) => n.nodeId === t.nodeId)
      ),
    ];

    const remaining = incoming.filter(
      (i) => !topDataRef.current.find((t) => t.nodeId === i.nodeId)
    );

    const sorted = [...topDataRef.current, ...remaining];


    setData(sorted);
    setHighlightedIds(currentChanged);
    prevDataRef.current = incoming;
  } catch (err) {
    console.error("Performance fetch error", err);
  }
};


  useEffect(() => {
    fetchPerformance();
    const interval = setInterval(fetchPerformance, 45000);
    return () => clearInterval(interval);
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
        Live Performance Metrics
      </h2>

      <PerformanceChart data={data} />

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 300, marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerStyle}>Node</th>
              <th style={headerStyle}>Latency</th>
              <th style={headerStyle}>Error Rate</th>
              <th style={headerStyle}>bandwidth Utilization</th>
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
                    backgroundColor: isChanged ? "transparent": "rgba(59, 130, 246, 0.2)" ,
                      transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={cellStyle}>{row.nodeId}</td>
                  <td style={cellStyle}>{row.latency} ms</td>
                  <td style={cellStyle}>{row.errorRate} %</td>
                  <td style={cellStyle}>{row.bandwidthUtilization} %</td>
                  <td style={{ ...cellStyle, color: "#94a3b8" }}>{row.timestamp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
