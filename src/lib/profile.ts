"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "analyst" | "participant";
};

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setProfile(null);
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("id,email,full_name,role")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (!active) return;
        setProfile(data as Profile);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return { profile, loading };
}

