"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";
import { useProfile } from "@/lib/profile";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
};

type ResponseRow = {
  id: string;
  user_id: string;
  completed_at: string | null;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const { profile, loading: loadingProfile } = useProfile(session?.user.id);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [inviteInput, setInviteInput] = useState("");
  const [inviteLinks, setInviteLinks] = useState<
    { email: string; link: string }[]
  >([]);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [adminAllowed, setAdminAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading || loadingProfile) return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (profile?.role !== "admin" && adminAllowed !== true) return;

    supabase
      .from("profiles")
      .select("id,email,full_name,role")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProfiles((data as ProfileRow[]) ?? []);
      });

    supabase
      .from("survey_responses")
      .select("id,user_id,completed_at,created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setResponses((data as ResponseRow[]) ?? []);
      });
  }, [session, loading, profile, loadingProfile, router]);

  useEffect(() => {
    if (loading || loadingProfile || !session) return;
    let mounted = true;
    const resolveAdmin = async () => {
      const { data: roleRow } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!mounted) return;
      if (roleRow?.role === "admin") {
        setAdminAllowed(true);
        return;
      }
      const { data: isAdminData, error } = await supabase.rpc("is_admin");
      if (!mounted) return;
      if (!error && typeof isAdminData === "boolean") {
        setAdminAllowed(isAdminData);
        return;
      }
      setAdminAllowed(false);
    };
    resolveAdmin();
    return () => {
      mounted = false;
    };
  }, [loading, loadingProfile, session]);

  const responseByUser = useMemo(() => {
    const map = new Map<string, ResponseRow>();
    responses.forEach((response) => {
      if (!map.has(response.user_id)) {
        map.set(response.user_id, response);
      }
    });
    return map;
  }, [responses]);

  const parseEmails = (text: string) => {
    const matches =
      text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
    return Array.from(new Set(matches.map((item) => item.toLowerCase())));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const emails = parseEmails(text);
      if (!emails.length) {
        setInviteStatus("No se encontraron correos en el CSV.");
        return;
      }
      setInviteStatus(`CSV cargado: ${emails.length} correos detectados.`);
      setInviteInput((prev) => {
        const existing = parseEmails(prev);
        const merged = Array.from(new Set([...existing, ...emails]));
        return merged.join("\n");
      });
    };
    reader.readAsText(file);
  };

  const handleInvite = async () => {
    if (!session) return;
    const emails = parseEmails(inviteInput);
    if (!emails.length) {
      setInviteStatus("No se detectaron correos válidos.");
      return;
    }
    setInviteStatus(null);
    setLoadingInvite(true);
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    const rows = emails.map((email) => ({
      email,
      token: crypto.randomUUID(),
      created_by: session.user.id,
      expires_at: expires.toISOString(),
    }));

    const { error } = await supabase.from("invitations").insert(rows);
    if (error) {
      setInviteStatus(error.message);
      setLoadingInvite(false);
      return;
    }
    const links = rows.map((row) => ({
      email: row.email,
      link: `${window.location.origin}/invite/${row.token}`,
    }));
    setInviteLinks(links);
    setInviteInput("");
    setLoadingInvite(false);
  };

  const handleCopyAll = async () => {
    if (!inviteLinks.length) return;
    const content = inviteLinks
      .map((item) => `${item.email},${item.link}`)
      .join("\n");
    await navigator.clipboard.writeText(content);
    setInviteStatus("Links copiados al portapapeles.");
  };

  if (loading || loadingProfile || adminAllowed === null) {
    return (
      <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-12">
        <Card>Cargando...</Card>
      </main>
    );
  }

  if (!session) return null;

  if (!adminAllowed) {
    return (
      <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-12">
        <Card className="text-white/70">
          Acceso restringido. Solo administradores.
          <div className="mt-3 text-xs text-white/50">
            Si ya cambiaste tu rol, cierra sesión y vuelve a iniciar.
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Logo size={240} />
            <h1 className="mt-4 text-3xl font-extrabold text-white">
              Panel de administración
            </h1>
            <p className="text-white/70">
              Gestiona accesos, usuarios y reportes.
            </p>
          </div>
          <UserMenu />
        </div>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Invitaciones masivas</h2>
          <p className="text-sm text-white/70">
            Agrega correos separados por coma, espacio o salto de línea. También
            puedes subir un CSV con una columna de emails.
          </p>
          <div className="flex flex-col gap-3">
            <textarea
              value={inviteInput}
              onChange={(event) => setInviteInput(event.target.value)}
              placeholder="correo1@empresa.com&#10;correo2@empresa.com&#10;correo3@empresa.com"
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-glass-20 bg-glass-10 px-4 py-2 text-sm text-white/80 hover:border-white/40 hover:text-white">
                Subir CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <Button onClick={handleInvite} disabled={loadingInvite}>
                {loadingInvite ? "Generando..." : "Generar invitaciones"}
              </Button>
              {inviteLinks.length ? (
                <Button variant="outline" onClick={handleCopyAll}>
                  Copiar links
                </Button>
              ) : null}
            </div>
            {inviteStatus ? (
              <p className="text-xs text-white/60">{inviteStatus}</p>
            ) : null}
          </div>
          {inviteLinks.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Links generados:
              <div className="mt-2 space-y-2">
                {inviteLinks.map((item) => (
                  <div key={item.link} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-white/50">{item.email}</p>
                    <p className="break-all text-white">{item.link}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Usuarios</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.2em]">
                  <th className="py-3 pr-4">Correo</th>
                  <th className="py-3 pr-4">Rol</th>
                  <th className="py-3 pr-4">Último reporte</th>
                  <th className="py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((item) => {
                  const response = responseByUser.get(item.id);
                  return (
                    <tr key={item.id} className="border-b border-white/5">
                      <td className="py-3 pr-4">{item.email ?? "—"}</td>
                      <td className="py-3 pr-4">{item.role}</td>
                      <td className="py-3 pr-4">
                        {response?.completed_at
                          ? new Date(response.completed_at).toLocaleDateString()
                          : "Pendiente"}
                      </td>
                      <td className="py-3">
                        {response ? (
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/report/${response.id}`)}
                          >
                            Ver reporte
                          </Button>
                        ) : (
                          <span className="text-xs text-white/40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
