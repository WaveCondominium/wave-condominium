'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BlockCardProps {
  title: string;
  icon: React.ReactNode;
  /** Rota da listagem completa ("Ver todos"). */
  verTodosHref: string;
  count?: number;
  children: React.ReactNode;
}

/** Bloco padrao do Dashboard do Morador: cabecalho + "Ver todos" + conteudo. */
export function BlockCard({ title, icon, verTodosHref, count, children }: BlockCardProps) {
  return (
    <section className="flex flex-col rounded-2xl border border-wave-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-wave-100 p-2 text-wave-600">{icon}</div>
          <h2 className="text-wave-800">
            {title}
            {typeof count === 'number' && <span className="ml-1 text-sm text-wave-400">({count})</span>}
          </h2>
        </div>
        <Link
          href={verTodosHref}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-wave-500 transition-colors hover:bg-wave-50 hover:text-wave-700"
        >
          Ver todos
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

/** Estado vazio compacto para os blocos. */
export function BlockEmpty({ texto }: { texto: string }) {
  return <p className="py-6 text-center text-sm text-wave-400">{texto}</p>;
}
