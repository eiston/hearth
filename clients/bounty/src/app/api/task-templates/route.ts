import { NextResponse } from "next/server";
import type { CreateTaskTemplateInput } from "@/lib/app-types";
import { addTaskTemplate } from "@/server/db/service";

export async function POST(request: Request) {
  const body = (await request.json()) as CreateTaskTemplateInput;
  const taskTemplate = await addTaskTemplate(body);
  return NextResponse.json(taskTemplate);
}
