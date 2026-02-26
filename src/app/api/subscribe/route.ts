import { NextResponse } from "next/server";

function getSubscribeBackendUrl(): string {
  if (
    typeof process.env.NEXT_PUBLIC_SUBSCRIBE_API_URL === "string" &&
    process.env.NEXT_PUBLIC_SUBSCRIBE_API_URL
  ) {
    return process.env.NEXT_PUBLIC_SUBSCRIBE_API_URL;
  }
  const projectId =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const region = process.env.NEXT_PUBLIC_FIREBASE_REGION || "us-central1";
  const functionName = process.env.NEXT_PUBLIC_SUBSCRIBE_FUNCTION || "subscribe";
  if (projectId) {
    return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;
  }
  return "";
}

export async function POST(request: Request) {
  const url = getSubscribeBackendUrl();
  if (!url) {
    return NextResponse.json(
      { error: "Subscribe API not configured" },
      { status: 500 }
    );
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json(
      { error: text || `Backend returned ${res.status}` },
      { status: res.status }
    );
  }
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
