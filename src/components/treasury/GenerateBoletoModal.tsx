import { useState, useEffect } from 'react';
import { X, Receipt, Calendar, DollarSign, Users, Building2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface Unit {
  number: string;
  owner: string;
}

interface GenerateBoletoModalProps {
  onClose: () => void;
  onGenerate: (data: {
    mode: 'single' | 'batch';
    referenceMonth: string;
    dueDate: string;
    units: Array<{
      unitNumber: string;
      unitOwner: string;
      amount: number;
      details: {
        condominiumFee: number;
        waterFee: number;
        reserveFund: number;
        otherFees: number;
      };
    }>;
  }) => void;
}

// Mock data de unidades - em produção virá do backend
const MOCK_UNITS: Unit[] = [
  { number: '101', owner: 'Maria Silva' },
  { number: '102', owner: 'João Santos' },
  { number: '103', owner: 'Ana Costa' },
  { number: '201', owner: 'Pedro Oliveira' },
  { number: '202', owner: 'Carla Mendes' },
  { number: '203', owner: 'Lucas Ferreira' },
  { number: '301', owner: 'Juliana Lima' },
  { number: '302', owner: 'Roberto Alves' },
];

export function GenerateBoletoModal({ onClose, onGenerate }: GenerateBoletoModalProps) {
  const [mode, setMode] = useState<'single' | 'batch'>('batch');
  const [referenceMonth, setReferenceMonth] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  
  // Valores padrão do boleto
  const [condominiumFee, setCondominiumFee] = useState(650.00);
  const [waterFee, setWaterFee] = useState(120.00);
  const [reserveFund, setReserveFund] = useState(50.00);
  const [otherFees, setOtherFees] = useState(30.00);

  const totalAmount = condominiumFee + waterFee + reserveFund + otherFees;

  // Inicializar com todas as unidades selecionadas no modo lote
  useEffect(() => {
    if (mode === 'batch') {
      setSelectedUnits(MOCK_UNITS.map(u => u.number));
    } else {
      setSelectedUnits([]);
    }
  }, [mode]);

  const toggleUnit = (unitNumber: string) => {
    if (selectedUnits.includes(unitNumber)) {
      setSelectedUnits(selectedUnits.filter(u => u !== unitNumber));
    } else {
      setSelectedUnits([...selectedUnits, unitNumber]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!referenceMonth || !dueDate) {
      alert('Por favor, preencha o mês de referência e data de vencimento');
      return;
    }

    if (totalAmount <= 0) {
      alert('O valor total deve ser maior que zero');
      return;
    }

    if (mode === 'single' && !selectedUnit) {
      alert('Por favor, selecione uma unidade');
      return;
    }

    if (mode === 'batch' && selectedUnits.length === 0) {
      alert('Por favor, selecione pelo menos uma unidade');
      return;
    }

    const unitsToGenerate = mode === 'single' 
      ? [selectedUnit] 
      : selectedUnits;

    const units = unitsToGenerate.map(unitNumber => {
      const unit = MOCK_UNITS.find(u => u.number === unitNumber);
      return {
        unitNumber,
        unitOwner: unit?.owner || 'Proprietário',
        amount: totalAmount,
        details: {
          condominiumFee,
          waterFee,
          reserveFund,
          otherFees
        }
      };
    });

    onGenerate({
      mode,
      referenceMonth,
      dueDate,
      units
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wave-500 rounded-xl">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-blue-900 text-2xl">Gerar Boletos</h2>
              <p className="text-blue-600 text-sm">Emita boletos para uma ou mais unidades</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Modo de Geração */}
          <div>
            <label className="block text-blue-900 mb-3">Modo de Geração</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('batch')}
                className={`p-4 border-2 rounded-xl transition-all flex items-center gap-3 ${
                  mode === 'batch'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-blue-200 hover:border-blue-300'
                }`}
              >
                <Users className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <p className="text-blue-900">Lote</p>
                  <p className="text-blue-600 text-sm">Múltiplas unidades</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('single')}
                className={`p-4 border-2 rounded-xl transition-all flex items-center gap-3 ${
                  mode === 'single'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-blue-200 hover:border-blue-300'
                }`}
              >
                <Building2 className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <p className="text-blue-900">Individual</p>
                  <p className="text-blue-600 text-sm">Uma unidade específica</p>
                </div>
              </button>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mês de Referência <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                value={referenceMonth}
                onChange={(e) => setReferenceMonth(e.target.value)}
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
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Seleção de Unidades */}
          {mode === 'single' ? (
            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Selecionar Unidade <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                required
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Escolha uma unidade...</option>
                {MOCK_UNITS.map(unit => (
                  <option key={unit.number} value={unit.number}>
                    Unidade {unit.number} - {unit.owner}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Selecionar Unidades ({selectedUnits.length}/{MOCK_UNITS.length})
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {MOCK_UNITS.map(unit => (
                    <label
                      key={unit.number}
                      className="flex items-center gap-2 p-2 hover:bg-blue-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUnits.includes(unit.number)}
                        onChange={() => toggleUnit(unit.number)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-400"
                      />
                      <span className="text-blue-900 text-sm">
                        {unit.number} - {unit.owner}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUnits(MOCK_UNITS.map(u => u.number))}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Selecionar Todas
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUnits([])}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Limpar Seleção
                </Button>
              </div>
            </div>
          )}

          {/* Composição do Valor */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-blue-900 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Composição do Boleto
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-blue-700 text-sm mb-1">Taxa de Condomínio</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={condominiumFee}
                  onChange={(e) => setCondominiumFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-blue-700 text-sm mb-1">Água</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={waterFee}
                  onChange={(e) => setWaterFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-blue-700 text-sm mb-1">Fundo de Reserva</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={reserveFund}
                  onChange={(e) => setReserveFund(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-blue-700 text-sm mb-1">Outras Taxas</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={otherFees}
                  onChange={(e) => setOtherFees(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="pt-3 mt-3 border-t-2 border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-900">Valor Total por Boleto:</span>
                <span className="text-blue-900 text-2xl">
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>
              {mode === 'batch' && selectedUnits.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-blue-700 text-sm">Total Geral ({selectedUnits.length} boletos):</span>
                  <span className="text-blue-700 text-lg">
                    R$ {(totalAmount * selectedUnits.length).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-cyan-900 mb-2">Processo Automático</h4>
                <ul className="text-cyan-700 text-sm space-y-1 list-disc list-inside">
                  <li>Boletos serão gerados com código de barras único</li>
                  <li>Moradores receberão notificação automática</li>
                  <li>Após compensação bancária (1-2 dias úteis)</li>
                  <li>Pagamentos serão registrados automaticamente na rede Stellar</li>
                  <li>Hash de comprovação será gerado para auditoria</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 py-6 text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 py-6 bg-wave-500 text-white hover:hover:bg-wave-600 shadow-lg"
            >
              {mode === 'batch' 
                ? `Gerar ${selectedUnits.length} Boleto${selectedUnits.length !== 1 ? 's' : ''}`
                : 'Gerar Boleto'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
