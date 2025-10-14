"use client";

import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

export default function HomePage() {
  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (!api) return;
      // Si está en el último slide, vuelve al primero
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <main className="min-h-screen flex flex-col bg-slate-900 text-white">
      <NavBar />

      <section className="flex-1 w-full flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-5xl w-full text-center space-y-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-500 tracking-tight">
            Bienvenido a Pedro Arca
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Plataforma inteligente para la gestión, lectura y validación automática de documentos de ingreso médico con Inteligencia artificial.
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto">
          <Carousel className="relative" setApi={setApi} opts={{ loop: true }}>
            <CarouselContent>
              <CarouselItem>
                <img
                  src="/carousel/1.png"
                  alt="Empresa"
                  className="w-full h-[400px] md:h-[500px] object-cover rounded-xl border border-slate-800 shadow-lg"
                />
              </CarouselItem>

              <CarouselItem>
                <img
                  src="/carousel/2.png"
                  alt="Proveedor de servicios"
                  className="w-full h-[400px] md:h-[500px] object-cover rounded-xl border border-slate-800 shadow-lg"
                />
              </CarouselItem>
            </CarouselContent>

            <CarouselPrevious className="border-slate-600 text-slate-300 hover:bg-slate-700" />
            <CarouselNext className="border-slate-600 text-slate-300 hover:bg-slate-700" />
          </Carousel>
        </div>
      </section>

      <Footer />
    </main>
  );
}
