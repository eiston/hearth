import { NextResponse } from "next/server";
import type { CreateBountyInput } from "@/lib/app-types";
import { createBounty } from "@/server/db/service";

export async function POST(request: Request) {
  const body = (await request.json()) as CreateBountyInput;
  const bounty = await createBounty(body);
  return NextResponse.json(bounty);
}
