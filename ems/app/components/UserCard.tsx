"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GlassCard, AlarmChip } from "./ClientWrappers";
import type { UserChartData } from "./UserChart";

export type UserAction = {
  id: string;
  username: string;
  action: string;
  timestamp: string;
  ip: string;
};

const UserChart = dynamic(() => import("./UserChart"), { ssr: false });

const actionColor = (action: string) => {
  switch (action) {
    case "login":
      return "#22c55e";
    case "failedLogin":
      return "#ff0000";
    case "configChange":
      return "#ff7f00";
    case "logout":
      return "#3b82f6";
    default:
      return "#94a3b8";
  }
};

export default function UserCard() {
  const [actions, setActions] = useState<UserAction[]>([]);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const prevRef = useRef<Map<string, UserAction>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const res = await fetch("/api/proxy?endpoint=users", { cache: "no-store" });
        const json = await res.json();
        const data: UserAction[] = Array.isArray(json) ? json : json.data ?? [];

        const changed = new Set<string>();
        const prevMap = prevRef.current;

        data.forEach(a => {
          const prev = prevMap.get(a.id);
          if (!prev || prev.action !== a.action || prev.timestamp !== a.timestamp || prev.ip !== a.ip) {
            changed.add(a.id);
          }
        });

        const ordered = [
          ...data.filter(a => changed.has(a.id)),
          ...data.filter(a => !changed.has(a.id)),
        ];
        console.log("Changed users:", Array.from(changed));
        setActions(ordered);
        setHighlighted(changed);
        prevRef.current = new Map(data.map(a => [a.id, a]));

        setTimeout(() => setHighlighted(new Set()), 5000);
      } catch (err) {
        console.error(err);
      }
    };

    fetchActions();
    timerRef.current = setInterval(fetchActions, 45000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

  const failedLogins = useMemo(
    () => actions.filter(a => a.action === "failedLogin").length,
    [actions]
  );

  const configChanges = useMemo(
    () => actions.filter(a => a.action === "configChange").length,
    [actions]
  );

  const logouts = useMemo(
    () => actions.filter(a => a.action === "logout").length,
    [actions]
  );

  const chartData: UserChartData[] = useMemo(() => {
    const grouped: Record<string, UserChartData> = {};

    actions.forEach(a => {
      const date = new Date(a.timestamp).toISOString().split("T")[0];
      if (!grouped[date]) {
        grouped[date] = { date, login: 0, failedLogin: 0, configChange: 0, logout: 0 };
      }
      grouped[date][a.action as keyof UserChartData]++;
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [actions]);

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
    <GlassCard style={{ display: "flex", flexDirection: "column", minHeight: 600, padding: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {[
          { label: "Active Users", action: "login", count: activeUsers },
          { label: "Failed Logins", action: "failedLogin", count: failedLogins },
          { label: "Config Changes", action: "configChange", count: configChanges },
          { label: "Logouts", action: "logout", count: logouts },
        ].map(({ label, action, count }) => (
          <AlarmChip key={action} label={label} count={count} color={actionColor(action)} />
        ))}
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <UserChart data={chartData} />
      </div>

      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["User Id", "Username", "Action", "Timestamp", "IP"].map(h => (
                <th key={h} style={headerStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actions.map(a => {
              const isChanged = highlighted.has(a.id);
              return (
                <tr
                  key={a.id}
                  style={{
                    backgroundColor: isChanged ? "rgba(59,130,246,0.2)" : "transparent",
                    transition: "background-color 1s ease-in-out",
                  }}
                >
                  <td style={cellStyle}>{a.id}</td>
                  <td style={cellStyle}>{a.username}</td>
                  <td style={{ ...cellStyle, color: actionColor(a.action), fontWeight: 500 }}>
                    {a.action}
                  </td>
                  <td style={cellStyle}>{new Date(a.timestamp).toLocaleString()}</td>
                  <td style={cellStyle}>{a.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
