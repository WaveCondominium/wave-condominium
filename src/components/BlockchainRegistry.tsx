'use client';

import { useState } from 'react';
import { Shield, ExternalLink, Search, CheckCircle, XCircle, Clock, DollarSign, FileText, Vote, User, AlertCircle } from 'lucide-react';
import { useBlockchainAutoRegistry } from '@/hooks/useBlockchainAutoRegistry';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useUser } from '@/contexts/UserContext';

type FilterType = 'all' | 'financial' | 'proposal' | 'vote' | 'document';

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  financial: { label: 'Pagamento',  icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-100' },
  proposal:  { label: 'Proposta',   icon: Vote,       color: 'text-purple-700',  bg: 'bg-purple-100'  },
  vote:      { label: 'Voto',       icon: Vote,       color: 'text-blue-700',    bg: 'bg-blue-100'    },
  document:  { label: 'Documento',  icon: FileText,   color: 'text-amber-700',   bg: 'bg-amber-100'   },
  user:      { label: 'Usuário',    icon: User,       color: 'text-gray-700',    bg: 'bg-gray-100'    },
};

export function BlockchainRegistry() {
  const { records } = useBlockchainAutoRegistry();
  const { userProfile } = useUser();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  // Boletos com registro Stellar — fonte principal de pagamentos
  const [boletos] = useLocalStorage<any[]>('wave_boletos', []);
  const boletosRegistrados = boletos.filter((b: any) =>
    b.blockchainHash && b.status === 'blockchain_registered'
  );

  const filtered = records.filter(r => {
    const matchType   = filter === 'all' || r.type === filter;
    const matchSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.txHash.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const confirmed = records.filter(r => r.status === 'confirmed').length;
  const pending   = records.filter(r => r.status === 'pending').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-wave-700 to-wave-500 min-h-screen relative">

      {/* Header */}
      <div className="mb-6 relative z-10">
        <h1 className="text-wave-800 text-2xl sm:text-3xl mb-1">
          {userProfile.role === 'Morador' ? 'Meus Comprovantes' : 'Auditoria Stellar'}
        </h1>
        <p className="text-wave-500 text-sm">
          {userProfile.role === 'Morador'
            ? 'Comprovantes dos seus pagamentos — verificáveis de forma independente'
            : 'Trilha de auditoria completa — todos os eventos registrados na rede Stellar'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
        {[
          { label: 'Total de registros',  value: records.length,           icon: Shield,       bg: 'bg-wave-100',    color: 'text-wave-600'    },
          { label: 'Confirmados',          value: confirmed,                 icon: CheckCircle,  bg: 'bg-emerald-100', color: 'text-emerald-600' },
          { label: 'Pendentes',            value: pending,                   icon: Clock,        bg: 'bg-amber-100',   color: 'text-amber-600'   },
          { label: 'Pagamentos verificados', value: boletosRegistrados.length, icon: DollarSign, bg: 'bg-blue-100',    color: 'text-blue-600'    },
        ].map(s => (
          <div key={s.label} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-5 shadow-lg">
            <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-semibold text-wave-800">{s.value}</p>
            <p className="text-wave-500 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── PAGAMENTOS REGISTRADOS — visível para todos ── */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-6 mb-8 shadow-lg relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-wave-800 text-lg font-medium">Pagamentos Condominiais</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-700 text-xs font-medium">Verificável publicamente</span>
          </div>
        </div>

        {boletosRegistrados.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 text-wave-300 mx-auto mb-3" />
            <p className="text-wave-500 text-sm">Nenhum pagamento registrado ainda.</p>
            <p className="text-wave-400 text-xs mt-1">
              Após o pagamento de um boleto, o comprovante aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {boletosRegistrados.map((boleto: any) => {
              const explorerUrl = boleto.stellarExplorerUrl ??
                (boleto.blockchainHash && !boleto.blockchainHash.startsWith('0x') && boleto.blockchainHash.length === 64
                  ? `https://stellar.expert/explorer/testnet/tx/${boleto.blockchainHash}`
                  : null);

              return (
                <div key={boleto.id} className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4">
                  {/* Cabeçalho do pagamento */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-wave-800 font-medium">
                        Unidade {boleto.unitNumber}
                        {boleto.unitOwner && <span className="text-wave-500 font-normal"> · {boleto.unitOwner}</span>}
                      </p>
                      <p className="text-wave-500 text-sm mt-0.5">
                        {boleto.description || boleto.referenceMonth}
                        {boleto.amount && ` · R$ ${boleto.amount.toFixed(2).replace('.', ',')}`}
                      </p>
                      {boleto.paidAt && (
                        <p className="text-wave-400 text-xs mt-0.5">
                          Pago em: {new Date(boleto.paidAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium shrink-0">
                      <CheckCircle className="w-3 h-3" /> Verificado
                    </span>
                  </div>

                  {/* Registro Stellar */}
                  <div className="bg-white rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-wave-500 text-xs font-medium uppercase tracking-wide">
                        Registro na rede Stellar
                      </p>
                      <span className="text-xs text-wave-400 font-mono">Testnet</span>
                    </div>

                    {/* Hash da transação */}
                    <div>
                      <p className="text-wave-400 text-xs mb-1">ID da transação</p>
                      <p className="text-wave-700 text-xs font-mono break-all leading-relaxed">
                        {boleto.blockchainHash}
                      </p>
                    </div>

                    {boleto.blockchainRegisteredAt && (
                      <p className="text-wave-400 text-xs">
                        Ancoragem: {new Date(boleto.blockchainRegisteredAt).toLocaleString('pt-BR')}
                      </p>
                    )}

                    {/* Botão de verificação — acessível para TODOS */}
                    {explorerUrl ? (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-xs font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Verificar transação na rede Stellar
                      </a>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 w-full py-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        <p className="text-amber-700 text-xs">Hash registrado internamente · link do explorer indisponível</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TABELA DE AUDITORIA — SÍNDICO/ADMIN APENAS ── */}
      {userProfile.role !== 'Morador' && boletosRegistrados.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-6 mb-8 shadow-lg relative z-10 overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-wave-500" />
            <h2 className="text-wave-800 text-lg font-medium">Relatório de Auditoria Blockchain</h2>
            <span className="ml-auto text-xs text-wave-400 italic">Visível apenas para síndico/admin</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wave-100">
                {['Unidade','Competência','Valor R$','Método','txHash','Status Stellar'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-wave-500 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boletosRegistrados.map((b: any) => {
                const explorerUrl = b.stellarExplorerUrl ??
                  (b.blockchainHash?.length === 64 ? `https://stellar.expert/explorer/testnet/tx/${b.blockchainHash}` : null);
                return (
                  <tr key={b.id} className="border-b border-wave-50 hover:bg-wave-50/50">
                    <td className="py-2 px-3 text-wave-700">Apto {b.unitNumber}</td>
                    <td className="py-2 px-3 text-wave-600 text-xs">{b.referenceMonth || b.description}</td>
                    <td className="py-2 px-3 text-wave-700 font-medium">R$ {b.amount?.toFixed(2).replace('.', ',')}</td>
                    <td className="py-2 px-3 text-wave-500 text-xs">Pix/Cartão/Boleto</td>
                    <td className="py-2 px-3">
                      {b.blockchainHash ? (
                        <span className="font-mono text-xs text-wave-500">
                          {b.blockchainHash.slice(0,8)}...{b.blockchainHash.slice(-6)}
                        </span>
                      ) : <span className="text-wave-300 text-xs">—</span>}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          STELLAR_CONFIRMED
                        </span>
                        {explorerUrl && (
                          <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                            className="text-wave-400 hover:text-wave-600">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TRILHA DE AUDITORIA COMPLETA ── */}
      {userProfile.role !== 'Morador' && (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-6 mb-6 shadow-lg relative z-10">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-wave-500" />
          <h2 className="text-wave-800 text-lg font-medium">Trilha de Auditoria Completa</h2>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wave-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título ou hash..."
              className="w-full pl-9 pr-4 py-2 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
          </div>
          {(['all', 'financial', 'proposal', 'vote', 'document'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === f ? 'bg-wave-700 text-white shadow' : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
              }`}
            >
              {f === 'all' ? 'Todos' :
               f === 'financial' ? 'Pagamentos' :
               f === 'proposal' ? 'Propostas' :
               f === 'vote' ? 'Votos' : 'Documentos'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <Shield className="w-12 h-12 text-wave-300 mx-auto mb-3" />
            <p className="text-wave-500">Nenhum registro encontrado.</p>
            <p className="text-wave-400 text-xs mt-1">
              Os registros aparecem aqui conforme as ações são realizadas na plataforma.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(record => {
              const cfg = TYPE_CONFIG[record.type] ?? TYPE_CONFIG['document'];
              const Icon = cfg.icon;
              return (
                <div key={record.id} className="bg-wave-50 rounded-xl p-4 border border-wave-100 hover:border-wave-200 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <p className="text-wave-800 text-sm font-medium">{record.title}</p>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>

                  <p className="text-wave-500 text-xs mb-2">{record.description}</p>

                  {record.txHash && (
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-wave-400 text-xs font-mono truncate flex-1">
                        {record.txHash.slice(0, 20)}...{record.txHash.slice(-8)}
                      </p>
                      {record.explorerUrl && record.status === 'confirmed' && (
                        <a
                          href={record.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-wave-500 hover:text-wave-700 underline shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver na Stellar
                        </a>
                      )}
                    </div>
                  )}

                  <p className="text-wave-400 text-xs mt-2">
                    {new Date(record.timestamp).toLocaleString('pt-BR')}
                    {record.ledger && ` · Ledger #${record.ledger}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      )}

      {/* Info box */}
      <div className="bg-gradient-to-r from-wave-700 to-wave-500 rounded-2xl p-6 border border-wave-200 shadow-lg relative z-10">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-wave-300 shrink-0 mt-1" />
          <div>
            <h3 className="text-wave-800 mb-2">Como funciona a verificação</h3>
            <p className="text-wave-600 text-sm mb-3">
              Cada pagamento gera um comprovante em hash SHA-256 registrado permanentemente
              na rede Stellar via campo <code className="bg-wave-100 px-1 rounded text-xs font-mono">memo_hash</code>.
              Qualquer pessoa — morador, síndico ou auditor externo — pode clicar em
              "Verificar transação" e confirmar o registro diretamente no Stellar Explorer,
              sem depender da plataforma Wave.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-wave-500">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-wave-300 font-medium mb-1">Rede</p>
                <p>Stellar Testnet</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-wave-300 font-medium mb-1">Explorer</p>
                <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="underline hover:text-wave-200">
                  stellar.expert ↗
                </a>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-wave-300 font-medium mb-1">Método</p>
                <p>SHA-256 + memo_hash</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs shrink-0">
      <CheckCircle className="w-3 h-3" /> Confirmado
    </span>
  );
  if (status === 'pending') return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs shrink-0">
      <Clock className="w-3 h-3" /> Pendente
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs shrink-0">
      <XCircle className="w-3 h-3" /> Falhou
    </span>
  );
}
