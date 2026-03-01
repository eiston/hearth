import { NextResponse } from "next/server";
import type { CreatePropertyInput } from "@/lib/app-types";
import { addProperty } from "@/server/db/service";

export async function POST(request: Request) {
  const body = (await request.json()) as CreatePropertyInput;
  const property = await addProperty(body);
  return NextResponse.json(property);
}
