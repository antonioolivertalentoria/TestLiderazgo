"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const action =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/login`,
            },
          });

    const { data, error } = await action;
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Revisa tu correo para verificar tu cuenta.");
      return;
    }

    const userId = data?.user?.id;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (profile?.role === "admin") {
        router.push("/admin");
        return;
      }
    }

    router.push("/survey");
  };

  return (
    <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <Logo size={280} />
        <div className="grid gap-8 md:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Liderazgo situacional con evidencia real.
            </h1>
            <p className="text-lg text-white/70">
              Accede a la evaluación Talentoría y recibe un reporte con
              hallazgos claros, accionables y visuales.
            </p>
            <div className="flex gap-3">
              <Button
                variant={mode === "login" ? "primary" : "outline"}
                onClick={() => setMode("login")}
                type="button"
              >
                Iniciar sesión
              </Button>
              <Button
                variant={mode === "signup" ? "primary" : "outline"}
                onClick={() => setMode("signup")}
                type="button"
              >
                Crear cuenta
              </Button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/70">
                Seguridad premium: contraseñas robustas, verificación de correo
                y control de acceso por roles.
              </p>
            </div>
          </div>

          <Card>
            <h2 className="text-xl font-semibold text-white">
              {mode === "login" ? "Bienvenido de nuevo" : "Crear acceso"}
            </h2>
            <p className="mt-2 text-sm text-white/60">
              {mode === "login"
                ? "Usa tu correo y contraseña para continuar."
                : "Regístrate para iniciar tu evaluación."}
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Correo
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  placeholder="tu@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              {message ? (
                <p className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs text-white/70">
                  {message}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full justify-center"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : mode === "login"
                    ? "Entrar"
                    : "Crear cuenta"}
              </Button>
              <p className="text-xs text-white/50">
                Al continuar aceptas nuestro uso responsable de datos
                psicométricos y el procesamiento seguro de tu información.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}
