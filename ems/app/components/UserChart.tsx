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

  const axisStyle = { stroke: "#6b7280", fontSize: 12 }; // dark gray axes for light background
  const tooltipStyle = { backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 4, padding: 8 };

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="date" stroke={axisStyle.stroke} style={{ fontSize: axisStyle.fontSize }} />
          <YAxis stroke={axisStyle.stroke} style={{ fontSize: axisStyle.fontSize }} />
          <Tooltip 
            contentStyle={tooltipStyle} 
            itemStyle={{ color: "#111111", fontSize: 12 }}
            cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
          />
          <Legend wrapperStyle={{ color: "#374151", fontSize: 12 }} />
          <Bar dataKey="login" stackId="a" fill="#10b981" />
          <Bar dataKey="failedLogin" stackId="a" fill="#ef4444" />
          <Bar dataKey="configChange" stackId="a" fill="#f97316" />
          <Bar dataKey="logout" stackId="a" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
