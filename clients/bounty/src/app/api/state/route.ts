import { NextResponse } from "next/server";
import { getSnapshot } from "@/server/db/service";

export async function GET() {
  const snapshot = await getSnapshot();
  return NextResponse.json(snapshot);
}
