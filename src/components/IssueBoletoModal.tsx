import { useState } from 'react';
import { X, Receipt, Calendar, DollarSign, Home, User } from 'lucide-react';

interface IssueBoletoModalProps {
  onClose: () => void;
  onIssue: (boleto: {
    unitNumber: string;
    unitOwner: string;
    referenceMonth: string;
    dueDate: string;
    amount: number;
    description: string;
    details: {
      condominiumFee: number;
      waterFee: number;
      reserveFund: number;
      otherFees: number;
    };
  }) => void;
}

export function IssueBoletoModal({ onClose, onIssue }: IssueBoletoModalProps) {
  const [formData, setFormData] = useState({
    unitNumber: '',
    unitOwner: '',
    referenceMonth: '',
    dueDate: '',
    condominiumFee: 0,
    waterFee: 0,
    reserveFund: 0,
    otherFees: 0
  });

  const totalAmount = 
    formData.condominiumFee + 
    formData.waterFee + 
    formData.reserveFund + 
    formData.otherFees;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.unitNumber || !formData.unitOwner || !formData.referenceMonth || !formData.dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (totalAmount <= 0) {
      alert('O valor total deve ser maior que zero');
      return;
    }

    const monthYear = new Date(formData.referenceMonth + '-01').toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });

    onIssue({
      unitNumber: formData.unitNumber,
      unitOwner: formData.unitOwner,
      referenceMonth: formData.referenceMonth,
      dueDate: formData.dueDate,
      amount: totalAmount,
      description: `Taxa condominial - ${monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}`,
      details: {
        condominiumFee: formData.condominiumFee,
        waterFee: formData.waterFee,
        reserveFund: formData.reserveFund,
        otherFees: formData.otherFees
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wave-400 rounded-xl">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-blue-900 text-2xl">Emitir Novo Boleto</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Unidade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                placeholder="Ex: 101"
                required
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Proprietário <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.unitOwner}
                onChange={(e) => setFormData({ ...formData, unitOwner: e.target.value })}
                placeholder="Ex: Maria Silva"
                required
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mês de Referência <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={formData.referenceMonth}
                onChange={(e) => setFormData({ ...formData, referenceMonth: e.target.value })}
                required
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data de Vencimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-blue-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Composição do Boleto
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-blue-700 text-sm mb-1">Taxa de Condomínio</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.condominiumFee}
                  onChange={(e) => setFormData({ ...formData, condominiumFee: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-blue-700 text-sm mb-1">Água</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.waterFee}
                  onChange={(e) => setFormData({ ...formData, waterFee: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-blue-700 text-sm mb-1">Fundo de Reserva</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.reserveFund}
                  onChange={(e) => setFormData({ ...formData, reserveFund: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-blue-700 text-sm mb-1">Outras Taxas</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.otherFees}
                  onChange={(e) => setFormData({ ...formData, otherFees: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="pt-3 border-t-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-900">Valor Total:</span>
                  <span className="text-blue-900 text-2xl">
                    R$ {totalAmount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
            <h4 className="text-cyan-900 mb-2">📋 O que acontece após emissão:</h4>
            <ol className="text-cyan-700 text-sm space-y-1 list-decimal list-inside">
              <li>Boleto será gerado com código de barras</li>
              <li>Morador poderá visualizar e pagar via app</li>
              <li>Após compensação bancária (1-2 dias)</li>
              <li>Pagamento será registrado AUTOMATICAMENTE na rede Stellar</li>
              <li>Hash de comprovação será gerado e armazenado</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-wave-500 text-white rounded-xl hover:hover:bg-wave-600 transition-all shadow-lg"
            >
              Emitir Boleto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
