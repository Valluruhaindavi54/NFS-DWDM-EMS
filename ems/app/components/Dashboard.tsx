"use client";

import React, { useEffect, useState ,useMemo} from "react";
import { StatCard } from "./ClientWrappers";
import NodesCard from "./NodesCard";
import AlarmCard, { Alarm } from "./AlarmCard";
import PerformanceCard, { PerformanceData } from "./PerformanceCard";
import InventoryCard, { InventoryNode } from "./InventoryCard";
import UserCard, { UserAction } from "./UserCard";
import ConfigurationCard, { Config } from "./ConfigCard";



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

export default function Dashboard() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [inventory, setInventory] = useState<InventoryNode[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [users, setUsers] = useState<UserAction[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSummary = async () => {
    const [n, u, a] = await Promise.all([
      getData("nodes"),
      getData("users"),
      getData("alarms")
    ]);
    setNodes(n);
    setUsers(u);
    setAlarms(a);
  };

  const fetchHeavy = async () => {
    const [i, c, p] = await Promise.all([
      getData("inventory"),
      getData("configs"),
      getData("performance")
    ]);
    setInventory(i);
    setConfigs(c);
    setPerformance(p);
  };
  const fetchAll = async () => {
    fetchSummary();
  setTimeout(fetchHeavy, 1000); 
  }
  fetchAll();
  const interval = setInterval(fetchAll, 45000);
  return () => clearInterval(interval);
  
}, []);

  // header stays visible, cards load silently

  // ---------- Node stats ----------
 const nodeStats = useMemo(() => {
  return nodes.reduce((acc, node) => {
    const status = node.status?.toUpperCase();
    if (status === "UP") acc.up++;
    else if (status === "DOWN") acc.down++;
    return acc;
  }, { up: 0, down: 0 });
}, [nodes]);

  // ---------- Active users (latest action per user) ----------
  
const activeUsers = useMemo(() => {
  const latest: Record<string, { action: string; timestamp: string }> = {};
  users.forEach(u => {
    if (!latest[u.username] || new Date(u.timestamp) > new Date(latest[u.username].timestamp)) {
      latest[u.username] = { action: u.action, timestamp: u.timestamp };
    }
  });
  return Object.values(latest).filter(u => u.action === "login").length;
}, [users]);
  // ---------- Inventory ----------
  const totalInventory = inventory.length;

  // ---------- Total alarms ----------
  const totalAlarms = alarms.length;
  if (loading) {
  

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
          <NodesCard nodes={nodes} />

          <AlarmCard alarms={alarms} />

        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginTop: "10px",
          }}
        >
          <PerformanceCard performance={performance} />

          <InventoryCard inventory={inventory} />

        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginTop: "10px",
          }}
        >
          <UserCard actions={users} />

          <ConfigurationCard configs={configs} />

 
        </div>

      </div>
    );
  }
}