import { NextResponse } from "next/server";
import type { UpdatePropertyInput } from "@/lib/app-types";
import { updateProperty } from "@/server/db/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as UpdatePropertyInput;
  const property = await updateProperty(id, body);
  return NextResponse.json(property);
}
