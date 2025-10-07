// app/layout.tsx
import type { Metadata } from "next";
import { marvelFetch, mapCharacter } from "@/app/api/marvel/_utils";
import { MarvelCharacterDTO } from "@/types/api";
import Header from "@/components/Header/Header";
import ClientProviders from "./providers";
import StyledComponentsRegistry from "@/lib/registry";

export const metadata: Metadata = {
  title: "Marvel Characters",
  description: "Browse Marvel characters and comics",
};

// Función para obtener datos iniciales
async function getInitialCharacters() {
  try {
    const data = await marvelFetch<MarvelCharacterDTO>("/characters", {
      limit: 50,
      offset: 0,
      orderBy: "name",
    });
    return data.results.map(mapCharacter);
  } catch (error) {
    console.error("Error fetching initial characters:", error);
    return undefined; // El provider funcionará sin datos iniciales
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch en el layout para que esté disponible en todas las páginas
  const initialCharacters = await getInitialCharacters();

  return (
    <html lang="es">
      <body>
        <StyledComponentsRegistry>
          <ClientProviders initialCharacters={initialCharacters}>
            <Header />
            {children}
          </ClientProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}