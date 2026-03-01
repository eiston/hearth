import { NextResponse } from "next/server";
import { removeGlobalTrustedWorker } from "@/server/db/service";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workers = await removeGlobalTrustedWorker(id);
  return NextResponse.json(workers);
}
