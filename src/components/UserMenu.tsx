"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/Button";

export function UserMenu() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Cerrar sesión
    </Button>
  );
}

