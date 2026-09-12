import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Censos Arles · Administración",
  description: "Panel administrativo de conteo de frutos, producción y floración.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
