import type { ReactNode } from "react";
import { AmbientBackdrop } from "./AmbientBackdrop";
import { Nav, ScrollProgress, Footer, FloatingMenu } from "./Portfolio";
import { CustomCursor } from "./CustomCursor";
import { RouteTransition } from "./RouteTransition";
import { NeuralTransitionFX } from "./NeuralTransitionFX";

export function SectionLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CustomCursor />
      <AmbientBackdrop />
      <NeuralTransitionFX />
      <main className="relative">
        <ScrollProgress />
        <Nav />
        <RouteTransition>
          <div className="pt-24">{children}</div>
        </RouteTransition>
        <Footer />
        <FloatingMenu />
      </main>
    </>
  );
}
