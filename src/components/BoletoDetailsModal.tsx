import { X, Receipt, DollarSign, CheckCircle, Download, Copy, ExternalLink, Barcode } from 'lucide-react';

interface Boleto {
  id: string;
  unitNumber: string;
  unitOwner: string;
  referenceMonth: string;
  dueDate: string;
  amount: number;
  barcode: string;
  status: string;
  issuedAt: string;
  issuedBy: string;
  paidAt?: string;
  compensatedAt?: string;
  blockchainHash?: string;
  blockchainRegisteredAt?: string;
  description: string;
  details: {
    condominiumFee: number;
    waterFee: number;
    reserveFund: number;
    otherFees: number;
  };
}

interface BoletoDetailsModalProps {
  boleto: Boleto;
  onClose: () => void;
  onSimulatePayment?: (boletoId: string) => void;
  onSimulateCompensation?: (boletoId: string) => void;
  canSimulatePayment?: boolean;
  canSimulateCompensation?: boolean;
}

export function BoletoDetailsModal({ 
  boleto, 
  onClose, 
  onSimulatePayment,
  onSimulateCompensation,
  canSimulatePayment,
  canSimulateCompensation
}: BoletoDetailsModalProps) {
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copiado para a área de transferência!');
  };

  const downloadPDF = () => {
    alert('📄 Em produção, aqui seria gerado um PDF do boleto para download.');
  };

  return (
    <div className="fixed inset-0 bg-wave-800/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-wave-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-wave-700 to-wave-500 rounded-xl">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-wave-800 text-2xl">Detalhes do Boleto</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-wave-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-wave-500" />
          </button>
        </div>

        {/* Boleto Visual */}
        <div className="bg-gradient-to-br from-wave-700 to-wave-500 rounded-2xl p-6 border-2 border-wave-200 mb-6">
          <div className="bg-white rounded-xl p-6 border-2 border-dashed border-wave-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-wave-200">
              <div>
                <h3 className="text-wave-800 text-xl">Wave Condomínio</h3>
                <p className="text-wave-500 text-sm">Gestão Stellar</p>
              </div>
              <div className="text-right">
                <p className="text-wave-500 text-sm">Boleto Nº</p>
                <p className="text-wave-800">{boleto.id}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-wave-500 text-sm mb-1">Unidade</p>
                <p className="text-wave-800">{boleto.unitNumber}</p>
              </div>
              <div>
                <p className="text-wave-500 text-sm mb-1">Proprietário</p>
                <p className="text-wave-800">{boleto.unitOwner}</p>
              </div>
              <div>
                <p className="text-wave-500 text-sm mb-1">Referência</p>
                <p className="text-wave-800">
                  {new Date(boleto.referenceMonth + '-01').toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div>
                <p className="text-wave-500 text-sm mb-1">Vencimento</p>
                <p className="text-wave-800">
                  {new Date(boleto.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Detalhamento */}
            <div className="bg-wave-50 rounded-xl p-4 mb-6">
              <h4 className="text-wave-800 mb-3">Detalhamento</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-wave-600">Taxa de Condomínio</span>
                  <span className="text-wave-800">
                    R$ {boleto.details.condominiumFee.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-wave-600">Água</span>
                  <span className="text-wave-800">
                    R$ {boleto.details.waterFee.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-wave-600">Fundo de Reserva</span>
                  <span className="text-wave-800">
                    R$ {boleto.details.reserveFund.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-wave-600">Outras Taxas</span>
                  <span className="text-wave-800">
                    R$ {boleto.details.otherFees.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="flex justify-between pt-3 mt-3 border-t-2 border-wave-200">
                  <span className="text-wave-800">Valor Total</span>
                  <span className="text-wave-800 text-2xl">
                    R$ {boleto.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>

            {/* Código de Barras */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Barcode className="w-4 h-4 text-wave-500" />
                <p className="text-wave-500 text-sm">Código de Barras</p>
              </div>
              <div className="bg-white border-2 border-wave-200 rounded-lg p-3 flex items-center justify-between">
                <p className="text-wave-800 font-mono text-sm">{boleto.barcode}</p>
                <button
                  onClick={() => copyToClipboard(boleto.barcode)}
                  className="p-2 bg-wave-100 hover:bg-wave-200 rounded-lg transition-colors"
                  title="Copiar código de barras"
                >
                  <Copy className="w-4 h-4 text-wave-500" />
                </button>
              </div>
            </div>

            {/* Barcode Visual Simulation */}
            <div className="bg-white rounded-lg p-4 flex items-center justify-center">
              <div className="flex gap-[2px]">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-wave-800"
                    style={{
                      width: Math.random() > 0.5 ? '3px' : '2px',
                      height: '60px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-wave-50 rounded-xl p-6 mb-6">
          <h4 className="text-wave-800 mb-4">Histórico de Status</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-wave-500 rounded-full">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-wave-800">Boleto Emitido</p>
                <p className="text-wave-500 text-sm">
                  {new Date(boleto.issuedAt).toLocaleDateString('pt-BR')} por {boleto.issuedBy}
                </p>
              </div>
            </div>

            {boleto.paidAt && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500 rounded-full">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-wave-800">Pagamento Realizado</p>
                  <p className="text-wave-500 text-sm">
                    {new Date(boleto.paidAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            {boleto.compensatedAt && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500 rounded-full">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-wave-800">Compensação Bancária</p>
                  <p className="text-wave-500 text-sm">
                    {new Date(boleto.compensatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}

            {boleto.blockchainHash && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-r from-wave-700 to-wave-500 rounded-full">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-wave-800">Registrado na Stellar</p>
                  <p className="text-wave-500 text-sm mb-2">
                    {boleto.blockchainRegisteredAt && new Date(boleto.blockchainRegisteredAt).toLocaleString('pt-BR')}
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-wave-200">
                    <p className="text-wave-500 text-xs mb-1">Transaction Hash:</p>
                    <div className="flex items-center gap-2">
                      <p className="text-wave-800 text-xs font-mono break-all flex-1">
                        {boleto.blockchainHash}
                      </p>
                      <button
                        onClick={() => copyToClipboard(boleto.blockchainHash!)}
                        className="p-1 bg-wave-100 hover:bg-wave-200 rounded transition-colors shrink-0"
                      >
                        <Copy className="w-3 h-3 text-wave-500" />
                      </button>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${boleto.blockchainHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-wave-500 hover:text-wave-600 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver no Stellar Expert
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={downloadPDF}
            className="flex-1 py-3 bg-wave-100 text-wave-600 rounded-xl hover:bg-wave-200 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Baixar PDF
          </button>

          {canSimulatePayment && onSimulatePayment && (
            <button
              onClick={() => {
                onSimulatePayment(boleto.id);
                onClose();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Simular Pagamento
            </button>
          )}

          {canSimulateCompensation && onSimulateCompensation && (
            <button
              onClick={() => {
                onSimulateCompensation(boleto.id);
                onClose();
              }}
              className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Simular Compensação
            </button>
          )}
        </div>

        {boleto.status === 'pending' && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-orange-700 text-sm">
              💡 <strong>Dica:</strong> Use o código de barras ou código numérico para pagar via app do banco.
              Após a compensação (1-2 dias úteis), o pagamento será automaticamente registrado na rede Stellar.
            </p>
          </div>
        )}

        {boleto.blockchainHash && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 text-sm">
              ✅ <strong>Pagamento Confirmado:</strong> Este pagamento está registrado de forma imutável na rede Stellar,
              garantindo transparência e auditabilidade permanente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
