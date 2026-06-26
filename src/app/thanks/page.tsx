import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";

export default function ThanksPage() {
  return (
    <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <div className="flex w-full items-center justify-between gap-4">
          <Logo size={200} />
          <UserMenu />
        </div>
        <Card className="w-full space-y-4">
          <h1 className="text-3xl font-extrabold text-white">
            Gracias por completar la evaluación.
          </h1>
          <p className="text-white/70">
            Tu reporte estará disponible de inmediato en el panel. Talentoría
            convierte respuestas en decisiones accionables.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/report/me">
              <Button>Ver mi reporte</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">Volver al acceso</Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
