import "./globals.css";
import { ReactNode } from "react";
import Navbar from "./Components/Navbar";

export const metadata = {
  title: "Agenda UTESA",
  description: "Sistema de Agenda de Eventos - UTESA"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        <main className="max-w-5xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
