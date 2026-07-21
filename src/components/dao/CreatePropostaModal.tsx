'use client';

import { useState } from 'react';
import { X, Vote } from 'lucide-react';

import { type Categoria, CATEGORIA_LABEL, CATEGORIA_OPTIONS, DIAS_VOTACAO } from './governanceCore';

interface CreatePropostaModalProps {
  onClose: () => void;
  onCreate: (input: { titulo: string; descricao: string; categoria: Categoria }) => void;
}

/** Modal do Sindico para criar/publicar uma proposta (entra em Votacao Aberta). */
export function CreatePropostaModal({ onClose, onCreate }: CreatePropostaModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<Categoria>('melhorias');
  const [erro, setErro] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!titulo.trim()) return setErro('Informe o titulo da proposta.');
    if (!descricao.trim()) return setErro('Informe a descricao detalhada.');
    onCreate({ titulo: titulo.trim(), descricao: descricao.trim(), categoria });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Nova proposta"
      onClick={onClose}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl text-wave-800">
            <Vote className="h-6 w-6 text-wave-600" />
            Nova Proposta
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="text-wave-500 hover:text-wave-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="titulo" className="mb-2 block text-sm text-wave-800">Titulo</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Instalacao de energia solar"
              className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
          </div>

          <div>
            <label htmlFor="categoria" className="mb-2 block text-sm text-wave-800">Categoria</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
              className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            >
              {CATEGORIA_OPTIONS.map((c) => (
                <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="descricao" className="mb-2 block text-sm text-wave-800">
              Descrição detalhada <span className="text-red-500">*</span>
            </label>
            <textarea
              id="descricao"
              rows={5}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Inclua: objetivo, justificativa, benefícios esperados, impactos para o condomínio e informações complementares que ajudem os moradores a decidir."
              className="w-full resize-none rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
            <p className="mt-1.5 text-xs text-wave-500">
              Descreva sua proposta com o máximo de detalhes possível. Caso as informações sejam insuficientes, o
              Síndico poderá remover a proposta ou solicitar ajustes antes de sua discussão em Assembleia.
            </p>
          </div>

          <div className="rounded-xl border border-wave-200 bg-wave-50 p-3 text-xs text-wave-600">
            Sua proposta será publicada <strong>diretamente para a votação inicial dos moradores</strong>, sem depender
            de aprovação prévia. A votação fica aberta por {DIAS_VOTACAO} dias corridos e todos são notificados.
          </div>

          {erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{erro}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl bg-wave-100 py-3 text-wave-600 transition-colors hover:bg-wave-200">
              Cancelar
            </button>
            <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-wave-700 to-wave-500 py-3 text-white shadow-lg transition-all hover:opacity-95">
              Enviar para Votação Inicial
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
