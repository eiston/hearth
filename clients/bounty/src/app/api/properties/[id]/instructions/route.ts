import { NextResponse } from "next/server";
import { updatePropertyInstructions } from "@/server/db/service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as { instructions: string };
  const property = await updatePropertyInstructions(id, body.instructions);
  return NextResponse.json(property);
}
