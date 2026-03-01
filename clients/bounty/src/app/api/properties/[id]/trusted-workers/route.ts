import { NextResponse } from "next/server";
import type { AddTrustedWorkersInputItem } from "@/lib/app-types";
import { addTrustedWorkers } from "@/server/db/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { workers: AddTrustedWorkersInputItem[] };
  const property = await addTrustedWorkers(id, body.workers);
  return NextResponse.json(property);
}
