import { Megaphone } from 'lucide-react';

interface AvisosEmptyStateProps {
  /** Só o gestor vê a orientação de criar; morador vê mensagem passiva. */
  canManage: boolean;
  onCreate?: () => void;
}

/** Estado vazio da lista de avisos. */
export function AvisosEmptyState({ canManage, onCreate }: AvisosEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-wave-200 bg-white/70 px-6 py-16 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-wave-100">
        <Megaphone className="h-7 w-7 text-wave-500" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-lg text-wave-800">Nenhum comunicado publicado</h3>
      <p className="max-w-sm text-sm text-wave-500">
        {canManage
          ? 'Publique o primeiro comunicado para manter os moradores informados sobre o dia a dia do condomínio.'
          : 'Quando o síndico publicar avisos importantes, eles aparecerão aqui.'}
      </p>
      {canManage && onCreate && (
        <button
          onClick={onCreate}
          className="mt-6 rounded-xl bg-gradient-to-r from-wave-700 to-wave-500 px-5 py-2.5 text-sm text-white shadow-lg transition-all hover:opacity-95"
        >
          Publicar comunicado
        </button>
      )}
    </div>
  );
}
