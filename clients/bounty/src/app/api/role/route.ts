import { NextResponse } from "next/server";
import type { Role } from "@/lib/app-types";
import { setRole } from "@/server/db/service";

export async function POST(request: Request) {
  const body = (await request.json()) as { role: Role };
  const role = await setRole(body.role);
  return NextResponse.json(role);
}
