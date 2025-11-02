"use client";

import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface Trilha {
  _id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: string;
  image?: string;
}

interface Props {
  items?: Trilha[]; // Pode ser undefined ou array vazio
  onClick?: (id: string) => void;
}

export default function Carrousel({ items = [], onClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('large');
  const [cardWidth, setCardWidth] = useState('15rem');
  const [scrollAmount, setScrollAmount] = useState(300);

  // Detecta tamanho da tela e ajusta cards
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 400) { setScreenSize('small'); setCardWidth('11rem'); setScrollAmount(190); }
      else if (width < 768) { setScreenSize('medium'); setCardWidth('13rem'); setScrollAmount(225); }
      else { setScreenSize('large'); setCardWidth('15rem'); setScrollAmount(300); }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      if (scrollRef.current.scrollLeft === 0) {
        scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      if (scrollRef.current.scrollLeft + scrollRef.current.clientWidth >= scrollRef.current.scrollWidth - 1) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const isMobile = screenSize !== 'large';
  const isSmall = screenSize === 'small';

  if (items.length === 0) {
    return <p className="text-center text-gray-500 py-6">Nenhuma trilha encontrada.</p>;
  }

  return (
    <div className={`flex flex-col items-center gap-4 rounded-xl w-full mx-auto ${isMobile ? 'p-2' : 'p-4'}`}>
      <div className="flex items-center gap-2 w-full">
        <button onClick={handleScrollLeft} className={`flex-shrink-0 hover:bg-sky-50 rounded ${isSmall ? 'p-0.5' : isMobile ? 'p-1' : 'p-3'}`}>
          <ChevronLeftIcon className={isSmall ? 'w-5 h-5' : isMobile ? 'w-6 h-6' : 'w-10 h-10'} />
        </button>

        <div ref={scrollRef} className={`flex overflow-x-auto no-scrollbar scroll-smooth w-full py-2 ${isSmall ? 'gap-2' : 'gap-4'}`}>
          {items.map((item) => (
            <div
              key={item._id}
              onClick={() => onClick?.(item._id)}
              className="flex-shrink-0 w-full rounded-lg border bg-white shadow hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-200 transform"
              style={{ minWidth: cardWidth, maxWidth: cardWidth }}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.titulo}
                  className="mx-auto max-w-30 max-h-24 object-contain my-2 rounded-xl"
                />
              )}
              <div className="p-2">
                <h3 className="text-base font-bold">{item.titulo}</h3>
                <p className="text-sm">{item.descricao}</p>
                <p className="text-xs mt-1">
                  Matéria: <b>{item.materia}</b> | Dificuldade: <b>{item.dificuldade}</b>
                </p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleScrollRight} className={`flex-shrink-0 hover:bg-sky-50 rounded ${isSmall ? 'p-0.5' : isMobile ? 'p-1' : 'p-3'}`}>
          <ChevronRightIcon className={isSmall ? 'w-5 h-5' : isMobile ? 'w-6 h-6' : 'w-10 h-10'} />
        </button>
      </div>
    </div>
  );
}
