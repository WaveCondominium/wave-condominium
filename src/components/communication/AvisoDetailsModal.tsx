'use client';

import { useState } from 'react';
import { X, User, Clock, CalendarDays, MapPin } from 'lucide-react';

import type { Aviso } from './types';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { formatDataHora, formatDataEvento } from './avisoUtils';

interface AvisoDetailsModalProps {
  aviso: Aviso;
  onClose: () => void;
  onAddComment: (conteudo: string) => void;
}

/** Modal de detalhes de um aviso, com comentários. */
export function AvisoDetailsModal({ aviso, onClose, onAddComment }: AvisoDetailsModalProps) {
  const [texto, setTexto] = useState('');
  const comentarios = aviso.comentarios ?? [];

  const handleEnviar = () => {
    const t = texto.trim();
    if (!t) return;
    onAddComment(t);
    setTexto('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={aviso.titulo}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-2xl text-wave-800">{aviso.titulo}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 text-wave-500 transition-colors hover:text-wave-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <PriorityBadge prioridade={aviso.prioridade} />
          <CategoryBadge categoria={aviso.categoria} />
        </div>

        {aviso.categoria === 'evento' && (aviso.dataEvento || aviso.localEvento) && (
          <div className="mb-4 flex flex-wrap gap-4 rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800">
            {aviso.dataEvento && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDataEvento(aviso.dataEvento)}
              </span>
            )}
            {aviso.horarioEvento && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {aviso.horarioEvento}
              </span>
            )}
            {aviso.localEvento && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {aviso.localEvento}
              </span>
            )}
          </div>
        )}

        <p className="mb-6 whitespace-pre-wrap text-wave-700">{aviso.conteudo}</p>

        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-wave-100 pb-6 text-sm text-wave-500">
          <span className="inline-flex items-center gap-1">
            <User className="h-4 w-4" aria-hidden="true" />
            {aviso.autor}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatDataHora(aviso.dataPublicacao)}
          </span>
        </div>

        {aviso.comentariosAtivos ? (
          <div>
            <h3 className="mb-4 text-wave-800">Comentários ({comentarios.length})</h3>

            <div className="mb-6 space-y-3">
              {comentarios.length === 0 && (
                <p className="text-sm text-wave-400">Seja o primeiro a comentar.</p>
              )}
              {comentarios.map((c) => (
                <div key={c.id} className="rounded-xl bg-wave-50 p-4">
                  <div className="mb-1.5 flex items-center gap-2 text-xs text-wave-500">
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span className="text-wave-800">{c.autor}</span>
                    <span>• {formatDataHora(c.data)}</span>
                  </div>
                  <p className="text-sm text-wave-700">{c.conteudo}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva seu comentário..."
                aria-label="Novo comentário"
                className="flex-1 rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
                onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
              />
              <button
                onClick={handleEnviar}
                disabled={!texto.trim()}
                className="rounded-xl bg-gradient-to-r from-wave-700 to-wave-500 px-6 py-3 text-white shadow-lg transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-wave-400">Os comentários estão desativados para este aviso.</p>
        )}
      </div>
    </div>
  );
}
