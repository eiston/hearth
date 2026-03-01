import { NextResponse } from "next/server";
import { acceptBounty } from "@/server/db/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { workerId: string };
  const bounty = await acceptBounty(id, body.workerId);
  return NextResponse.json(bounty);
}
