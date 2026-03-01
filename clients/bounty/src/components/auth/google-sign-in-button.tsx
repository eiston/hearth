"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  callbackUrl?: string;
}

export function GoogleSignInButton({ callbackUrl = "/" }: GoogleSignInButtonProps) {
  return (
    <Button onClick={() => signIn("google", { callbackUrl })} size="lg">
      Continue with Google
    </Button>
  );
}
