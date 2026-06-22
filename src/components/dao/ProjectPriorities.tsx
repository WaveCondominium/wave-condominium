'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import { ProposalCollectionModal } from './ProposalCollectionModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  votesFor: number;
  totalVotes: number;
  approvalPercentage: number;
  approvedDate: string;
  status: 'approved' | 'collecting' | 'analysis' | 'ready' | 'waiting' | 'executing';
  estimatedCost?: number;
  collectedProposals?: number;
  requiredProposals: number;
  budgetAvailable?: boolean;
  waitingReason?: string;
}

export function ProjectPriorities() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  
  const [projects, setProjects] = useLocalStorage<Project[]>('wave_project_priorities', [
    {
      id: '1',
      title: 'Instalação de Painéis Solares',
      description: 'Sistema fotovoltaico completo para áreas comuns',
      category: 'Sustentabilidade',
      votesFor: 156,
      totalVotes: 200,
      approvalPercentage: 78,
      approvedDate: '01/12/2025',
      status: 'approved',
      requiredProposals: 3,
      collectedProposals: 0
    },
    {
      id: '2',
      title: 'Renovação do Sistema de Segurança',
      description: 'Upgrade de câmeras e controle de acesso',
      category: 'Segurança',
      votesFor: 130,
      totalVotes: 200,
      approvalPercentage: 65,
      approvedDate: '28/11/2025',
      status: 'collecting',
      requiredProposals: 3,
      collectedProposals: 2,
      estimatedCost: 85000
    }
  ]);

  const fundoReserva = 127450; // Valor do fundo de reserva disponível

  const sortedProjects = [...projects].sort((a, b) => b.approvalPercentage - a.approvalPercentage);

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId);
    setShowProposalModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Aprovada - Aguardando Propostas
          </span>
        );
      case 'collecting':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            <FileText className="w-4 h-4" />
            Coletando Propostas
          </span>
        );
      case 'analysis':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            <TrendingUp className="w-4 h-4" />
            Em Análise
          </span>
        );
      case 'ready':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            Pronta para Execução
          </span>
        );
      case 'waiting':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Aguardando Orçamento
          </span>
        );
      case 'executing':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
            <TrendingUp className="w-4 h-4" />
            Em Execução
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sustentabilidade':
        return 'bg-green-100 text-green-700';
      case 'Segurança':
        return 'bg-red-100 text-red-700';
      case 'Infraestrutura':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Fundo Disponível */}
      <div className="bg-wave-400 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-2">Fundo de Reserva Disponível</p>
            <p className="text-4xl mb-2">
              R$ {fundoReserva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-blue-100 text-sm">
              Atualizado em tempo real via Open Finance
            </p>
          </div>
          <DollarSign className="w-16 h-16 text-blue-200 opacity-50" />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-blue-900 mb-1">Como funciona a Fila de Prioridades</h4>
            <p className="text-blue-700 text-sm">
              Apenas propostas <strong>aprovadas com quórum</strong> entram nesta lista. 
              O ranking é baseado no <strong>percentual de aprovação</strong> (votos favoráveis). 
              Para cada projeto, são coletadas no mínimo <strong>3 propostas de prestadores</strong> antes da análise financeira.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Projetos Priorizados */}
      <div className="space-y-4">
        {sortedProjects.map((project, index) => {
          const budgetStatus = project.estimatedCost 
            ? project.estimatedCost <= fundoReserva 
            : null;

          return (
            <div
              key={project.id}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl border-2 p-6 shadow-lg transition-all ${
                project.status === 'ready' 
                  ? 'border-cyan-300 hover:shadow-xl' 
                  : project.status === 'waiting'
                  ? 'border-orange-300'
                  : 'border-blue-100 hover:shadow-xl'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Ranking Number */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                    'bg-wave-400'
                  }`}>
                    {index + 1}º
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-2xl text-blue-900">{project.approvalPercentage}%</p>
                    <p className="text-xs text-blue-600">aprovação</p>
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-blue-900 text-xl mb-2">{project.title}</h3>
                      <p className="text-blue-600 mb-3">{project.description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs ${getCategoryColor(project.category)}`}>
                          {project.category}
                        </span>
                        {getStatusBadge(project.status)}
                        <span className="text-blue-600 text-sm flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Aprovada em {project.approvedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar - Propostas Coletadas */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-blue-700">Propostas Coletadas</span>
                      <span className="text-blue-900">
                        {project.collectedProposals || 0} / {project.requiredProposals}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-wave-500 transition-all"
                        style={{ 
                          width: `${((project.collectedProposals || 0) / project.requiredProposals) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Budget Info */}
                  {project.estimatedCost && (
                    <div className={`p-4 rounded-xl mb-4 ${
                      budgetStatus 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-orange-50 border border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 mb-1">Valor Estimado (Média das Propostas)</p>
                          <p className="text-2xl text-slate-900">
                            R$ {project.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        {budgetStatus ? (
                          <div className="text-right">
                            <CheckCircle className="w-8 h-8 text-green-600 mb-1" />
                            <p className="text-sm text-green-700">Orçamento OK</p>
                          </div>
                        ) : (
                          <div className="text-right">
                            <AlertCircle className="w-8 h-8 text-orange-600 mb-1" />
                            <p className="text-sm text-orange-700">Aguardando Fundos</p>
                            <p className="text-xs text-orange-600">
                              Falta: R$ {(project.estimatedCost - fundoReserva).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    {project.status === 'approved' && (
                      <button
                        onClick={() => handleProjectClick(project.id)}
                        className="flex-1 py-3 bg-wave-500 text-white rounded-xl hover:hover:bg-wave-600 transition-all shadow-lg"
                      >
                        Coletar Propostas de Prestadores
                      </button>
                    )}
                    
                    {project.status === 'collecting' && (
                      <>
                        <button
                          onClick={() => handleProjectClick(project.id)}
                          className="flex-1 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all"
                        >
                          Adicionar Mais Propostas ({project.collectedProposals}/{project.requiredProposals})
                        </button>
                        <button className="flex-1 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all">
                          Analisar Propostas Recebidas
                        </button>
                      </>
                    )}

                    {project.status === 'waiting' && (
                      <div className="flex-1 p-3 bg-orange-100 text-orange-800 rounded-xl text-center">
                        <p className="text-sm mb-1">⏳ Projeto em espera</p>
                        <p className="text-xs">Será executado quando houver orçamento disponível</p>
                      </div>
                    )}

                    {project.status === 'ready' && (
                      <button className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg">
                        Iniciar Execução do Projeto
                      </button>
                    )}
                  </div>

                  {/* Voting Details */}
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <div className="flex items-center justify-between text-sm text-blue-600">
                      <span>{project.votesFor} votos favoráveis de {project.totalVotes} moradores</span>
                      <span>Quórum atingido ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proposal Collection Modal */}
      {showProposalModal && selectedProject && (
        <ProposalCollectionModal
          projectId={selectedProject}
          project={projects.find(p => p.id === selectedProject)!}
          onClose={() => {
            setShowProposalModal(false);
            setSelectedProject(null);
          }}
          onUpdate={(updatedProject) => {
            setProjects(projects.map(p => 
              p.id === updatedProject.id ? updatedProject : p
            ));
          }}
          availableBudget={fundoReserva}
        />
      )}
    </div>
  );
}
