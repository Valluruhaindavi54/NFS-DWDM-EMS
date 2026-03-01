"use client";

import React, { useEffect, useRef, useState } from "react";
import { GlassCard, AlarmChip } from "./ClientWrappers";
import { usePathname } from "next/navigation";

export interface Config {
  nodeId: number;
  backupTime: string;
  status: string;
  compliance: string;
}

const configKey = (c: Config) => `${c.nodeId}-${c.backupTime}`;

async function getData(endpoint: string, controller?: AbortController) {
  const url = `/api/proxy?endpoint=${endpoint}&_=${Date.now()}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    signal: controller?.signal,
  });
  if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.data || [];
}

export default function ConfigurationCard() {
  const pathname = usePathname();
  const [configs, setConfigs] = useState<Config[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const prevConfigsRef = useRef<Map<string, Config>>(new Map());
  const topConfigsRef = useRef<Config[]>([]);
  const controllerRef = useRef<AbortController | null>(null);
  const [orderedConfigs, setOrderedConfigs] = useState<Config[]>([]);

  const fetchConfigs = async () => {
    if (pathname !== "/nfsdwdmems") return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const data: Config[] = await getData("configs", controller);
      if (!data.length) return;

      const changedKeys = new Set<string>();
      const newTop: Config[] = [];

      data.forEach((c) => {
        const key = configKey(c);
        const prev = prevConfigsRef.current.get(key);
        if (!prev || prev.status !== c.status || prev.compliance !== c.compliance) {
          changedKeys.add(key);
          if (!topConfigsRef.current.find((t) => configKey(t) === key)) newTop.push(c);
        }
      });

      topConfigsRef.current = [
        ...newTop,
        ...topConfigsRef.current.filter(
          (t) => !newTop.some((n) => configKey(n) === configKey(t))
        ),
      ];

      const rest = data.filter(
        (c) => !topConfigsRef.current.find((t) => configKey(t) === configKey(c))
      );

      const finalList = [...topConfigsRef.current, ...rest];
      setOrderedConfigs(finalList);
      setHighlighted(changedKeys);
      prevConfigsRef.current = new Map(data.map((c) => [configKey(c), c]));

      const timer = setTimeout(() => setHighlighted(new Set()), 3000);
      return () => clearTimeout(timer);
    } catch (err: any) {
      if (err.name !== "AbortError") console.error("Config fetch error:", err);
    }
  };

  useEffect(() => {
    fetchConfigs();
    const interval = setInterval(fetchConfigs, 45000);
    return () => {
      controllerRef.current?.abort();
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = (status: string) =>
    status === "SUCCESS" ? "#22c55e" : status === "FAILED" ? "#ef4444" : "#facc15";

  const getComplianceColor = (compliance: string) =>
    compliance === "Compliant" ? "#22c55e" : "#ef4444";

  const tableHeaderStyle: React.CSSProperties = {
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

  const countCompliance = orderedConfigs.reduce((acc, c) => {
    acc[c.compliance] = (acc[c.compliance] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countStatus = orderedConfigs.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 600, backgroundColor: "#ffffff", padding: 16 , borderTop: "4px solid #f0b03a",
    borderRadius: 8,}}>
      <h3 style={{ color: "#111111", marginBottom: 12 }}>Backup Configurations</h3>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {Object.entries(countCompliance).map(([compliance, count]) => (
          <AlarmChip
            key={compliance}
            label={compliance}
            count={count}
            color={getComplianceColor(compliance)}
          />
        ))}
        {Object.entries(countStatus).map(([status, count]) => (
          <AlarmChip
            key={status}
            label={status}
            count={count}
            color={getStatusColor(status)}
          />
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 600 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#ffffff" }}>
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
                    backgroundColor: isUpdated ? "rgba(59, 130, 246, 0.1)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={{ ...cellStyle, fontWeight: 500 }}>
                    {c.nodeId} {isUpdated && "●"}
                  </td>
                  <td style={cellStyle}>{new Date(c.backupTime).toLocaleString()}</td>
                  <td style={{ ...cellStyle, fontWeight: "bold", color: getStatusColor(c.status) }}>
                    {c.status}
                  </td>
                  <td style={{ ...cellStyle, fontWeight: "bold", color: getComplianceColor(c.compliance) }}>
                    {c.compliance}
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
