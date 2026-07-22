'use client';

// ---------------------------------------------------------------------------
// src/components/communication/useAvisos.ts
//
// Camada de acesso a dados dos Avisos — agora sobre PostgreSQL via Server
// Actions (migracao localStorage -> banco, SOW Instaward entregavel 1).
//
// A UI (AvisosPanel) permanece igual; apenas o hook passou a ser assincrono e
// exp0e `loading`. Os dados sao escopados por condominio no servidor (a action
// usa o condominiumId da sessao), garantindo isolamento multi-tenant.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react';

import type { Aviso, Comentario, EditarAvisoInput, NovoAvisoInput } from './types';
import { cryptoId, normalizeAvisos, sortAvisos } from './avisoUtils';
import {
  listAvisosAction,
  criarAvisoAction,
  editarAvisoAction,
  excluirAvisoAction,
  adicionarComentarioAction,
} from '@/app/actions/avisos';

export interface UseAvisosResult {
  /** Ja ordenados (urgente no topo + cronologico). */
  avisos: Aviso[];
  loading: boolean;
  criarAviso: (input: NovoAvisoInput, autor: string) => Promise<void>;
  editarAviso: (input: EditarAvisoInput) => Promise<void>;
  excluirAviso: (id: string) => Promise<void>;
  adicionarComentario: (avisoId: string, autor: string, conteudo: string) => Promise<boolean>;
}

export function useAvisos(): UseAvisosResult {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial a partir do banco.
  useEffect(() => {
    let alive = true;
    listAvisosAction()
      .then((list) => {
        if (alive) setAvisos(sortAvisos(normalizeAvisos(list)));
      })
      .catch((err) => console.error('Falha ao carregar avisos', err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const criarAviso = useCallback(async (input: NovoAvisoInput, autor: string) => {
    const novo = await criarAvisoAction(input, autor);
    if (novo) setAvisos((prev) => sortAvisos([novo, ...prev]));
  }, []);

  const editarAviso = useCallback(async (input: EditarAvisoInput) => {
    const { id, ...patch } = input;
    await editarAvisoAction(id, patch);
    setAvisos((prev) => sortAvisos(prev.map((a) => (a.id === id ? { ...a, ...patch } : a))));
  }, []);

  const excluirAviso = useCallback(async (id: string) => {
    await excluirAvisoAction(id);
    setAvisos((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const adicionarComentario = useCallback(
    async (avisoId: string, autor: string, conteudo: string): Promise<boolean> => {
      const texto = conteudo.trim();
      if (!texto) return false;
      const res = await adicionarComentarioAction(avisoId, autor, texto);
      if (res.ok) {
        const comentario: Comentario = {
          id: cryptoId(),
          autor,
          conteudo: texto,
          data: new Date().toISOString(),
        };
        setAvisos((prev) =>
          prev.map((a) =>
            a.id === avisoId ? { ...a, comentarios: [...(a.comentarios ?? []), comentario] } : a,
          ),
        );
      }
      return res.ok;
    },
    [],
  );

  return { avisos, loading, criarAviso, editarAviso, excluirAviso, adicionarComentario };
}
