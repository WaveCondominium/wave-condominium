'use client';

import { useState } from 'react';
import { X, Upload, FileText, DollarSign, User, Phone, Mail, Building2, CheckCircle, AlertCircle } from 'lucide-react';

interface ServiceProvider {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  proposedValue: number;
  timeline: string;
  description: string;
  attachments: string[];
  submittedDate: string;
}

interface ProposalCollectionModalProps {
  projectId: string;
  project: any;
  onClose: () => void;
  onUpdate: (project: any) => void;
  availableBudget: number;
}

export function ProposalCollectionModal({ 
  projectId, 
  project,
  onClose, 
  onUpdate,
  availableBudget 
}: ProposalCollectionModalProps) {
  const [proposals, setProposals] = useState<ServiceProvider[]>([
    // Exemplos pré-carregados para demonstração
    ...(project.id === '2' ? [
      {
        id: '1',
        companyName: 'Security Tech Ltda',
        contactName: 'Carlos Silva',
        email: 'carlos@securitytech.com',
        phone: '(11) 98765-4321',
        proposedValue: 85000,
        timeline: '45 dias',
        description: 'Sistema completo com 32 câmeras 4K, DVR, controle de acesso biométrico',
        attachments: ['proposta_securitytech.pdf', 'catalogo_cameras.pdf'],
        submittedDate: '02/12/2025'
      },
      {
        id: '2',
        companyName: 'Vigiltec Soluções',
        contactName: 'Ana Paula',
        email: 'ana@vigiltec.com.br',
        phone: '(11) 97654-3210',
        proposedValue: 92000,
        timeline: '60 dias',
        description: 'Sistema premium com análise de vídeo por IA e app mobile',
        attachments: ['orcamento_vigiltec.pdf'],
        submittedDate: '03/12/2025'
      }
    ] : [])
  ]);

  const [newProposal, setNewProposal] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    proposedValue: 0,
    timeline: '',
    description: ''
  });

  const [showForm, setShowForm] = useState(false);

  const handleAddProposal = () => {
    if (!newProposal.companyName || !newProposal.proposedValue || !newProposal.contactName) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const proposal: ServiceProvider = {
      ...newProposal,
      id: Date.now().toString(),
      attachments: [],
      submittedDate: new Date().toLocaleDateString('pt-BR')
    };

    const updatedProposals = [...proposals, proposal];
    setProposals(updatedProposals);

    // Atualizar status do projeto
    const averageValue = updatedProposals.reduce((sum, p) => sum + p.proposedValue, 0) / updatedProposals.length;
    const updatedProject = {
      ...project,
      status: updatedProposals.length >= project.requiredProposals ? 'analysis' : 'collecting',
      collectedProposals: updatedProposals.length,
      estimatedCost: averageValue
    };

    onUpdate(updatedProject);

    // Reset form
    setNewProposal({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      proposedValue: 0,
      timeline: '',
      description: ''
    });
    setShowForm(false);
  };

  const analyzeProposals = () => {
    if (proposals.length < project.requiredProposals) {
      alert(`É necessário ter pelo menos ${project.requiredProposals} propostas para análise`);
      return;
    }

    const averageValue = proposals.reduce((sum, p) => sum + p.proposedValue, 0) / proposals.length;
    const budgetOk = averageValue <= availableBudget;

    const updatedProject = {
      ...project,
      status: budgetOk ? 'ready' : 'waiting',
      estimatedCost: averageValue,
      budgetAvailable: budgetOk,
      waitingReason: !budgetOk ? `Faltam R$ ${(averageValue - availableBudget).toLocaleString('pt-BR')} no fundo de reserva` : undefined
    };

    onUpdate(updatedProject);
    alert(
      budgetOk 
        ? '✅ Análise concluída! Projeto aprovado para execução.' 
        : '⏳ Análise concluída. Projeto em espera - orçamento insuficiente.'
    );
    onClose();
  };

  const averageValue = proposals.length > 0 
    ? proposals.reduce((sum, p) => sum + p.proposedValue, 0) / proposals.length 
    : 0;

  const lowestValue = proposals.length > 0
    ? Math.min(...proposals.map(p => p.proposedValue))
    : 0;

  const highestValue = proposals.length > 0
    ? Math.max(...proposals.map(p => p.proposedValue))
    : 0;

  return (
    <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100">
        <div className="sticky top-0 bg-white border-b border-blue-100 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-blue-900 text-2xl mb-1">Coleta de Propostas</h2>
              <p className="text-blue-600">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Statistics */}
          {proposals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-600 text-sm mb-1">Propostas Recebidas</p>
                <p className="text-blue-900 text-2xl">{proposals.length}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-600 text-sm mb-1">Menor Valor</p>
                <p className="text-green-900 text-xl">R$ {lowestValue.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <p className="text-orange-600 text-sm mb-1">Maior Valor</p>
                <p className="text-orange-900 text-xl">R$ {highestValue.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <p className="text-purple-600 text-sm mb-1">Valor Médio</p>
                <p className="text-purple-900 text-xl">R$ {averageValue.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          )}

          {/* Budget Analysis */}
          {proposals.length >= project.requiredProposals && (
            <div className={`p-4 rounded-xl mb-6 border-2 ${
              averageValue <= availableBudget
                ? 'bg-green-50 border-green-300'
                : 'bg-orange-50 border-orange-300'
            }`}>
              <div className="flex items-start gap-3">
                {averageValue <= availableBudget ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className={`mb-2 ${averageValue <= availableBudget ? 'text-green-900' : 'text-orange-900'}`}>
                    Análise de Viabilidade Financeira
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-slate-600 mb-1">Fundo de Reserva Disponível:</p>
                      <p className="text-slate-900 text-lg">R$ {availableBudget.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Custo Médio do Projeto:</p>
                      <p className="text-slate-900 text-lg">R$ {averageValue.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  {averageValue <= availableBudget ? (
                    <p className="text-green-700">
                      ✅ Orçamento disponível é suficiente para execução do projeto!
                    </p>
                  ) : (
                    <p className="text-orange-700">
                      ⚠️ Orçamento insuficiente. Faltam R$ {(averageValue - availableBudget).toLocaleString('pt-BR')}. 
                      O projeto entrará em espera até a captação dos recursos necessários.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Existing Proposals */}
          <div className="mb-6">
            <h3 className="text-blue-900 text-lg mb-4">
              Propostas Coletadas ({proposals.length}/{project.requiredProposals} mínimas)
            </h3>
            
            {proposals.length === 0 ? (
              <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-200">
                <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-blue-600 mb-2">Nenhuma proposta coletada ainda</p>
                <p className="text-blue-500 text-sm">
                  Adicione pelo menos {project.requiredProposals} propostas de prestadores para análise
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-wave-400 rounded-xl">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-blue-900 text-lg">{proposal.companyName}</h4>
                          <p className="text-blue-600 text-sm">Enviado em {proposal.submittedDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600 text-sm mb-1">Valor Proposto</p>
                        <p className="text-blue-900 text-2xl">
                          R$ {proposal.proposedValue.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-700">{proposal.contactName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-700">{proposal.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-700">{proposal.phone}</span>
                      </div>
                    </div>

                    <p className="text-blue-700 mb-3">{proposal.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-blue-600">
                        Prazo: <span className="text-blue-900">{proposal.timeline}</span>
                      </div>
                      {proposal.attachments.length > 0 && (
                        <div className="flex gap-2">
                          {proposal.attachments.map((file, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-200 text-blue-700 rounded-lg text-xs flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {file}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Proposal Form */}
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all border-2 border-dashed border-blue-300"
            >
              + Adicionar Nova Proposta de Prestador
            </button>
          ) : (
            <div className="bg-white border-2 border-blue-300 rounded-xl p-6">
              <h4 className="text-blue-900 text-lg mb-4">Nova Proposta</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-blue-900 mb-2">Empresa *</label>
                  <input
                    type="text"
                    value={newProposal.companyName}
                    onChange={(e) => setNewProposal({ ...newProposal, companyName: e.target.value })}
                    placeholder="Nome da empresa"
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-blue-900 mb-2">Contato *</label>
                  <input
                    type="text"
                    value={newProposal.contactName}
                    onChange={(e) => setNewProposal({ ...newProposal, contactName: e.target.value })}
                    placeholder="Nome do responsável"
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-blue-900 mb-2">E-mail</label>
                  <input
                    type="email"
                    value={newProposal.email}
                    onChange={(e) => setNewProposal({ ...newProposal, email: e.target.value })}
                    placeholder="email@empresa.com"
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-blue-900 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={newProposal.phone}
                    onChange={(e) => setNewProposal({ ...newProposal, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-blue-900 mb-2">Valor Proposto (R$) *</label>
                  <input
                    type="number"
                    value={newProposal.proposedValue || ''}
                    onChange={(e) => setNewProposal({ ...newProposal, proposedValue: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-blue-900 mb-2">Prazo de Execução</label>
                  <input
                    type="text"
                    value={newProposal.timeline}
                    onChange={(e) => setNewProposal({ ...newProposal, timeline: e.target.value })}
                    placeholder="Ex: 30 dias"
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-blue-900 mb-2">Descrição da Proposta</label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  placeholder="Descreva os serviços, materiais e diferenciais incluídos..."
                  rows={3}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddProposal}
                  className="flex-1 py-3 bg-wave-500 text-white rounded-xl hover:hover:bg-wave-600 transition-all shadow-lg"
                >
                  Adicionar Proposta
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
            >
              Fechar
            </button>
            {proposals.length >= project.requiredProposals && (
              <button
                onClick={analyzeProposals}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all shadow-lg"
              >
                Finalizar Análise e Verificar Viabilidade
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
