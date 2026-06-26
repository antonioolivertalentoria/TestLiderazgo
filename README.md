# Talentoría · Liderazgo Situacional

Plataforma full‑stack para evaluación de liderazgo situacional con dashboard profesional y reportes PDF descargables.

## Requisitos
- Node.js 20+
- Cuenta gratuita de Supabase

## Configuración rápida
1. Copia variables de entorno:
   - `cp .env.example .env.local`
   - Completa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. En Supabase, ejecuta el SQL en `supabase/schema.sql`.
3. En la tabla `profiles`, asigna `role = 'admin'` a tu usuario.
4. Instala dependencias y levanta el proyecto:
   - `npm install`
   - `npm run dev`

## Flujo de invitaciones
- El admin genera un link en `/admin`.
- El usuario entra al link y crea su contraseña.
- El sistema solicita verificación de correo.

## Reportes PDF
La descarga de PDF se genera en el navegador con `html2canvas` + `jspdf`.

## Hostinger (Node.js Apps)
Build:
- `npm run build`

Start:
- `npm run start`

En hPanel, crea una Node.js App, sube el repositorio y configura las variables de entorno.

