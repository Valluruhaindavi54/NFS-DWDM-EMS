"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "./components/ClientWrappers";
import NodesCard from "./components/NodesCard";
import AlarmCard from "./components/AlarmCard";
import PerformanceCard from "./components/PerformanceCard";
import InventoryCard from "./components/InventoryCard";
import UserCard from "./components/UserCard";



// ---------- API helper ----------
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

export default function Page() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [alarms, setAlarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------- Fetch every 2s ----------
  useEffect(() => {
    const fetchAll = async () => {
      const [n, u, i, a] = await Promise.all([
        getData("nodes"),
        getData("users"),
        getData("inventory"),
        getData("alarms"),
      ]);

      setNodes(n);
      setUsers(u);
      setInventory(i);
      setAlarms(a);
      setLoading(false);
    };

    fetchAll();
    const interval = setInterval(fetchAll, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null; // header stays visible, cards load silently

  // ---------- Node stats ----------
  const nodeStats = nodes.reduce(
    (acc, node) => {
      const status = node.status?.toUpperCase();
      if (status === "UP") acc.up++;
      else if (status === "DOWN") acc.down++;
      return acc;
    },
    { up: 0, down: 0 }
  );

  // ---------- Active users (latest action per user) ----------
  const latestUserAction: Record<string, { action: string; timestamp: string }> = {};

  users.forEach((u: any) => {
    if (!latestUserAction[u.username] || new Date(u.timestamp) > new Date(latestUserAction[u.username].timestamp)) {
      latestUserAction[u.username] = { action: u.action, timestamp: u.timestamp };
    }
  });

  const activeUsers = Object.values(latestUserAction).filter(u => u.action === "login").length;

  // ---------- Inventory ----------
  const totalInventory = inventory.length;

  // ---------- Total alarms ----------
  const totalAlarms = alarms.length;

  return (
     <div style={{ padding: "20px", background: "#0f172a", minHeight: "100vh" }}>
      {/* Top summary cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <StatCard label="Nodes Up" count={nodeStats.up} color="#22c55e" />
        <StatCard label="Nodes Down" count={nodeStats.down} color="#ef4444" />
        <StatCard label="Total Alarms" count={totalAlarms} color="#f97316" />
        <StatCard label="Active Users" count={activeUsers} color="#38bdf8" />
        <StatCard label="Total Inventory" count={totalInventory} color="#a855f7" />
      </div>
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  }}
>
  <NodesCard />
  <AlarmCard />
      </div>
      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
    marginTop:"10px",
  }}
>
  <PerformanceCard/>
  <InventoryCard />
</div>
      <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
    marginTop:"10px",
  }}
>
  <UserCard/>
 
</div>

    </div>
  );
}