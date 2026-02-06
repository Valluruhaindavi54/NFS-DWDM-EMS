"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard, AlarmChip } from "./ClientWrappers";

export interface Alarm {
  id: string;
  nodeId: string;
  severity: string;
  type: string;
  description: string;
  timestamp: string;
};



export default function AlarmCard({ alarms }: { alarms: Alarm[] }) {

const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
const prevRef = useRef<Map<string, Alarm>>(new Map());
const topRef = useRef<Alarm[]>([]);
const [orderedAlarms, setOrderedAlarms] = useState<Alarm[]>([]);

useEffect(() => {
  if (!alarms.length) return;

  const changed = new Set<string>();
  const newTop: Alarm[] = [];

  alarms.forEach((a) => {
    const prev = prevRef.current.get(a.id);
    if (!prev || prev.severity !== a.severity) {
      changed.add(a.id);
      if (!topRef.current.find((n) => n.id === a.id)) newTop.push(a);
    }
  });

  topRef.current = [
    ...newTop,
    ...topRef.current.filter((n) => !newTop.some((nn) => nn.id === n.id)),
  ];

  const rest = alarms.filter((n) => !topRef.current.some((t) => t.id === n.id));

  setOrderedAlarms([...topRef.current, ...rest]);
  setHighlighted(changed);

  prevRef.current = new Map(alarms.map((a) => [a.id, a]));

  const timer = setTimeout(() => setHighlighted(new Set()), 5000);
  return () => clearTimeout(timer);
}, [alarms]);


  const severityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "#ff0000";
      case "MAJOR":
        return "#ff7f00";
      case "MINOR":
        return "#3b82f6";
      case "CLEARED":
        return "#22c55e";
      case "WARNING":
        return "#eab308";
      default:
        return "#94a3b8";
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

 const counts = orderedAlarms.reduce((acc, a) => {
    acc[a.severity] = (acc[a.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 12, color: "#ffffff" }}>
        System Alarms
      </h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {Object.entries(counts).map(([severity, count]) => (
          <AlarmChip
            key={severity}
            label={severity}
            count={count}
            color={severityColor(severity)}
          />
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 360 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Node", "Severity", "Type", "Description", "Timestamp"].map((h) => (
                <th key={h} style={headerStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {alarms.map((a) => {
              const isChanged = highlighted.has(a.id);
              return (
                <tr
                  key={a.id}
                  style={{
                    backgroundColor: isChanged ? "rgba(59,130,246,0.2)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={cellStyle}>{a.nodeId}</td>
                  <td style={{ ...cellStyle, color: severityColor(a.severity), fontWeight: 500 }}>
                    {a.severity}
                  </td>
                  <td style={cellStyle}>{a.type}</td>
                  <td style={cellStyle}>{a.description}</td>
                  <td style={{ ...cellStyle, color: "#94a3b8" }}>{a.timestamp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
