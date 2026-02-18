"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard, AlarmChip } from "./ClientWrappers";
import { usePathname } from "next/navigation";

export interface Alarm {
  id: string;
  nodeId: string;
  severity: string;
  type: string;
  description: string;
  timestamp: string;
}

// API helper with AbortController support
async function getData(endpoint: string, controller: AbortController) {
  const url = `/api/proxy?endpoint=${endpoint}&_=${Date.now()}`;
  const res = await fetch(url, {
    signal: controller.signal,
    cache: "no-store",
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
}

export default function AlarmCard() {
  const pathname=usePathname();
  const [orderedAlarms, setOrderedAlarms] = useState<Alarm[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const prevRef = useRef<Map<string, Alarm>>(new Map());
  const topRef = useRef<Alarm[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
     if (pathname !== "/nfsdwdmems") return;
    let mounted = true;

    const fetchAlarms = async () => {
      controllerRef.current?.abort(); // abort previous fetch if ongoing
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const newData = await getData("alarms", controller);
        if (!mounted) return;

        const changed = new Set<string>();
        const newTop: Alarm[] = [];

        newData.forEach((a) => {
          const prev = prevRef.current.get(a.id);
          if (!prev || prev.severity !== a.severity) {
            changed.add(a.id);
            if (!topRef.current.find((t) => t.id === a.id)) newTop.push(a);
          }
        });

        topRef.current = [
          ...newTop,
          ...topRef.current.filter((t) => !newTop.some((n) => n.id === t.id)),
        ];

        const rest = newData.filter(
          (a) => !topRef.current.some((t) => t.id === a.id)
        );

        const finalList = [...topRef.current, ...rest];

        setOrderedAlarms(finalList);
        setHighlighted(changed);
        prevRef.current = new Map(newData.map((a) => [a.id, a]));

        // clear highlight after 3 sec
        setTimeout(() => setHighlighted(new Set()), 3000);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("Alarm fetch error:", err);
      }
    };

    fetchAlarms();
    const interval = setInterval(fetchAlarms, 45000);

    return () => {
      mounted = false;
      controllerRef.current?.abort();
      clearInterval(interval);
    };
  }, []);

  const severityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL": return "#ff0000";
      case "MAJOR": return "#ff7f00";
      case "MINOR": return "#3b82f6";
      case "CLEARED": return "#22c55e";
      case "WARNING": return "#eab308";
      default: return "#94a3b8";
    }
  };

  const alarmCounts = orderedAlarms.reduce(
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 16 }}>
        <AlarmChip label="Critical" count={alarmCounts.critical} color="#ef4444" />
        <AlarmChip label="Major" count={alarmCounts.major} color="#f97316" />
        <AlarmChip label="Minor" count={alarmCounts.minor} color="#38bdf8" />
        <AlarmChip label="Cleared" count={alarmCounts.cleared} color="#22c55e" />
        <AlarmChip label="Warning" count={alarmCounts.warning} color="#eab308" />
      </div>

      <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
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
            {orderedAlarms.map((a) => {
              const isChanged = highlighted.has(a.id);
              const sev = a.severity?.toUpperCase();
              return (
                <tr
                  key={a.id}
                  style={{
                    background: isChanged ? "rgba(59,130,246,0.18)" : "transparent",
                    transition: "background 1s ease",
                  }}
                >
                  <td style={td}>{a.nodeId}</td>
                  <td style={{ ...td, fontWeight: 700, color: severityColor(sev) }}>
                    {a.severity}
                    {isChanged && " ●"}
                  </td>
                  <td style={td}>{a.type}</td>
                  <td style={{ ...td, maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {a.description}
                  </td>
                  <td style={{ ...td, color: "#64748b" }}>{a.timestamp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
