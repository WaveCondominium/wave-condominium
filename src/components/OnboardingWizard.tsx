import { useState } from 'react';
import { Building2, CheckCircle, ArrowRight, ArrowLeft, Home, Shield, Wallet } from 'lucide-react';

import { toast } from 'sonner';

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  condominioNome: string;
  condominioEndereco: string;
  totalUnidades: number;
  valorTaxaPadrao: number;
  metaFundoReserva: number;
  administradorNome: string;
  administradorEmail: string;
  administradorTelefone: string;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    condominioNome: '',
    condominioEndereco: '',
    totalUnidades: 50,
    valorTaxaPadrao: 850,
    metaFundoReserva: 100000,
    administradorNome: '',
    administradorEmail: '',
    administradorTelefone: ''
  });

  const totalSteps = 4;

  const handleNext = () => {
    // Validação básica
    if (step === 1) {
      if (!data.condominioNome || !data.condominioEndereco) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }
    }
    
    if (step === 2) {
      if (data.totalUnidades < 1) {
        toast.error('O condomínio deve ter pelo menos 1 unidade');
        return;
      }
    }

    if (step === 3) {
      if (!data.administradorNome || !data.administradorEmail) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    toast.success('Configuração concluída!', {
      description: 'Bem-vindo à Wave! Sua plataforma está pronta.'
    });
    onComplete(data);
  };

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-wave-700 to-wave-500 z-50 overflow-y-auto">
      
      
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-wave-700 to-wave-500 rounded-2xl flex items-center justify-center">
                <Home className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-wave-800 text-3xl">Wave</h1>
            </div>
            <h2 className="text-wave-800 text-2xl mb-2">
              {step === 1 && 'Bem-vindo à Wave!'}
              {step === 2 && 'Configuração Financeira'}
              {step === 3 && 'Dados do Administrador'}
              {step === 4 && 'Tudo Pronto!'}
            </h2>
            <p className="text-wave-500">
              {step === 1 && 'Vamos configurar seu condomínio em poucos passos'}
              {step === 2 && 'Defina os valores e metas financeiras'}
              {step === 3 && 'Quem será o responsável pela gestão?'}
              {step === 4 && 'Revise as informações antes de finalizar'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    s <= step
                      ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white'
                      : 'bg-wave-100 text-wave-400'
                  }`}
                >
                  {s < step ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span>{s}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="h-2 bg-wave-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-wave-700 to-wave-500 transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Dados do Condomínio */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-wave-500" />
                <h3 className="text-wave-800 text-xl">Dados do Condomínio</h3>
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Nome do Condomínio *</label>
                <input
                  type="text"
                  value={data.condominioNome}
                  onChange={(e) => updateData('condominioNome', e.target.value)}
                  placeholder="Ex: Residencial Onda Azul"
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Endereço Completo *</label>
                <input
                  type="text"
                  value={data.condominioEndereco}
                  onChange={(e) => updateData('condominioEndereco', e.target.value)}
                  placeholder="Rua, número, bairro, cidade - UF"
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Total de Unidades *</label>
                <input
                  type="number"
                  value={data.totalUnidades}
                  onChange={(e) => updateData('totalUnidades', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
                <p className="text-wave-500 text-sm mt-2">Número total de apartamentos/casas no condomínio</p>
              </div>
            </div>
          )}

          {/* Step 2: Configuração Financeira */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="w-8 h-8 text-wave-500" />
                <h3 className="text-wave-800 text-xl">Configuração Financeira</h3>
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Valor da Taxa Condominial Padrão (R$) *</label>
                <input
                  type="number"
                  value={data.valorTaxaPadrao}
                  onChange={(e) => updateData('valorTaxaPadrao', parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
                <p className="text-wave-500 text-sm mt-2">
                  Valor médio mensal por unidade. Pode ser ajustado individualmente depois.
                </p>
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Meta do Fundo de Reserva (R$) *</label>
                <input
                  type="number"
                  value={data.metaFundoReserva}
                  onChange={(e) => updateData('metaFundoReserva', parseFloat(e.target.value))}
                  min="0"
                  step="1000"
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
                <p className="text-wave-500 text-sm mt-2">
                  Valor ideal para o fundo de reserva. Recomendado: 20-30% da receita anual.
                </p>
              </div>

              <div className="bg-wave-50 rounded-xl p-4">
                <p className="text-wave-800 mb-2">Previsão Mensal:</p>
                <p className="text-wave-500 text-sm">
                  Receita estimada: R$ {(data.totalUnidades * data.valorTaxaPadrao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-wave-500 text-sm">
                  Total de {data.totalUnidades} unidades × R$ {data.valorTaxaPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Dados do Administrador */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-8 h-8 text-wave-500" />
                <h3 className="text-wave-800 text-xl">Dados do Administrador</h3>
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={data.administradorNome}
                  onChange={(e) => updateData('administradorNome', e.target.value)}
                  placeholder="Nome do síndico ou administrador"
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
              </div>

              <div>
                <label className="block text-wave-800 mb-2">E-mail *</label>
                <input
                  type="email"
                  value={data.administradorEmail}
                  onChange={(e) => updateData('administradorEmail', e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Telefone (opcional)</label>
                <input
                  type="tel"
                  value={data.administradorTelefone}
                  onChange={(e) => updateData('administradorTelefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
              </div>
            </div>
          )}

          {/* Step 4: Revisão */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h3 className="text-wave-800 text-xl">Revisão Final</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-wave-50 rounded-xl p-4">
                  <h4 className="text-wave-800 mb-3">Dados do Condomínio</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-wave-500"><span className="text-wave-800">Nome:</span> {data.condominioNome}</p>
                    <p className="text-wave-500"><span className="text-wave-800">Endereço:</span> {data.condominioEndereco}</p>
                    <p className="text-wave-500"><span className="text-wave-800">Unidades:</span> {data.totalUnidades}</p>
                  </div>
                </div>

                <div className="bg-wave-50 rounded-xl p-4">
                  <h4 className="text-wave-800 mb-3">Configuração Financeira</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-wave-500">
                      <span className="text-wave-800">Taxa Padrão:</span> R$ {data.valorTaxaPadrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-wave-500">
                      <span className="text-wave-800">Meta Fundo de Reserva:</span> R$ {data.metaFundoReserva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-wave-500">
                      <span className="text-wave-800">Receita Mensal Estimada:</span> R$ {(data.totalUnidades * data.valorTaxaPadrao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="bg-wave-50 rounded-xl p-4">
                  <h4 className="text-wave-800 mb-3">Administrador</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-wave-500"><span className="text-wave-800">Nome:</span> {data.administradorNome}</p>
                    <p className="text-wave-500"><span className="text-wave-800">E-mail:</span> {data.administradorEmail}</p>
                    {data.administradorTelefone && (
                      <p className="text-wave-500"><span className="text-wave-800">Telefone:</span> {data.administradorTelefone}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-wave-700 to-wave-500 rounded-xl p-4 border border-wave-200">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-wave-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-wave-800 mb-2">Segurança e Transparência</h4>
                    <p className="text-wave-600 text-sm">
                      Todas as configurações e decisões importantes serão registradas automaticamente na rede Stellar, 
                      garantindo transparência total e auditabilidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-6 bg-wave-100 text-wave-600 rounded-xl hover:bg-wave-200 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-xl hover:from-wave-700 hover:to-wave-500 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {step === totalSteps ? 'Finalizar' : 'Próximo'}
              {step < totalSteps && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
