'use client';

import { useState } from 'react';
import { X, CheckCircle, Loader, ExternalLink, ArrowRight, AlertCircle, Shield, RefreshCw, CreditCard, Smartphone, FileText } from 'lucide-react';
import { pagarBoletoViaStellar } from '@/app/actions/payment';

interface PagamentoStellarModalProps {
  boleto: {
    id: string;
    amount: number;
    unitNumber: string;
    referenceMonth: string;
    description: string;
    barcode: string;
  };
  payerName: string;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

type Step = 'method' | 'confirm' | 'processing' | 'success' | 'error';
type PayMethod = 'pix' | 'card' | 'boleto';

interface StepState {
  onramp: 'idle' | 'loading' | 'done' | 'error';
  settlement: 'idle' | 'loading' | 'done' | 'error';
  anchor: 'idle' | 'loading' | 'done' | 'error';
}

export function PagamentoStellarModal({
  boleto,
  payerName,
  onClose,
  onSuccess,
}: PagamentoStellarModalProps) {
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<PayMethod>('pix');
  const [steps, setSteps] = useState<StepState>({ onramp: 'idle', settlement: 'idle', anchor: 'idle' });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  // QR Code Pix simulado
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136${boleto.id}@wave.com.br5204000053039865406${boleto.amount.toFixed(2).replace('.', '')}5802BR5913Wave Condominios6008Sao Paulo62070503***6304`;

  async function handlePagar(isRetry = false) {
    setStep('processing');
    setError('');
    if (!isRetry) {
      setSteps({ onramp: 'idle', settlement: 'idle', anchor: 'idle' });
    }

    // Etapa 1 — On-ramp / processamento do método de pagamento
    setSteps(s => ({ ...s, onramp: 'loading' }));
    await delay(method === 'pix' ? 1500 : method === 'card' ? 2000 : 3000);
    setSteps(s => ({ ...s, onramp: 'done', settlement: 'loading' }));

    try {
      // Etapa 2 — Liquidação via Stellar (Server Action real)
      const res = await pagarBoletoViaStellar({
        boletoId: boleto.id,
        brlAmount: boleto.amount,
        unitNumber: boleto.unitNumber,
        referenceMonth: boleto.referenceMonth,
        payerName,
      });

      if (!res.success) {
        setSteps(s => ({ ...s, settlement: 'error' }));
        setError(res.error ?? 'Erro ao processar na rede Stellar.');
        setStep('error');
        return;
      }

      setSteps(s => ({ ...s, settlement: 'done', anchor: 'loading' }));
      await delay(800);
      setSteps(s => ({ ...s, anchor: res.receipt ? 'done' : 'error' }));

      setResult(res);
      setStep('success');
      onSuccess(res);
    } catch (err: any) {
      setSteps(s => ({ ...s, settlement: 'error' }));
      setError(err?.message ?? 'Erro inesperado. Verifique sua conexão.');
      setStep('error');
    }
  }

  async function handleRetry() {
    if (retryCount >= MAX_RETRIES) {
      setError('Número máximo de tentativas atingido. Entre em contato com a administração.');
      return;
    }
    setRetryCount(r => r + 1);
    await handlePagar(true);
  }

  const methodLabels: Record<PayMethod, string> = {
    pix: 'Pix',
    card: 'Cartão de Crédito',
    boleto: 'Boleto Bancário',
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-wave-100 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-wave-100">
          <div>
            <p className="text-wave-400 text-xs italic font-serif">Pagamento protegido</p>
            <h2 className="font-serif text-xl text-wave-800 font-normal">
              {step === 'method' ? 'Escolha a forma de pagamento' :
               step === 'confirm' ? 'Confirmar pagamento' :
               step === 'processing' ? 'Processando...' :
               step === 'success' ? 'Pagamento confirmado' : 'Falha no pagamento'}
            </h2>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} className="p-2 hover:bg-wave-50 rounded-lg transition-colors">
              <X className="w-5 h-5 text-wave-400" />
            </button>
          )}
        </div>

        {/* TELA: Escolha do método */}
        {step === 'method' && (
          <div className="p-6 space-y-4">
            <div className="bg-wave-50 rounded-xl p-4 flex justify-between items-center mb-2">
              <span className="text-wave-500 text-sm">Valor a pagar</span>
              <span className="font-serif text-2xl text-wave-800">R$ {boleto.amount.toFixed(2).replace('.', ',')}</span>
            </div>

            <p className="text-wave-500 text-sm">Referência: {boleto.referenceMonth} · Unidade {boleto.unitNumber}</p>

            <div className="space-y-3">
              {([
                { key: 'pix', icon: Smartphone, label: 'Pix', desc: 'Pagamento instantâneo • Aprovação imediata' },
                { key: 'card', icon: CreditCard, label: 'Cartão de Crédito', desc: 'Débito ou crédito • Parcele em até 12x' },
                { key: 'boleto', icon: FileText, label: 'Boleto Bancário', desc: 'Vencimento em 3 dias úteis' },
              ] as const).map(m => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    method === m.key ? 'border-wave-500 bg-wave-50' : 'border-wave-100 hover:border-wave-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    method === m.key ? 'bg-wave-500 text-white' : 'bg-wave-100 text-wave-500'
                  }`}>
                    <m.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-wave-800 font-medium text-sm">{m.label}</p>
                    <p className="text-wave-400 text-xs">{m.desc}</p>
                  </div>
                  {method === m.key && <CheckCircle className="w-5 h-5 text-wave-500 ml-auto" />}
                </button>
              ))}
            </div>

            {/* PIX QR Code preview */}
            {method === 'pix' && (
              <div className="bg-wave-50 rounded-xl p-4 text-center">
                <div className="w-32 h-32 bg-white border-2 border-wave-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  {/* QR Code simulado com padrão visual */}
                  <div className="grid grid-cols-5 gap-0.5">
                    {Array.from({ length: 25 }, (_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-sm ${
                        [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,6,7,8,11,12,13,16,17,18].includes(i)
                          ? 'bg-wave-800' : 'bg-white'
                      }`} />
                    ))}
                  </div>
                </div>
                <p className="text-wave-600 text-xs mb-2">Escaneie o QR Code no seu banco</p>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(pixCode);
                  }}
                  className="text-wave-500 text-xs underline"
                >
                  Copiar código Pix
                </button>
              </div>
            )}

            <button
              onClick={() => setStep('confirm')}
              className="w-full py-3 bg-wave-800 text-white rounded-xl hover:bg-wave-700 transition-colors font-serif flex items-center justify-center gap-2"
            >
              Continuar com {methodLabels[method]}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TELA: Confirmação */}
        {step === 'confirm' && (
          <div className="p-6 space-y-5">
            <div className="bg-wave-50 rounded-xl p-4 space-y-2">
              <p className="text-wave-500 text-xs uppercase tracking-wide mb-3">Resumo do pagamento</p>
              {[
                { label: 'Unidade', value: boleto.unitNumber },
                { label: 'Referência', value: boleto.referenceMonth },
                { label: 'Descrição', value: boleto.description },
                { label: 'Forma de pagamento', value: methodLabels[method] },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-wave-400">{r.label}</span>
                  <span className="text-wave-700">{r.value}</span>
                </div>
              ))}
              <div className="border-t border-wave-100 pt-2 mt-2 flex justify-between">
                <span className="text-wave-600 text-sm font-medium">Total</span>
                <span className="font-serif text-xl text-wave-800">R$ {boleto.amount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-emerald-700 text-xs">
                Pagamento protegido. O comprovante será registrado automaticamente com verificação de autenticidade.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('method')} className="flex-1 py-3 bg-wave-50 border border-wave-200 text-wave-600 rounded-xl text-sm">
                Voltar
              </button>
              <button
                onClick={() => handlePagar()}
                className="flex-1 py-3 bg-wave-800 text-white rounded-xl hover:bg-wave-700 transition-colors font-serif flex items-center justify-center gap-2"
              >
                Confirmar pagamento
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TELA: Processando */}
        {step === 'processing' && (
          <div className="p-6 space-y-4">
            <p className="text-wave-400 text-sm text-center mb-2 font-serif italic">
              {method === 'pix' ? 'Confirmando Pix...' : method === 'card' ? 'Processando cartão...' : 'Aguardando compensação...'}
            </p>
            <StepRow number={1} label={
              method === 'pix' ? 'Confirmação do Pix' :
              method === 'card' ? 'Autorização do cartão' : 'Processamento do boleto'
            } sublabel="Via gateway de pagamento" state={steps.onramp} />
            <StepRow number={2} label="Registro interno de liquidação" sublabel="Processamento seguro da plataforma" state={steps.settlement} />
            <StepRow number={3} label="Emissão do comprovante verificável" sublabel="Prova de autenticidade imutável" state={steps.anchor} />
          </div>
        )}

        {/* TELA: Sucesso */}
        {step === 'success' && result && (
          <div className="p-6 space-y-4">
            <div className="text-center mb-2">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-serif text-lg text-wave-800">Pagamento confirmado!</h3>
              <p className="text-wave-400 text-sm mt-1">
                {new Date().toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="bg-wave-50 rounded-xl p-4 space-y-2">
              <p className="text-wave-500 text-xs uppercase tracking-wide mb-2">Comprovante</p>
              <div className="flex justify-between text-sm">
                <span className="text-wave-400">Valor pago</span>
                <span className="text-wave-700 font-medium">R$ {boleto.amount.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-wave-400">Forma</span>
                <span className="text-wave-700">{methodLabels[method]}</span>
              </div>

              {result.settlement?.stellarTxHash && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-wave-400">ID da transação</span>
                  <span className="text-wave-700 font-mono text-xs">
                    {result.settlement.stellarTxHash.slice(0, 10)}...
                  </span>
                </div>
              )}
            </div>

            {/* Link verificável na Stellar — visível apenas no painel de auditoria, aqui mostramos de forma amigável */}
            {result.settlement?.explorerUrl && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 text-xs font-medium">Comprovante gerado</span>
                  </div>
<span className="text-emerald-600 text-xs">✓ Autenticado</span>
                </div>
                <p className="text-emerald-600 text-xs mt-1 font-mono break-all">
                  {result.settlement.stellarTxHash?.slice(0, 32)}...
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-wave-800 text-white rounded-xl hover:bg-wave-700 transition-colors text-sm"
            >
              Fechar
            </button>
          </div>
        )}

        {/* TELA: Erro com retry */}
        {step === 'error' && (
          <div className="p-6 space-y-4">
            <div className="text-center mb-2">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="font-serif text-lg text-wave-800">Falha no pagamento</h3>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm">{error || 'Ocorreu um erro ao processar o pagamento.'}</p>
            </div>

            {retryCount < MAX_RETRIES && (
              <p className="text-wave-400 text-xs text-center">
                Tentativa {retryCount + 1} de {MAX_RETRIES + 1}
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-wave-50 border border-wave-200 text-wave-600 rounded-xl text-sm">
                Cancelar
              </button>
              {retryCount < MAX_RETRIES && (
                <button
                  onClick={handleRetry}
                  className="flex-1 py-2.5 bg-wave-800 text-white rounded-xl hover:bg-wave-700 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepRow({ number, label, sublabel, state }: {
  number: number; label: string; sublabel: string;
  state: 'idle' | 'loading' | 'done' | 'error';
}) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
      state === 'done'    ? 'bg-emerald-50 border-emerald-200' :
      state === 'loading' ? 'bg-wave-50 border-wave-200' :
      state === 'error'   ? 'bg-red-50 border-red-200' : 'bg-white border-wave-100'
    }`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        state === 'done'    ? 'bg-emerald-100' :
        state === 'loading' ? 'bg-wave-100' :
        state === 'error'   ? 'bg-red-100' : 'bg-wave-50'
      }`}>
        {state === 'done'    && <CheckCircle className="w-5 h-5 text-emerald-500" />}
        {state === 'loading' && <Loader className="w-5 h-5 text-wave-500 animate-spin" />}
        {state === 'error'   && <AlertCircle className="w-5 h-5 text-red-400" />}
        {state === 'idle'    && <span className="text-wave-400 text-sm font-serif">{number}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          state === 'done' ? 'text-emerald-700' : state === 'loading' ? 'text-wave-700' :
          state === 'error' ? 'text-red-600' : 'text-wave-400'
        }`}>{label}</p>
        <p className="text-xs text-wave-400 italic font-serif">{sublabel}</p>
      </div>
      {state === 'done' && <span className="text-emerald-600 text-xs font-medium">✓</span>}
    </div>
  );
}

function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }
