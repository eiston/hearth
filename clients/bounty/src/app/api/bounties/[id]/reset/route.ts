import { NextResponse } from "next/server";
import { resetBountyToAvailable } from "@/server/db/service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bounty = await resetBountyToAvailable(id);
  return NextResponse.json(bounty);
}
