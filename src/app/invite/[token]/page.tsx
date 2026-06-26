"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";

type InviteRow = {
  id: string;
  email: string;
  expires_at: string;
  accepted_at: string | null;
};

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const [invite, setInvite] = useState<InviteRow | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    supabase
      .rpc("get_invitation", { p_token: token })
      .then(({ data }) => {
        const row = Array.isArray(data) ? data[0] : data;
        setInvite((row as InviteRow) ?? null);
      });
  }, [token]);

  const handleActivate = async () => {
    if (!invite) return;
    const { error } = await supabase.auth.signUp({
      email: invite.email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) {
      setStatus(error.message);
      return;
    }
    await supabase.rpc("accept_invitation", { p_token: token });
    setStatus("Cuenta creada. Verifica tu correo para activar el acceso.");
    router.push("/login");
  };

  const expired =
    invite && new Date(invite.expires_at).getTime() < Date.now();

  return (
    <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <Logo size={260} />
        <Card className="space-y-4">
          <h1 className="text-2xl font-bold text-white">
            Activar invitación
          </h1>
          {!invite ? (
            <p className="text-white/70">Validando invitación...</p>
          ) : expired ? (
            <p className="text-white/70">
              Esta invitación expiró. Solicita una nueva al administrador.
            </p>
          ) : (
            <>
              <p className="text-white/70">
                Invitación para: <span className="text-white">{invite.email}</span>
              </p>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Define tu contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              {status ? (
                <p className="text-xs text-white/60">{status}</p>
              ) : null}
              <Button onClick={handleActivate} disabled={!password}>
                Crear cuenta
              </Button>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
