import { NextResponse } from "next/server";
import type { OwnerBountyLane } from "@/lib/app-types";
import { moveBountyLane } from "@/server/db/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { lane: OwnerBountyLane };
  const bounty = await moveBountyLane(id, body.lane);
  return NextResponse.json(bounty);
}
