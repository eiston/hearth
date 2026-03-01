import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function TaskEngineCreateBountyDialog() {
  const router = useRouter();
  return (
    <Button onClick={() => router.push("/tasks/new")}>Create Bounty</Button>
  );
}
