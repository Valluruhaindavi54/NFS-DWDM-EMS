"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard, AlarmChip } from "./ClientWrappers";

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

export default function AlarmCard() {
  const [alarms, setAlarms] = useState<any[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const prevAlarmsRef = useRef<any[]>([]);
  const topAlarmsRef = useRef<any[]>([]);

  useEffect(() => {
    const fetchAlarms = async () => {
      const fetched = await getData("alarms");

      const changed = new Set<string>();
      const newOrChanged: any[] = [];

      // Detect new or updated alarms
      fetched.forEach((alarm: any) => {
        const id = alarm.id ?? `${alarm.nodeId}-${alarm.timestamp}`;
        const prev = prevAlarmsRef.current.find((a) => a.id === id);

        if (!prev || JSON.stringify(prev) !== JSON.stringify(alarm)) {
          changed.add(id);

          if (!topAlarmsRef.current.find((a) => a.id === id)) {
            newOrChanged.push({ ...alarm, id });
          }
        }
      });

      if (newOrChanged.length > 0) {
        console.log("New/Changed Alarms:", newOrChanged);
      }

      // Keep old top alarms for removal detection
      const oldTopAlarms = [...topAlarmsRef.current];

      // Prepend new/changed alarms
      topAlarmsRef.current = [
        ...newOrChanged,
        ...topAlarmsRef.current.filter(
          (a) => !newOrChanged.some((na) => na.id === a.id)
        ),
      ];

      // Detect removed alarms
      const removedAlarms = oldTopAlarms.filter(
        (oldAlarm) => !topAlarmsRef.current.find((a) => a.id === oldAlarm.id)
      );
      if (removedAlarms.length > 0) {
        console.log("Removed Alarms:", removedAlarms);
      }

      // Merge remaining alarms not in top
      const remaining = fetched
        .map((a: any) => ({ ...a, id: a.id ?? `${a.nodeId}-${a.timestamp}` }))
        .filter((a: any) => !topAlarmsRef.current.find((t) => t.id === a.id));

      setAlarms([...topAlarmsRef.current, ...remaining]);
      setHighlighted(changed);
      prevAlarmsRef.current = fetched;
    };

    fetchAlarms();
    const interval = setInterval(fetchAlarms, 2000);
    return () => clearInterval(interval);
  }, []);

  // Count alarms by severity
  const alarmCounts = alarms.reduce(
    (acc, a) => {
      const sev = a.severity?.toUpperCase();
      if (sev === "CRITICAL") acc.critical++;
      else if (sev === "MAJOR") acc.major++;
      else if (sev === "MINOR") acc.minor++;
      else if (sev === "CLEARED") acc.cleared++;
      else if (sev === "WARNING") acc.warning++;
      return acc;
    },
    { critical: 0, major: 0, minor: 0, cleared: 0, warning: 0 }
  );

  const th: React.CSSProperties = {
    position: "sticky",
    top: 0,
    background: "#1e293b",
    zIndex: 2,
    fontSize: "10px",
    textTransform: "uppercase",
    color: "#64748b",
    padding: "10px 8px",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const td: React.CSSProperties = {
    padding: "10px 8px",
    fontSize: "11px",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    color: "#e2e8f0",
  };

  return (
    <GlassCard style={{ minHeight: "420px", display: "flex", flexDirection: "column" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px", color: "#ffffff" }}>
        System Alarms
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <AlarmChip label="Critical" count={alarmCounts.critical} color="#ef4444" />
        <AlarmChip label="Major" count={alarmCounts.major} color="#f97316" />
        <AlarmChip label="Minor" count={alarmCounts.minor} color="#38bdf8" />
        <AlarmChip label="Cleared" count={alarmCounts.cleared} color="#22c55e" />
        <AlarmChip label="Warning" count={alarmCounts.warning} color="#eab308" />
      </div>

      <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
        <div style={{
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "12px",
  marginBottom: "20px"
}}>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>NodeID</th>
              <th style={th}>Severity</th>
              <th style={th}>Type</th>
              <th style={th}>Description</th>
              <th style={th}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {alarms.map((a: any) => {
              const isNew = highlighted.has(a.id);
              const sev = a.severity?.toUpperCase();

              return (
                <tr
                  key={a.id}
                  style={{
                    background: isNew ? "rgba(59,130,246,0.18)" : "transparent",
                    transition: "background 1s ease",
                  }}
                >
                  <td style={td}>{a.nodeId}</td>
                  <td
                    style={{
                      ...td,
                      fontWeight: 700,
                      color:
                        sev === "CRITICAL"
                          ? "#ef4444"
                          : sev === "WARNING"
                          ? "#eab308"
                          : sev === "CLEARED"
                          ? "#22c55e"
                          : sev === "MAJOR"
                          ? "#f97316"
                          : "#38bdf8",
                    }}
                  >
                    {a.severity}
                    {isNew && " ●"}
                  </td>
                  <td style={td}>{a.type}</td>
                  <td
                    style={{
                      ...td,
                      maxWidth: 150,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {a.description}
                  </td>
                  <td style={{ ...td, color: "#64748b" }}>{a.timestamp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </GlassCard>
  );
}
