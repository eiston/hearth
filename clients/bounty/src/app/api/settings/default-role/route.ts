import { NextResponse } from "next/server";
import type { Role } from "@/lib/app-types";
import { setDefaultRole } from "@/server/db/service";

export async function PATCH(request: Request) {
  const body = (await request.json()) as { role: Role };
  const role = await setDefaultRole(body.role);
  return NextResponse.json(role);
}
