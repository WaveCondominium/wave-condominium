import { useState } from 'react';
import { X, Shield, Calendar, FileText, AlertTriangle, Camera, User, Building } from 'lucide-react';

interface InspectionOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  warranty: {
    id: string;
    system: string;
    type: string;
    supplier: string;
    endDate: string;
    daysRemaining: number;
  };
  onSubmit: (inspection: InspectionOrder) => void;
}

export interface InspectionOrder {
  id: string;
  warrantyId: string;
  system: string;
  supplier: string;
  warrantyEndDate: string;
  inspectionType: 'preventiva' | 'urgente';
  scheduledDate: string;
  responsible: string;
  observations: string;
  checklistItems: ChecklistItem[];
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  createdAt: string;
  photos?: string[];
}

interface ChecklistItem {
  id: string;
  description: string;
  checked: boolean;
  observation?: string;
}

export function InspectionOrderModal({ isOpen, onClose, warranty, onSubmit }: InspectionOrderModalProps) {
  const [inspectionType, setInspectionType] = useState<'preventiva' | 'urgente'>(
    warranty.daysRemaining <= 30 ? 'urgente' : 'preventiva'
  );
  const [scheduledDate, setScheduledDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [observations, setObservations] = useState(
    `Vistoria de garantia - ${warranty.system}\nFornecedor: ${warranty.supplier}\nVencimento da garantia: ${warranty.endDate}\nDias restantes: ${warranty.daysRemaining}`
  );

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: '1', description: 'Verificar condições gerais do sistema', checked: false },
    { id: '2', description: 'Documentação da garantia está em dia', checked: false },
    { id: '3', description: 'Não há sinais de desgaste anormal', checked: false },
    { id: '4', description: 'Funcionamento conforme especificações', checked: false },
    { id: '5', description: 'Realizar testes de segurança', checked: false },
    { id: '6', description: 'Fotografar estado atual', checked: false },
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!scheduledDate || !responsible) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const newInspection: InspectionOrder = {
      id: Date.now().toString(),
      warrantyId: warranty.id,
      system: warranty.system,
      supplier: warranty.supplier,
      warrantyEndDate: warranty.endDate,
      inspectionType,
      scheduledDate,
      responsible,
      observations,
      checklistItems,
      status: 'agendada',
      createdAt: new Date().toISOString(),
    };

    onSubmit(newInspection);
    onClose();
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addChecklistItem = () => {
    const description = prompt('Digite a descrição do item:');
    if (description) {
      setChecklistItems([
        ...checklistItems,
        {
          id: Date.now().toString(),
          description,
          checked: false
        }
      ]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-wave-50 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h2 className="text-2xl">Nova OS de Vistoria</h2>
              <p className="text-blue-100 text-sm">Garantia: {warranty.system}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alert */}
          {warranty.daysRemaining <= 30 && (
            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-900 mb-1">Atenção: Garantia Próxima do Vencimento!</h4>
                <p className="text-red-700 text-sm">
                  Restam apenas <strong>{warranty.daysRemaining} dias</strong> até o vencimento.
                  Agende a vistoria com urgência!
                </p>
              </div>
            </div>
          )}

          {/* Warranty Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 p-4">
            <h3 className="text-blue-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações da Garantia
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-600">Sistema:</span>
                <p className="text-blue-900">{warranty.system}</p>
              </div>
              <div>
                <span className="text-blue-600">Tipo:</span>
                <p className="text-blue-900">{warranty.type}</p>
              </div>
              <div>
                <span className="text-blue-600">Fornecedor:</span>
                <p className="text-blue-900">{warranty.supplier}</p>
              </div>
              <div>
                <span className="text-blue-600">Vencimento:</span>
                <p className="text-blue-900">{warranty.endDate}</p>
              </div>
            </div>
          </div>

          {/* Inspection Type */}
          <div>
            <label className="block text-blue-900 mb-2">
              Tipo de Vistoria <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInspectionType('preventiva')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  inspectionType === 'preventiva'
                    ? 'border-blue-500 bg-blue-100 shadow-lg'
                    : 'border-blue-200 bg-white/80 hover:border-blue-300'
                }`}
              >
                <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-900">Preventiva</p>
                <p className="text-blue-600 text-xs">Vistoria de rotina</p>
              </button>

              <button
                type="button"
                onClick={() => setInspectionType('urgente')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  inspectionType === 'urgente'
                    ? 'border-red-500 bg-red-100 shadow-lg'
                    : 'border-blue-200 bg-white/80 hover:border-blue-300'
                }`}
              >
                <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-blue-900">Urgente</p>
                <p className="text-blue-600 text-xs">Garantia vencendo</p>
              </button>
            </div>
          </div>

          {/* Scheduled Date */}
          <div>
            <label className="block text-blue-900 mb-2">
              Data Agendada <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={warranty.endDate}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none bg-white/80"
              />
            </div>
            <p className="text-blue-600 text-xs mt-1">
              A vistoria deve ser realizada antes de {warranty.endDate}
            </p>
          </div>

          {/* Responsible */}
          <div>
            <label className="block text-blue-900 mb-2">
              Responsável pela Vistoria <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Nome do responsável ou empresa"
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none bg-white/80"
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-blue-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Checklist de Vistoria
              </label>
              <button
                type="button"
                onClick={addChecklistItem}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all text-sm"
              >
                + Adicionar Item
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 p-4 space-y-2">
              {checklistItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-3 p-3 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-1 w-5 h-5 text-blue-600 rounded border-blue-300 focus:ring-blue-500"
                  />
                  <span className={`text-sm flex-1 ${item.checked ? 'text-blue-600 line-through' : 'text-blue-900'}`}>
                    {item.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-blue-900 mb-2">Observações</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:outline-none bg-white/80 resize-none"
              placeholder="Detalhes adicionais sobre a vistoria..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl p-4 border border-cyan-200">
            <div className="flex items-start gap-3">
              <Camera className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="text-cyan-900 mb-1">💡 Dica Importante</h4>
                <p className="text-cyan-700">
                  Durante a vistoria, tire fotos do estado atual do sistema. Isso será importante
                  para comprovar as condições em caso de acionamento da garantia.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-blue-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-wave-500 text-white rounded-xl hover:hover:bg-wave-600 transition-all shadow-lg"
            >
              Criar OS de Vistoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
