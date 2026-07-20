'use client';

import { User, Clock, CalendarDays, MessageSquare, Pencil, Trash2, MapPin } from 'lucide-react';

import type { Aviso } from './types';
import { PRIORIDADES } from './constants';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { formatDataHora, formatDataEvento } from './avisoUtils';

interface AvisoCardProps {
  aviso: Aviso;
  /** Gestor (Síndico/Admin) vê ações de editar/excluir. */
  canManage: boolean;
  onOpen: (aviso: Aviso) => void;
  onEdit: (aviso: Aviso) => void;
  onDelete: (aviso: Aviso) => void;
}

/** Card de um aviso na listagem. Destaca visualmente avisos urgentes. */
export function AvisoCard({ aviso, canManage, onOpen, onEdit, onDelete }: AvisoCardProps) {
  const isUrgente = aviso.prioridade === 'urgente';
  const cardClass = PRIORIDADES[aviso.prioridade].cardClass;
  const numComentarios = aviso.comentarios?.length ?? 0;

  return (
    <article
      className={`group rounded-2xl border-2 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md sm:p-6 ${cardClass}`}
    >
      {/* Faixa de destaque para urgentes */}
      {isUrgente && (
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-red-600">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Aviso urgente
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <PriorityBadge prioridade={aviso.prioridade} />
            <CategoryBadge categoria={aviso.categoria} />
          </div>

          <h3 className="mb-2 text-lg leading-snug text-wave-800">{aviso.titulo}</h3>
          <p className="mb-4 line-clamp-3 text-sm text-wave-600">{aviso.conteudo}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-wave-500">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              {aviso.autor}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDataHora(aviso.dataPublicacao)}
            </span>
            {aviso.categoria === 'evento' && aviso.dataEvento && (
              <span className="inline-flex items-center gap-1 text-purple-600">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Evento em {formatDataEvento(aviso.dataEvento)}
                {aviso.horarioEvento ? ` às ${aviso.horarioEvento}` : ''}
              </span>
            )}
            {aviso.localEvento && (
              <span className="inline-flex items-center gap-1 text-purple-600">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {aviso.localEvento}
              </span>
            )}
            {aviso.comentariosAtivos && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                {numComentarios} {numComentarios === 1 ? 'comentário' : 'comentários'}
              </span>
            )}
          </div>
        </div>

        {/* Ações de gestão — só o Síndico/Admin vê (não apenas desabilitado) */}
        {canManage && (
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => onEdit(aviso)}
              aria-label={`Editar aviso ${aviso.titulo}`}
              className="rounded-lg p-2 text-wave-500 transition-colors hover:bg-wave-100 hover:text-wave-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(aviso)}
              aria-label={`Excluir aviso ${aviso.titulo}`}
              className="rounded-lg p-2 text-wave-500 transition-colors hover:bg-red-100 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => onOpen(aviso)}
        className="mt-4 w-full rounded-xl bg-wave-100 py-2 text-sm text-wave-600 transition-colors hover:bg-wave-200"
      >
        {aviso.comentariosAtivos ? 'Ver detalhes e comentar' : 'Ver detalhes'}
      </button>
    </article>
  );
}
