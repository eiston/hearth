import { NextResponse } from "next/server";
import { submitBountyWork } from "@/server/db/service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bounty = await submitBountyWork(id);
  return NextResponse.json(bounty);
}
