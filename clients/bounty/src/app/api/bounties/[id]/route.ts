import { NextResponse } from "next/server";
import { deleteBounty } from "@/server/db/service";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await deleteBounty(id);
  return NextResponse.json(result);
}
