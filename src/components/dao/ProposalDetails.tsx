'use client';

import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, ExternalLink, User, Calendar, Hash } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ProposalDetailsProps {
  proposalId: string;
  onBack: () => void;
}

export function ProposalDetails({ proposalId, onBack }: ProposalDetailsProps) {
  const [adminProposals] = useLocalStorage<any[]>('wave_proposals', []);
  const [userProposals] = useLocalStorage<any[]>('wave_proposals', []);
  
  const storedProposal = adminProposals.find((p: any) => p.id === proposalId) || 
                        userProposals.find((p: any) => p.id === proposalId);

  const defaultProposal = {
    id: proposalId,
    title: storedProposal?.title || 'Proposta não encontrada',
    description: storedProposal?.description || '',
    fullDescription: `
      <h3>Objetivo</h3>
      <p>Reduzir custos operacionais do condomínio através da geração de energia limpa e renovável.</p>
      
      <h3>Escopo do Projeto</h3>
      <ul>
        <li>Instalação de 250 painéis solares de 400W cada</li>
        <li>Inversores de última geração com monitoramento remoto</li>
        <li>Sistema de armazenamento de energia (baterias)</li>
        <li>Infraestrutura de cabeamento e proteção</li>
        <li>Sistema de monitoramento em tempo real</li>
      </ul>
      
      <h3>Benefícios Esperados</h3>
      <ul>
        <li>Redução de 70% nos custos com energia elétrica</li>
        <li>Economia estimada de R$ 3.500/mês</li>
        <li>Retorno do investimento em 4 anos</li>
        <li>Valorização dos imóveis</li>
        <li>Contribuição para sustentabilidade</li>
      </ul>
      
      <h3>Investimento</h3>
      <p>Valor total: R$ 180.000,00</p>
      <p>Forma de pagamento: Uso do fundo de reserva + parcelamento em 12x</p>
    `,
    category: storedProposal?.category || 'Geral',
    status: storedProposal?.status || 'active',
    votesFor: storedProposal?.votesFor || 0,
    votesAgainst: storedProposal?.votesAgainst || 0,
    totalVotes: storedProposal?.totalVotes || 0,
    abstentions: 0,
    quorum: storedProposal?.quorum || 0,
    requiredQuorum: 51,
    daysLeft: storedProposal?.daysLeft || 0,
    created: storedProposal?.created || new Date().toLocaleDateString('pt-BR'),
    endDate: '06/12/2025',
    creator: {
      name: storedProposal?.creator?.split(' - ')[0] || 'Desconhecido',
      unit: storedProposal?.creator?.split(' - ')[1] || 'N/A',
      wallet: '0x742d...8f2a'
    },
    impact: {
      financial: 'R$ 180.000,00',
      monthlyReturn: 'R$ 3.500,00',
      payback: '4 anos'
    },
    attachments: [
      { name: 'Proposta Técnica.pdf', size: '2.4 MB', hash: '0x8a3c...5b1d' },
      { name: 'Orçamento Detalhado.pdf', size: '890 KB', hash: '0x1f5e...9c7a' },
      { name: 'Especificações Técnicas.pdf', size: '1.2 MB', hash: '0x6d2b...4e8f' }
    ],
    blockchainData: {
      transactionHash: '0xabcd...efgh',
      ledger: '18234567',
      network: 'Stellar Testnet'
    }
  };

  const proposal = { ...defaultProposal, ...storedProposal, creator: defaultProposal.creator }; // Merge but keep structured creator if needed, though stored might be string.

  // If storedProposal exists, ensure complex fields are preserved from default if missing in stored
  if (storedProposal) {
      // Re-construct creator object if stored is just a string name
      if (typeof storedProposal.creator === 'string') {
          const parts = storedProposal.creator.split(' - ');
          proposal.creator = {
              name: parts[0] || storedProposal.creator,
              unit: parts[1] || 'N/A',
              wallet: '0x...'
          };
      }
      
      // Ensure arrays/objects exist
      proposal.attachments = defaultProposal.attachments;
      proposal.blockchainData = defaultProposal.blockchainData;
      proposal.impact = defaultProposal.impact;
      proposal.fullDescription = defaultProposal.fullDescription;
  }

  const voteData = [
    { name: 'A Favor', value: proposal.votesFor, color: '#22c55e' },
    { name: 'Contra', value: proposal.votesAgainst, color: '#ef4444' }
  ];

  const voteHistory = [
    { voter: 'Apto 302', vote: 'favor', date: '01/12/2025 14:32', hash: '0x9a7c...2d3e' },
    { voter: 'Apto 801', vote: 'favor', date: '01/12/2025 10:15', hash: '0x3e1f...7b9c' },
    { voter: 'Apto 605', vote: 'contra', date: '30/11/2025 18:45', hash: '0x5c8d...1a4f' },
    { voter: 'Apto 204', vote: 'favor', date: '30/11/2025 09:20', hash: '0x7f2a...6e9b' },
    { voter: 'Apto 703', vote: 'favor', date: '29/11/2025 16:50', hash: '0x2b9d...3c8a' }
  ];

  return (
    <div className="p-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar para Governança
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                <Clock className="w-4 h-4" />
                Em Votação - {proposal.daysLeft} dias restantes
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {proposal.category}
              </span>
            </div>
            <h1 className="text-slate-900 text-3xl mb-4">{proposal.title}</h1>
            <p className="text-slate-600 text-lg">{proposal.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
          <div>
            <p className="text-slate-600 text-sm mb-1">Criado por</p>
            <p className="text-slate-900">{proposal.creator.name}</p>
            <p className="text-slate-500 text-sm">{proposal.creator.unit}</p>
          </div>
          <div>
            <p className="text-slate-600 text-sm mb-1">Data de Criação</p>
            <p className="text-slate-900">{proposal.created}</p>
          </div>
          <div>
            <p className="text-slate-600 text-sm mb-1">Término</p>
            <p className="text-slate-900">{proposal.endDate}</p>
          </div>
          <div>
            <p className="text-slate-600 text-sm mb-1">Quórum</p>
            <p className="text-slate-900">{proposal.quorum}% / {proposal.requiredQuorum}%</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="text-slate-900 text-xl mb-4">Descrição Completa</h2>
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: proposal.fullDescription }}
            />
          </div>

          {/* Impact Analysis */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="text-slate-900 text-xl mb-4">Análise de Impacto</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-600 text-sm mb-1">Investimento</p>
                <p className="text-slate-900 text-xl">{proposal.impact.financial}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-green-600 text-sm mb-1">Retorno Mensal</p>
                <p className="text-slate-900 text-xl">{proposal.impact.monthlyReturn}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-purple-600 text-sm mb-1">Payback</p>
                <p className="text-slate-900 text-xl">{proposal.impact.payback}</p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-500" />
              <h2 className="text-slate-900 text-xl">Documentos Anexados</h2>
            </div>
            <div className="space-y-3">
              {proposal.attachments.map((file: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-slate-900">{file.name}</p>
                      <p className="text-slate-600 text-sm">
                        {file.size} • Hash: {file.hash}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors">
                    <ExternalLink className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Data */}
          <div className="bg-slate-900 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl">Dados de Registro</h2>
            </div>
            <div className="space-y-3 font-mono text-sm">
              <div className="p-3 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-xs mb-1">Transaction Hash (Stellar)</p>
                <p className="text-blue-400 flex items-center gap-2">
                  {proposal.blockchainData.transactionHash}
                  <ExternalLink className="w-4 h-4" />
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Ledger</p>
                  <p className="text-white">{proposal.blockchainData.ledger}</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-xs mb-1">Rede</p>
                  <p className="text-white">{proposal.blockchainData.network}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vote History */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="text-slate-900 text-xl mb-4">Histórico de Votos</h2>
            <div className="space-y-2">
              {voteHistory.map((vote, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      vote.vote === 'favor' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {vote.vote === 'favor' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-slate-900">{vote.voter}</p>
                      <p className="text-slate-600 text-sm">{vote.date}</p>
                    </div>
                  </div>
                  <button className="text-blue-500 hover:text-blue-600 text-sm font-mono">
                    {vote.hash}
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
              Ver Todos os Votos ({proposal.totalVotes})
            </button>
          </div>
        </div>

        {/* Right Column - Voting Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-slate-200 sticky top-8 space-y-6">
            {/* Vote Chart */}
            <div>
              <h3 className="text-slate-900 mb-4">Resultados da Votação</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={voteData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {voteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-slate-600">A Favor</span>
                  </div>
                  <span className="text-sm text-slate-900">{proposal.votesFor} ({((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm text-slate-600">Contra</span>
                  </div>
                  <span className="text-sm text-slate-900">{proposal.votesAgainst} ({((proposal.votesAgainst / proposal.totalVotes) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>

            {/* Voting Actions */}
            <div className="pt-6 border-t border-slate-200">
              <p className="text-slate-900 mb-4">Seu voto é importante!</p>
              <div className="space-y-3">
                <button className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Votar a Favor
                </button>
                <button className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Votar Contra
                </button>
                <button className="w-full py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                  Abster-se
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="pt-6 border-t border-slate-200">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-900 text-sm mb-1">Seu poder de voto</p>
                <p className="text-blue-600">1 voto (Apto 504)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
