import { NextResponse } from "next/server";
import { toggleBountyBoost } from "@/server/db/service";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bounty = await toggleBountyBoost(id);
  return NextResponse.json(bounty);
}
