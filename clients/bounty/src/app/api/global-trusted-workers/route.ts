import { NextResponse } from "next/server";
import type { AddTrustedWorkersInputItem } from "@/lib/app-types";
import { addGlobalTrustedWorkers } from "@/server/db/service";

export async function POST(request: Request) {
  const body = (await request.json()) as { workers: AddTrustedWorkersInputItem[] };
  const workers = await addGlobalTrustedWorkers(body.workers ?? []);
  return NextResponse.json(workers);
}
