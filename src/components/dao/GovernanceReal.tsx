import { useState, useEffect, useCallback } from 'react';
import { Vote, Clock, CheckCircle, XCircle, Plus, Filter, TrendingUp, Loader } from 'lucide-react';
import { useContracts, generateHash, formatTimestamp, getDaysRemaining } from '../../hooks/useContracts';
import { CreateProposalModal } from './CreateProposalModal';
import { ProjectPriorities } from './ProjectPriorities';


interface GovernanceProps {
  onViewProposal: (proposalId: string) => void;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  category: string;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  deadline: number;
  executed: boolean;
  approved: boolean;
  daysLeft: number;
  hasVoted: boolean;
  userVote?: boolean;
}

export function GovernanceReal({ onViewProposal }: GovernanceProps) {
  const { contracts, isConnected, account } = useContracts();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'approved' | 'rejected'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [view, setView] = useState<'voting' | 'priorities'>('voting');
  const [voting, setVoting] = useState<string | null>(null);

  const loadProposals = useCallback(async () => {
    if (!contracts?.governance) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const count = await contracts.governance.proposalCount();
      const proposalList: Proposal[] = [];

      for (let i = 1; i <= Number(count); i++) {
        const proposal = await contracts.governance.getProposal(i);
        
        let hasVoted = false;
        let userVote = undefined;
        
        if (account) {
          hasVoted = await contracts.governance.hasVoted(i, account);
          if (hasVoted) {
            const vote = await contracts.governance.getVote(i, account);
            userVote = vote[1] as boolean;
          }
        }

        proposalList.push({
          id: i,
          title: proposal[0] as string,
          description: proposal[1] as string,
          category: proposal[2] as string,
          votesFor: Number(proposal[3]),
          votesAgainst: Number(proposal[4]),
          totalVotes: Number(proposal[5]),
          deadline: Number(proposal[6]),
          executed: proposal[7] as boolean,
          approved: proposal[8] as boolean,
          daysLeft: getDaysRemaining(proposal[6] as bigint),
          hasVoted,
          userVote
        });
      }

      setProposals(proposalList.reverse()); // Mais recentes primeiro
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  }, [contracts, account]);

  // Carregar propostas da blockchain
  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const handleCreateProposal = async (data: any) => {
    if (!contracts?.governance || !isConnected) {
      alert('Sessão expirada. Por favor, faça login novamente.');
      return;
    }

    try {
      // Gerar hash dos metadados
      const metadata = {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        createdAt: new Date().toISOString()
      };
      const metadataHash = await generateHash(JSON.stringify(metadata));

      // Criar proposta na blockchain
      const tx = await contracts.governance.createProposal(
        data.title,
        data.description,
        data.category,
        data.type,
        data.duration,
        metadataHash
      );

      console.log('📝 Creating proposal...', tx.hash);
      await tx.wait();
      console.log('✅ Proposal created!');

      // Recarregar propostas
      await loadProposals();
      setShowCreateModal(false);

      alert('✅ Proposta criada com sucesso!');
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      alert(`Erro ao criar proposta: ${error.message}`);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!contracts?.governance || !isConnected) {
      alert('Sessão expirada. Por favor, faça login novamente.');
      return;
    }

    try {
      setVoting(`${proposalId}-${support}`);

      const tx = await contracts.governance.vote(proposalId, support);
      console.log(`🗳️  Voting ${support ? 'YES' : 'NO'} on proposal ${proposalId}...`, tx.hash);
      
      await tx.wait();
      console.log('✅ Vote registered!');

      // Recarregar propostas
      await loadProposals();

      alert(`✅ Voto registrado na Stellar!`);
    } catch (error: any) {
      console.error('Error voting:', error);
      
      if (error.message?.includes('Already voted')) {
        alert('Você já votou nesta proposta');
      } else if (error.message?.includes('Voting ended')) {
        alert('O período de votação já encerrou');
      } else if (error.message?.includes('Not authorized')) {
        alert('Você não está autorizado a votar. Entre em contato com o administrador.');
      } else {
        alert(`Erro ao votar: ${error.message}`);
      }
    } finally {
      setVoting(null);
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    if (filter === 'all') return true;
    if (filter === 'active') return !proposal.executed;
    if (filter === 'approved') return proposal.executed && proposal.approved;
    if (filter === 'rejected') return proposal.executed && !proposal.approved;
    return true;
  });

  const getStatusBadge = (proposal: Proposal) => {
    if (!proposal.executed) {
      return proposal.daysLeft > 0 ? (
        <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
          <Clock className="w-4 h-4" />
          Em Votação
        </span>
      ) : (
        <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          <Clock className="w-4 h-4" />
          Aguardando Execução
        </span>
      );
    }

    return proposal.approved ? (
      <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
        <CheckCircle className="w-4 h-4" />
        Aprovada
      </span>
    ) : (
      <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
        <XCircle className="w-4 h-4" />
        Rejeitada
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8 bg-wave-50 min-h-screen relative flex items-center justify-center">
        
        <div className="text-center relative z-10">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-blue-600">Carregando propostas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-wave-50 min-h-screen relative">
      
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-blue-900 text-3xl mb-2">Governança do Condomínio</h1>
          <p className="text-blue-600">Participe das decisões do condomínio de forma transparente</p>
          {!isConnected && (
            <p className="text-orange-600 text-sm mt-2">
              ⚠️ Faça login para votar e criar propostas
            </p>
          )}
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          disabled={!isConnected}
          className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all ${
            isConnected
              ? 'bg-wave-500 text-white hover:hover:bg-wave-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-5 h-5" />
          Nova Proposta
        </button>
      </div>

      {/* View Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-blue-100 mb-6 shadow-lg relative z-10 inline-flex">
        <button
          onClick={() => setView('voting')}
          className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
            view === 'voting'
              ? 'bg-wave-500 text-white shadow-lg'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Vote className="w-5 h-5" />
          Votações ({proposals.filter(p => !p.executed).length})
        </button>
        <button
          onClick={() => setView('priorities')}
          className={`px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${
            view === 'priorities'
              ? 'bg-wave-500 text-white shadow-lg'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Fila de Prioridades
        </button>
      </div>

      {view === 'priorities' ? (
        <ProjectPriorities />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 mb-6 shadow-lg relative z-10">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filter === 'all'
                    ? 'bg-wave-500 text-white shadow-lg'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Todas ({proposals.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filter === 'active'
                    ? 'bg-wave-500 text-white shadow-lg'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Em Votação ({proposals.filter(p => !p.executed).length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filter === 'approved'
                    ? 'bg-wave-500 text-white shadow-lg'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Aprovadas
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  filter === 'rejected'
                    ? 'bg-wave-500 text-white shadow-lg'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Rejeitadas
              </button>
            </div>
          </div>

          {/* Proposals List */}
          {filteredProposals.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-blue-100 shadow-lg text-center relative z-10">
              <Vote className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-blue-900 text-xl mb-2">Nenhuma proposta encontrada</h3>
              <p className="text-blue-600 mb-4">
                {filter === 'all' 
                  ? 'Seja o primeiro a criar uma proposta!' 
                  : 'Nenhuma proposta nesta categoria'}
              </p>
              {isConnected && filter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-wave-500 text-white rounded-xl hover:hover:bg-wave-600 transition-all shadow-lg"
                >
                  Criar Primeira Proposta
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              {filteredProposals.map((proposal) => {
                const approvalRate = proposal.totalVotes > 0 
                  ? Math.round((proposal.votesFor / proposal.totalVotes) * 100) 
                  : 0;

                return (
                  <div
                    key={proposal.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-blue-900 text-xl">{proposal.title}</h3>
                          {getStatusBadge(proposal)}
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {proposal.category}
                          </span>
                        </div>
                        <p className="text-blue-600 mb-3">{proposal.description}</p>
                        
                        {proposal.hasVoted && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm mb-3">
                            <CheckCircle className="w-4 h-4" />
                            Você votou: {proposal.userVote ? 'A Favor' : 'Contra'}
                          </div>
                        )}
                      </div>
                      
                      {!proposal.executed && proposal.daysLeft > 0 && (
                        <div className="text-right">
                          <p className="text-2xl text-blue-900">{proposal.daysLeft}</p>
                          <p className="text-sm text-blue-600">dias restantes</p>
                        </div>
                      )}
                    </div>

                    {/* Voting Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-blue-700">Aprovação</span>
                        <span className="text-blue-900 font-medium">{approvalRate}%</span>
                      </div>
                      <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all"
                          style={{ width: `${approvalRate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-green-600">
                          ✓ {proposal.votesFor} a favor
                        </span>
                        <span className="text-red-600">
                          ✗ {proposal.votesAgainst} contra
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {!proposal.executed && proposal.daysLeft > 0 && !proposal.hasVoted && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVote(proposal.id, true)}
                          disabled={!isConnected || voting === `${proposal.id}-true`}
                          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                            isConnected
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {voting === `${proposal.id}-true` ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              Votando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Votar a Favor
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleVote(proposal.id, false)}
                          disabled={!isConnected || voting === `${proposal.id}-false`}
                          className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                            isConnected
                              ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {voting === `${proposal.id}-false` ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              Votando...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5" />
                              Votar Contra
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {proposal.hasVoted && !proposal.executed && (
                      <div className="text-center py-3 bg-blue-50 rounded-xl text-blue-700">
                        Você já votou nesta proposta
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Blockchain Info */}
      <div className="mt-8 bg-wave-100 rounded-2xl p-6 border border-blue-200 shadow-lg relative z-10">
        <div className="flex items-start gap-3">
          <Vote className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
          <div>
            <h3 className="text-blue-900 mb-2">Registro Imutável na Stellar</h3>
            <p className="text-blue-700 text-sm mb-2">
              Todas as propostas e votos têm seu hash ancorado na rede Stellar, garantindo transparência total e impossibilidade de adulteração.
            </p>
            <div className="flex gap-4 text-sm text-blue-600">
              <span>Total de propostas: {proposals.length}</span>
              <span>•</span>
              <span>Rede: Stellar Testnet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <CreateProposalModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProposal}
        />
      )}
    </div>
  );
}
