import { ArrowUpRight, ArrowDownLeft, Calendar, Download } from 'lucide-react';
import { useState } from 'react';

export function Transactions() {
  const [filter, setFilter] = useState('all');

  const transactions = [
    {
      id: '1',
      type: 'buy',
      property: 'Ed. Central Plaza',
      amount: 'R$ 25.000,00',
      tokens: 100,
      date: '20/11/2025',
      status: 'completed',
      hash: '0x742d...8f2a'
    },
    {
      id: '2',
      type: 'income',
      property: 'Shopping Vila Nova',
      amount: 'R$ 980,00',
      tokens: 0,
      date: '15/11/2025',
      status: 'completed',
      hash: '0x8a3c...5b1d'
    },
    {
      id: '3',
      type: 'buy',
      property: 'Residencial Aurora',
      amount: 'R$ 18.000,00',
      tokens: 100,
      date: '10/11/2025',
      status: 'completed',
      hash: '0x1f5e...9c7a'
    },
    {
      id: '4',
      type: 'income',
      property: 'Ed. Central Plaza',
      amount: 'R$ 1.250,00',
      tokens: 0,
      date: '05/11/2025',
      status: 'completed',
      hash: '0x6d2b...4e8f'
    },
    {
      id: '5',
      type: 'sell',
      property: 'Tower Office Premium',
      amount: 'R$ 8.200,00',
      tokens: 25,
      date: '02/11/2025',
      status: 'completed',
      hash: '0x9a7c...2d3e'
    },
    {
      id: '6',
      type: 'buy',
      property: 'Tower Office Premium',
      amount: 'R$ 80.000,00',
      tokens: 250,
      date: '28/10/2025',
      status: 'completed',
      hash: '0x3e1f...7b9c'
    },
    {
      id: '7',
      type: 'income',
      property: 'Residencial Aurora',
      amount: 'R$ 750,00',
      tokens: 0,
      date: '15/10/2025',
      status: 'completed',
      hash: '0x5c8d...1a4f'
    },
    {
      id: '8',
      type: 'buy',
      property: 'Shopping Vila Nova',
      amount: 'R$ 150.000,00',
      tokens: 300,
      date: '05/10/2025',
      status: 'completed',
      hash: '0x7f2a...6e9b'
    }
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowDownLeft className="w-5 h-5 text-blue-500" />;
      case 'sell':
        return <ArrowUpRight className="w-5 h-5 text-orange-500" />;
      case 'income':
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Compra';
      case 'sell':
        return 'Venda';
      case 'income':
        return 'Rendimento';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-blue-50 text-blue-600';
      case 'sell':
        return 'bg-orange-50 text-orange-600';
      case 'income':
        return 'bg-green-50 text-green-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-slate-900 text-3xl mb-2">Transações</h1>
        <p className="text-slate-600">Histórico completo de todas as suas transações</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <p className="text-slate-600 text-sm mb-2">Total Investido</p>
          <p className="text-slate-900 text-2xl mb-1">R$ 273.000,00</p>
          <p className="text-slate-600 text-sm">8 transações</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <p className="text-slate-600 text-sm mb-2">Total Recebido</p>
          <p className="text-green-600 text-2xl mb-1">R$ 10.300,00</p>
          <p className="text-slate-600 text-sm">Rendimentos</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <p className="text-slate-600 text-sm mb-2">Total Vendas</p>
          <p className="text-orange-600 text-2xl mb-1">R$ 8.200,00</p>
          <p className="text-slate-600 text-sm">1 transação</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <p className="text-slate-600 text-sm mb-2">Saldo Líquido</p>
          <p className="text-slate-900 text-2xl mb-1">R$ -254.500,00</p>
          <p className="text-slate-600 text-sm">Balanço geral</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('buy')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'buy'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Compras
            </button>
            <button
              onClick={() => setFilter('sell')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'sell'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Vendas
            </button>
            <button
              onClick={() => setFilter('income')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'income'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Rendimentos
            </button>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Filtrar por Data
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Tipo</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Propriedade</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Valor</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Tokens</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Data</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Status</th>
                <th className="px-6 py-4 text-left text-sm text-slate-600">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(tx.type)}
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(tx.type)}`}>
                        {getTypeLabel(tx.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900">{tx.property}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`${
                      tx.type === 'income' || tx.type === 'sell'
                        ? 'text-green-600'
                        : 'text-slate-900'
                    }`}>
                      {tx.amount}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900">
                      {tx.tokens > 0 ? `${tx.tokens} tokens` : '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-600 text-sm">{tx.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
                      Concluído
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1">
                      {tx.hash}
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
