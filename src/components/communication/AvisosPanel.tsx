'use client';

import { useMemo, useState } from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { useUser } from '../../contexts/UserContext';
import { isManager } from '../../lib/rbac';
import type { Aviso, NovoAvisoInput } from './types';
import { useAvisos } from './useAvisos';
import { AvisoCard } from './AvisoCard';
import { AvisoDetailsModal } from './AvisoDetailsModal';
import { AvisoFormModal } from './AvisoFormModal';
import { AvisosEmptyState } from './AvisosEmptyState';
import { AvisosListSkeleton } from './AvisoCardSkeleton';
import { ConfirmDialog } from './ConfirmDialog';

/**
 * Painel de Avisos: lista ordenada (urgente no topo + cronológico),
 * criação/edição/exclusão restritas ao Síndico (RBAC), leitura para todos.
 */
export function AvisosPanel() {
  const { userProfile, isLoading } = useUser();
  const canManage = isManager(userProfile.role);
  const nomeAutor = userProfile.name || 'Síndico';
  const nomeLeitor =
    userProfile.name + (userProfile.unit ? ` - ${userProfile.unit}` : '') || 'Morador';

  const { avisos, loading, criarAviso, editarAviso, excluirAviso, adicionarComentario } = useAvisos();

  const [detalheId, setDetalheId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [avisoEmEdicao, setAvisoEmEdicao] = useState<Aviso | null>(null);
  const [avisoParaExcluir, setAvisoParaExcluir] = useState<Aviso | null>(null);

  // Deriva o aviso aberto a partir do estado atual (reflete comentários novos).
  const avisoDetalhe = useMemo(
    () => avisos.find((a) => a.id === detalheId) ?? null,
    [avisos, detalheId],
  );

  const abrirCriacao = () => {
    setAvisoEmEdicao(null);
    setShowForm(true);
  };

  const abrirEdicao = (aviso: Aviso) => {
    setAvisoEmEdicao(aviso);
    setShowForm(true);
  };

  const handleSubmitForm = async (input: NovoAvisoInput) => {
    setShowForm(false);
    try {
      if (avisoEmEdicao) {
        await editarAviso({ id: avisoEmEdicao.id, ...input });
        toast.success('Aviso atualizado com sucesso!');
      } else {
        await criarAviso(input, nomeAutor);
        toast.success(
          input.enviarEmail ? 'Aviso publicado e moradores notificados!' : 'Aviso publicado!',
          input.enviarEmail
            ? { description: 'Todos os moradores cadastrados receberam o comunicado por e-mail.' }
            : undefined,
        );
      }
    } catch (err) {
      console.error('Falha ao salvar aviso', err);
      toast.error('Não foi possível salvar o aviso. Tente novamente.');
    } finally {
      setAvisoEmEdicao(null);
    }
  };

  const confirmarExclusao = async () => {
    if (!avisoParaExcluir) return;
    const alvo = avisoParaExcluir;
    setAvisoParaExcluir(null);
    try {
      await excluirAviso(alvo.id);
      if (detalheId === alvo.id) setDetalheId(null);
      toast.success('Aviso excluído.');
    } catch (err) {
      console.error('Falha ao excluir aviso', err);
      toast.error('Não foi possível excluir o aviso.');
    }
  };

  const handleAddComment = async (conteudo: string) => {
    if (!avisoDetalhe) return;
    try {
      const ok = await adicionarComentario(avisoDetalhe.id, nomeLeitor, conteudo);
      if (ok) toast.success('Comentário adicionado!');
    } catch (err) {
      console.error('Falha ao comentar', err);
      toast.error('Não foi possível adicionar o comentário.');
    }
  };

  return (
    <section className="relative z-10 space-y-4">
      {/* Barra de ação — botão de criar só aparece para o gestor */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-wave-600">
          {avisos.length} {avisos.length === 1 ? 'comunicado publicado' : 'comunicados publicados'}
        </p>
        {canManage ? (
          <button
            onClick={abrirCriacao}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-wave-700 to-wave-500 px-4 py-2.5 text-sm text-white shadow-lg transition-all hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Novo Aviso
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-wave-50 px-3 py-1.5 text-xs text-wave-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Comunicados publicados pelo síndico
          </span>
        )}
      </div>

      {isLoading || loading ? (
        <AvisosListSkeleton />
      ) : avisos.length === 0 ? (
        <AvisosEmptyState canManage={canManage} onCreate={abrirCriacao} />
      ) : (
        <div className="space-y-4">
          {avisos.map((aviso) => (
            <AvisoCard
              key={aviso.id}
              aviso={aviso}
              canManage={canManage}
              onOpen={(a) => setDetalheId(a.id)}
              onEdit={abrirEdicao}
              onDelete={setAvisoParaExcluir}
            />
          ))}
        </div>
      )}

      {avisoDetalhe && (
        <AvisoDetailsModal
          aviso={avisoDetalhe}
          onClose={() => setDetalheId(null)}
          onAddComment={handleAddComment}
        />
      )}

      {showForm && canManage && (
        <AvisoFormModal
          avisoParaEditar={avisoEmEdicao}
          onClose={() => {
            setShowForm(false);
            setAvisoEmEdicao(null);
          }}
          onSubmit={handleSubmitForm}
        />
      )}

      {avisoParaExcluir && canManage && (
        <ConfirmDialog
          title="Excluir aviso"
          description={`Tem certeza que deseja excluir "${avisoParaExcluir.titulo}"? Esta ação não pode ser desfeita.`}
          onConfirm={confirmarExclusao}
          onCancel={() => setAvisoParaExcluir(null)}
        />
      )}
    </section>
  );
}
