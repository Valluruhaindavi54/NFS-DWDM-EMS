"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type UserChartData = {
  date: string;
  login: number;
  failedLogin: number;
  configChange: number;
  logout: number;
};

interface ChartProps {
  data: UserChartData[];
}

export default function UserChart({ data }: ChartProps) {
  if (!data.length) {
    return <div style={{ height: 300 }} />;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="login" stackId="a" fill="#10b981" />
          <Bar dataKey="failedLogin" stackId="a" fill="#ef4444" />
          <Bar dataKey="configChange" stackId="a" fill="#f97316" />
          <Bar dataKey="logout" stackId="a" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
