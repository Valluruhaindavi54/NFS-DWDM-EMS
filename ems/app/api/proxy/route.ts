import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint is required" }, { status: 400 });
  }

  // The actual address of your hardware/API
  const targetUrl = `http://192.168.21.245:9999/api/${endpoint}`;

  try {
    const res = await fetch(targetUrl, {
      cache: 'no-store', 
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return NextResponse.json({ error: "External API Error" }, { status: res.status });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to connect to Local API" }, { status: 500 });
  }
}