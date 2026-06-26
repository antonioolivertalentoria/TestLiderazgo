import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-talentoria bg-grid px-6 py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
        <div className="flex flex-col items-start gap-6">
          <Logo size={300} />
          <div className="max-w-2xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-white">
              Plataforma de evaluación de liderazgo situacional.
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Evalúa la capacidad de adaptar el estilo de liderazgo según el
              nivel de madurez del equipo y entrega reportes ejecutivos listos
              para la toma de decisiones.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/login">
              <Button>Acceder a la evaluación</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline">Panel de administración</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "12 situaciones reales",
              body: "Diseñadas para revelar tu respuesta natural ante equipos en distintos niveles de desempeño.",
            },
            {
              title: "Dashboard ejecutivo",
              body: "Indicadores claros de efectividad, flexibilidad y balance de estilos.",
            },
            {
              title: "PDF profesional",
              body: "Reportes descargables listos para presentar a stakeholders.",
            },
          ].map((item) => (
            <Card key={item.title} className="flex flex-col gap-3">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                {item.title}
              </p>
              <p className="text-base text-white/80">{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
