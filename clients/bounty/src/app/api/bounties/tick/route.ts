import { NextResponse } from "next/server";
import { tickAcceptedBounties } from "@/server/db/service";

export async function POST(request: Request) {
  const body = (await request.json()) as { seconds?: number };
  const bounties = await tickAcceptedBounties(body.seconds ?? 1);
  return NextResponse.json(bounties);
}
