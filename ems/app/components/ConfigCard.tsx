"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard, AlarmChip } from "./ClientWrappers";

export interface Config {
  nodeId: number;
  backupTime: string;
  status: string;
  compliance: string;
}

// Helper: unique key per config
const configKey = (c: Config) => `${c.nodeId}-${c.backupTime}`;

// API fetch helper (optional if fetching externally)
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

export default function ConfigurationCard({ configs }: { configs: Config[] }) {
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const prevConfigsRef = useRef<Map<string, Config>>(new Map());
  const topConfigsRef = useRef<Config[]>([]);
  const [orderedConfigs, setOrderedConfigs] = useState<Config[]>([]);

  useEffect(() => {
    if (!configs.length) return;

    const changedKeys = new Set<string>();
    const newTop: Config[] = [];

    configs.forEach((c) => {
      const key = configKey(c);
      const prev = prevConfigsRef.current.get(key);

      // Detect new or updated
      if (!prev || prev.status !== c.status || prev.compliance !== c.compliance) {
        changedKeys.add(key);
        if (!topConfigsRef.current.find((t) => configKey(t) === key)) {
          newTop.push(c);
        }
      }
    });

    // Update top configs
    topConfigsRef.current = [
      ...newTop,
      ...topConfigsRef.current.filter(
        (t) => !newTop.some((n) => configKey(n) === configKey(t))
      ),
    ];

    // Remaining configs
    const rest = configs.filter(
      (c) => !topConfigsRef.current.find((t) => configKey(t) === configKey(c))
    );

    const finalList = [...topConfigsRef.current, ...rest];

    // Update state
    setOrderedConfigs(finalList);
    setHighlighted(changedKeys);
    prevConfigsRef.current = new Map(configs.map((c) => [configKey(c), c]));

    console.log("Updated configs:", Array.from(changedKeys)); // ✅ print updated keys

    const timer = setTimeout(() => setHighlighted(new Set()), 3000); // clear highlight
    return () => clearTimeout(timer);
  }, [configs]);

  // Color helpers
  const getStatusColor = (status: string) =>
    status === "SUCCESS" ? "#22c55e" : status === "FAILED" ? "#ef4444" : "#facc15";

  const getComplianceColor = (compliance: string) =>
    compliance === "Compliant" ? "#22c55e" : "#ef4444";

  // Table styles
  const tableHeaderStyle: React.CSSProperties = {
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

  // Count summaries
  const countCompliance = orderedConfigs.reduce((acc, c) => {
    acc[c.compliance] = (acc[c.compliance] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countStatus = orderedConfigs.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 600 }}>
      <h3 style={{ color: "#ffffff", marginBottom: 12 }}>Backup Configurations</h3>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {Object.entries(countCompliance).map(([compliance, count]) => (
          <AlarmChip key={compliance} label={compliance} count={count} color={getComplianceColor(compliance)} />
        ))}
        {Object.entries(countStatus).map(([status, count]) => (
          <AlarmChip key={status} label={status} count={count} color={getStatusColor(status)} />
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 600 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Node ID</th>
              <th style={tableHeaderStyle}>Backup Time</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Compliance</th>
            </tr>
          </thead>
          <tbody>
            {orderedConfigs.map((c) => {
              const key = configKey(c);
              const isUpdated = highlighted.has(key);
              return (
                <tr
                  key={key}
                  style={{
                    backgroundColor: isUpdated ? "rgba(59, 130, 246, 0.2)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={{ ...cellStyle, fontWeight: 500 }}>{c.nodeId} {isUpdated && "●"}</td>
                  <td style={cellStyle}>{new Date(c.backupTime).toLocaleString()}</td>
                  <td style={{ ...cellStyle, fontWeight: "bold", color: getStatusColor(c.status) }}>{c.status}</td>
                  <td style={{ ...cellStyle, fontWeight: "bold", color: getComplianceColor(c.compliance) }}>{c.compliance}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
