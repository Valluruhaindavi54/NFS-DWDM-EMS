"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlarmChip, GlassCard } from "./ClientWrappers";
export interface Config  {
  nodeId: number;
  backupTime: string;
  status: string;
  compliance: string;
};

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

export default function ConfigurationCard({ configs }: { configs: Config[] }) {

  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  const prevConfigsRef = useRef<Config[]>([]);
  const topConfigsRef = useRef<Config[]>([]); // persistent top configs

const [orderedConfigs, setOrderedConfigs] = useState<Config[]>([]);

useEffect(() => {
  if (!configs.length) return;

  const changedKeys = new Set<string>();
  const newOrChangedConfigs: Config[] = [];

  configs.forEach((c) => {
    const key = `${c.nodeId}-${c.backupTime}`;
    const old = prevConfigsRef.current.find(
      (p) => `${p.nodeId}-${p.backupTime}` === key
    );

    if (!old || old.status !== c.status || old.compliance !== c.compliance) {
      changedKeys.add(key);
      if (!topConfigsRef.current.find(
        (t) => t.nodeId === c.nodeId && t.backupTime === c.backupTime
      )) {
        newOrChangedConfigs.push(c);
      }
    }
  });

  topConfigsRef.current = [
    ...newOrChangedConfigs,
    ...topConfigsRef.current.filter(
      (c) => !newOrChangedConfigs.some(
        (nc) => nc.nodeId === c.nodeId && nc.backupTime === c.backupTime
      )
    ),
  ];

  const otherConfigs = configs.filter(
    (c) => !topConfigsRef.current.find(
      (t) => t.nodeId === c.nodeId && t.backupTime === c.backupTime
    )
  );

  const sortedConfigs = [...topConfigsRef.current, ...otherConfigs];

  setOrderedConfigs(sortedConfigs);
  setHighlighted(changedKeys);
  prevConfigsRef.current = configs;

  const timer = setTimeout(() => setHighlighted(new Set()), 3000);
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

    const countCompliance = orderedConfigs.reduce((config, c) => {
        config[c.compliance] = (config[c.compliance] || 0) + 1;
        return config;
    }, {} as Record<string, number>);
     
    const countStatus = orderedConfigs.reduce((config, s) => {
        config[s.status] = (config[s.status] || 0) + 1;
        return config;

    }, {} as Record<string, number>);

    const complianceColor = (compliance: string) => {
       
        if (compliance.toUpperCase() === "COMPLIANT" ) {
            return "#22c55e";
            
        }
        else {
            return "#ff0000";
        }
    }
    const statusColor = (status: string) => {
        if (status.toUpperCase() === "SUCCESS") {
            return "#22c55e";
        }
        else {
            return "#ff0000";
        }
    }


  return (
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 600 }}>
      <h3 style={{ color: "#ffffff", marginBottom: 12 }}>Backup Configurations</h3>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {Object.entries(countCompliance).map(([compliance, countCompliance]) => (
                    <AlarmChip
                      key={compliance}
                      label={compliance}
                      count={countCompliance}
                      color={complianceColor(compliance)}
                    />
                  ))}
              {Object.entries(countStatus).map(([status, countStatus]) => (
                  <AlarmChip
                      key={status}
                      label={status}
                      count={countStatus}
                  color={statusColor(status)}/>
              )) }
              
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
              const key = `${c.nodeId}-${c.backupTime}`;
              const isUpdated = highlighted.has(key);
              return (
                <tr
                  key={key}
                  style={{
                    backgroundColor: isUpdated ? "rgba(59, 130, 246, 0.2)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={{ ...cellStyle, fontWeight: "500" }}>
                    {c.nodeId} {isUpdated && " ●"}
                  </td>
                  <td style={{ ...cellStyle }}>{new Date(c.backupTime).toLocaleString()}</td>
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