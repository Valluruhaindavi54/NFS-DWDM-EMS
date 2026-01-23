"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState } from "react";
import { GlassCard } from "./ClientWrappers";
import type { UserChartData } from "./UserChart";

export type UserAction = {
  id: string;
  username: string;
  action: string;
  timestamp: string;
  ip: string;
};

const UserChart = dynamic(() => import("./UserChart"), { ssr: false });

export default function UserCard() {
  const [actions, setActions] = useState<UserAction[]>([]);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const res = await fetch("/api/proxy?endpoint=users", { cache: "no-store" });
        const json = await res.json();
        setActions(Array.isArray(json) ? json : json.data ?? []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchActions();
  }, []);

  // -----------------------------
  // QUICK CARDS LOGIC
  // -----------------------------
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const activeUsers = useMemo(
    () =>
      new Set(
        actions
          .filter(a => a.action === "login" && new Date(a.timestamp) > last24h)
          .map(a => a.username)
      ).size,
    [actions]
  );

  const failedLogins = useMemo(() => actions.filter(a => a.action === "failedLogin").length, [actions]);
  const configChanges = useMemo(() => actions.filter(a => a.action === "configChange").length, [actions]);
  const logouts = useMemo(() => actions.filter(a => a.action === "logout").length, [actions]);

  // -----------------------------
  // CHART DATA LOGIC
  // -----------------------------
  const chartData: UserChartData[] = useMemo(() => {
    const grouped: Record<string, UserChartData> = {};

    actions.forEach(a => {
      const date = new Date(a.timestamp).toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = { date, login: 0, failedLogin: 0, configChange: 0, logout: 0 };
      }
      if (a.action in grouped[date]) {
        grouped[date][a.action as keyof UserChartData]++;
      }
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [actions]);

  // -----------------------------
  // STYLES
  // -----------------------------
  const cardStyle: React.CSSProperties = {
    flex: 1,
    background: "rgba(30,41,59,0.4)",
    borderRadius: 12,
    padding: 16,
    margin: 8,
    color: "#fff",
    textAlign: "center",
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

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 600, padding: 16 }}>
      {/* Quick Cards */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={cardStyle}>
          <h3>Active Users (24h)</h3>
          <p>{activeUsers}</p>
        </div>
        <div style={cardStyle}>
          <h3>Failed Logins</h3>
          <p>{failedLogins}</p>
        </div>
        <div style={cardStyle}>
          <h3>Config Changes</h3>
          <p>{configChanges}</p>
        </div>
        <div style={cardStyle}>
          <h3>Logouts</h3>
          <p>{logouts}</p>
        </div>
      </div>

      <div style={{ width: "100%", height: 300, minHeight: 300 }}>
  <UserChart data={chartData} />
</div>

      {/* Table */}
      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["User Id","Username", "Action", "Timestamp", "IP"].map(h => (
                <th key={h} style={headerStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actions.map(a => (
              <tr key={a.id}>
                <td style={cellStyle}>{a.id}</td>
                <td style={cellStyle}>{a.username}</td>
                <td style={cellStyle}>{a.action}</td>
                <td style={cellStyle}>{new Date(a.timestamp).toLocaleString()}</td>
                <td style={cellStyle}>{a.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
