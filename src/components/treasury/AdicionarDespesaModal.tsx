'use client';

// ---------------------------------------------------------------------------
// src/components/treasury/AdicionarDespesaModal.tsx
//
// Cadastro de despesa (MOR-054) — uso EXCLUSIVO de perfis administrativos
// (Síndico/Administradora). O Morador não acessa este modal (o botão que o
// abre só é renderizado para gestor).
//
// Campos: categoria, descrição, valor, data do pagamento, comprovante e origem
// do recurso (saldo disponível / Fundo de Reserva). A despesa entra no histórico
// de transações. A DEDUÇÃO efetiva no saldo/fundo é regra financeira a definir
// (ver card MOR-054) e não é aplicada aqui — apenas a origem é registrada.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { X, Receipt, Paperclip, Info } from 'lucide-react';
import { toast } from 'sonner';

import {
  CATEGORIAS_DESPESA,
  ORIGEM_RECURSO_LABEL,
  validarNovaDespesa,
  type CategoriaDespesa,
  type OrigemRecurso,
  type NovaDespesaInput,
} from './despesas';

interface AdicionarDespesaModalProps {
  onClose: () => void;
  onCreate: (input: NovaDespesaInput) => void;
}

function hojeISO(): string {
  // Executa no navegador (componente client) — data local YYYY-MM-DD.
  return new Date().toLocaleDateString('en-CA');
}

export function AdicionarDespesaModal({ onClose, onCreate }: AdicionarDespesaModalProps) {
  const [categoria, setCategoria] = useState<CategoriaDespesa>('Manutenção');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(hojeISO());
  const [origemRecurso, setOrigemRecurso] = useState<OrigemRecurso>('saldo');
  const [comprovanteNome, setComprovanteNome] = useState<string | undefined>(undefined);

  const handleSubmit = () => {
    const input: NovaDespesaInput = {
      categoria,
      descricao,
      valor: Number(valor.replace(',', '.')),
      data,
      origemRecurso,
      comprovanteNome,
    };
    const erro = validarNovaDespesa(input);
    if (erro) {
      toast.error(erro);
      return;
    }
    onCreate(input);
    toast.success('Despesa registrada!', { description: 'Ela já aparece no histórico de transações.' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-blue-100 p-5 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-brand-deep to-brand-steel rounded-xl">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-blue-900 text-xl">Adicionar Despesa</h2>
              <p className="text-wave-400 text-sm">Registro financeiro do condomínio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-50 rounded-lg transition-colors" aria-label="Fechar">
            <X className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Categoria */}
          <div>
            <label htmlFor="desp-categoria" className="block text-wave-700 text-sm mb-1.5">Categoria *</label>
            <select
              id="desp-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaDespesa)}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {CATEGORIAS_DESPESA.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="desp-descricao" className="block text-wave-700 text-sm mb-1.5">Descrição *</label>
            <input
              id="desp-descricao"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Reparo da bomba d'água"
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Valor + Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="desp-valor" className="block text-wave-700 text-sm mb-1.5">Valor (R$) *</label>
              <input
                id="desp-valor"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label htmlFor="desp-data" className="block text-wave-700 text-sm mb-1.5">Data do pagamento *</label>
              <input
                id="desp-data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Origem do recurso */}
          <div>
            <label htmlFor="desp-origem" className="block text-wave-700 text-sm mb-1.5">Origem do recurso *</label>
            <select
              id="desp-origem"
              value={origemRecurso}
              onChange={(e) => setOrigemRecurso(e.target.value as OrigemRecurso)}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="saldo">{ORIGEM_RECURSO_LABEL.saldo}</option>
              <option value="fundo_reserva">{ORIGEM_RECURSO_LABEL.fundo_reserva}</option>
            </select>
            <p className="text-wave-400 text-xs mt-1.5">
              Padrão: saldo disponível. Use o Fundo de Reserva apenas em despesas extraordinárias
              ou autorizadas pela governança.
            </p>
          </div>

          {/* Comprovante */}
          <div>
            <label className="block text-wave-700 text-sm mb-1.5">Comprovante de pagamento</label>
            <label className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-dashed border-blue-300 rounded-xl text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors">
              <Paperclip className="w-4 h-4" />
              <span className="text-sm truncate">{comprovanteNome ?? 'Anexar arquivo (opcional)'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => setComprovanteNome(e.target.files?.[0]?.name)}
              />
            </label>
          </div>

          {/* Nota da regra financeira */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-blue-700 text-xs">
              A despesa entra no histórico com a origem informada. O desconto automático no saldo ou
              no Fundo de Reserva será aplicado quando a regra financeira for definida.
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="p-5 border-t border-wave-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-wave-100 text-wave-700 rounded-xl hover:bg-wave-200 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-deep to-brand-steel text-white hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            Registrar Despesa
          </button>
        </div>
      </div>
    </div>
  );
}
