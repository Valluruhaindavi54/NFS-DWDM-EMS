"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SideBarWrapper from "../Utils/SideBarWrapper.jsx";
import { SERVERID } from "../Constaint.js";
import Dashboard from "../components/Dashboard.tsx";

export default function Simulator() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [SelectedIp, setSelectedIp] = useState(searchParams.get("ip") || null);
  const [Info, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [Rack, setRack] = useState({});
  const [subrack1, setSubrack1] = useState([]);
  const [subrack2, setSubrack2] = useState([]);
  const [bmuSubrack, setBmuSubrack] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);

  // 🔐 AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("emsToken");
    if (!token) {
      router.replace("/"); // go back to login
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  const fetchData = useCallback(async () => {
    if (!SelectedIp) return;
    try {
      setIsLoading(true);
      setData({});
      const storedToken = localStorage.getItem("emsToken");
      if (!storedToken) return router.replace("/");
      const token = JSON.parse(storedToken);

      const response = await fetch(
        `http://${SERVERID}/api/v1/getNodeDetailsByNodeIP/${SelectedIp}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        localStorage.removeItem("emsToken");
        return router.replace("/");
      }

      const data = await response.json();
      setData(data || {});
    } catch (err) {
      console.error(err);
      setData({});
    } finally {
      setIsLoading(false);
    }
  }, [SelectedIp, router]);

  useEffect(() => {
    if (authChecked) fetchData();
  }, [authChecked, fetchData]);

  return (
    <SideBarWrapper SelectedIp={SelectedIp}>
      <div style={{ flex: 1, padding: "20px", minHeight: "100vh", background: "#0f172a" }}>
        {isLoading ? (
          <div>Loading...</div>
        ) : Object.keys(Rack).length > 0 ? (
          <div>Main Rack Content Here</div>
        ) : (
          <Dashboard />
        )}
      </div>
    </SideBarWrapper>
  );
}
