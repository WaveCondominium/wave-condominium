'use client';

import { useState } from 'react';
import { X, CalendarDays, Mail } from 'lucide-react';

import type { Aviso, CategoriaAviso, NovoAvisoInput, Prioridade } from './types';
import { CATEGORIAS, CATEGORIA_OPTIONS, PRIORIDADES, PRIORIDADE_OPTIONS } from './constants';

interface AvisoFormModalProps {
  /** Se presente, o formulário abre em modo edição. */
  avisoParaEditar?: Aviso | null;
  onClose: () => void;
  onSubmit: (input: NovoAvisoInput) => void;
}

/**
 * Formulário de criação/edição de aviso. Renderizado apenas para gestores
 * (o gating acontece no painel; este componente assume permissão).
 */
export function AvisoFormModal({ avisoParaEditar, onClose, onSubmit }: AvisoFormModalProps) {
  const editando = Boolean(avisoParaEditar);

  const [prioridade, setPrioridade] = useState<Prioridade>(
    avisoParaEditar?.prioridade ?? 'normal',
  );
  const [categoria, setCategoria] = useState<CategoriaAviso>(
    avisoParaEditar?.categoria ?? 'comunicado',
  );
  const [titulo, setTitulo] = useState(avisoParaEditar?.titulo ?? '');
  const [conteudo, setConteudo] = useState(avisoParaEditar?.conteudo ?? '');
  const [dataEvento, setDataEvento] = useState(avisoParaEditar?.dataEvento ?? '');
  const [horarioEvento, setHorarioEvento] = useState(avisoParaEditar?.horarioEvento ?? '');
  const [localEvento, setLocalEvento] = useState(avisoParaEditar?.localEvento ?? '');
  const [comentariosAtivos, setComentariosAtivos] = useState(
    avisoParaEditar?.comentariosAtivos ?? true,
  );
  const [enviarEmail, setEnviarEmail] = useState(avisoParaEditar?.enviarEmail ?? true);
  const [erro, setErro] = useState<string | null>(null);

  const isEvento = categoria === 'evento';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (!titulo.trim()) return setErro('Informe o título do aviso.');
    if (!conteudo.trim()) return setErro('Informe a descrição do aviso.');
    if (isEvento && !dataEvento) return setErro('Informe a data do evento.');

    onSubmit({
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      categoria,
      prioridade,
      comentariosAtivos,
      enviarEmail,
      dataEvento: isEvento ? dataEvento : undefined,
      horarioEvento: isEvento ? horarioEvento || undefined : undefined,
      localEvento: isEvento ? localEvento || undefined : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={editando ? 'Editar aviso' : 'Novo aviso'}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl text-wave-800">{editando ? 'Editar Aviso' : 'Novo Aviso'}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-wave-500 transition-colors hover:text-wave-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prioridade" className="mb-2 block text-sm text-wave-800">
                Prioridade
              </label>
              <select
                id="prioridade"
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
              >
                {PRIORIDADE_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {PRIORIDADES[p].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="categoria" className="mb-2 block text-sm text-wave-800">
                Categoria
              </label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaAviso)}
                className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
              >
                {CATEGORIA_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIAS[c].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="titulo" className="mb-2 block text-sm text-wave-800">
              Título
            </label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Manutenção no elevador A"
              className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
          </div>

          {isEvento && (
            <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-purple-800">
                <CalendarDays className="h-3.5 w-3.5" />
                Detalhes do evento
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dataEvento" className="mb-1.5 block text-sm text-wave-700">
                    Data do evento
                  </label>
                  <input
                    id="dataEvento"
                    type="date"
                    value={dataEvento}
                    onChange={(e) => setDataEvento(e.target.value)}
                    className="w-full rounded-lg border border-wave-200 bg-white px-3 py-2 text-sm text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
                  />
                </div>
                <div>
                  <label htmlFor="horarioEvento" className="mb-1.5 block text-sm text-wave-700">
                    Horário (opcional)
                  </label>
                  <input
                    id="horarioEvento"
                    type="time"
                    value={horarioEvento}
                    onChange={(e) => setHorarioEvento(e.target.value)}
                    className="w-full rounded-lg border border-wave-200 bg-white px-3 py-2 text-sm text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="localEvento" className="mb-1.5 block text-sm text-wave-700">
                  Local (opcional)
                </label>
                <input
                  id="localEvento"
                  type="text"
                  value={localEvento}
                  onChange={(e) => setLocalEvento(e.target.value)}
                  placeholder="Ex: Salão de festas"
                  className="w-full rounded-lg border border-wave-200 bg-white px-3 py-2 text-sm text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="conteudo" className="mb-2 block text-sm text-wave-800">
              Descrição
            </label>
            <textarea
              id="conteudo"
              rows={4}
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Descreva o aviso..."
              className="w-full resize-none rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-wave-800">
            <input
              type="checkbox"
              checked={comentariosAtivos}
              onChange={(e) => setComentariosAtivos(e.target.checked)}
              className="h-4 w-4 rounded text-wave-500"
            />
            Permitir comentários
          </label>

          <label className="flex items-center gap-2 rounded-xl bg-wave-50 p-3 text-sm text-wave-800">
            <input
              type="checkbox"
              checked={enviarEmail}
              onChange={(e) => setEnviarEmail(e.target.checked)}
              className="h-4 w-4 rounded text-wave-500"
            />
            <Mail className="h-4 w-4" />
            Notificar moradores por e-mail
          </label>

          {erro && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-wave-100 py-3 text-wave-600 transition-colors hover:bg-wave-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-wave-700 to-wave-500 py-3 text-white shadow-lg transition-all hover:opacity-95"
            >
              {editando ? 'Salvar' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
