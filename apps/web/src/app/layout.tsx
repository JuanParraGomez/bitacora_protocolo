import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ruta — De un problema a una solución tecnológica',
  description:
    'Responde 4-5 preguntas simples por fase y obtén un plan que reutiliza herramientas existentes para construir tu proyecto.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
