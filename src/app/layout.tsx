// src/app/layout.tsx
import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import ClientProviders from "./providers";
import Header from "@/components/Header/Header";
import { Roboto_Condensed } from "next/font/google";
import { LoaderProvider } from "@/context/LoaderProvider";
import { Suspense } from "react";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marvel Characters",
  description: "Browse Marvel characters and comics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={robotoCondensed.variable}>
        <StyledComponentsRegistry>
          <ClientProviders>
            <LoaderProvider>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              {children}
            </LoaderProvider>
          </ClientProviders>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
