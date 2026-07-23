import { Mail, Phone, MapPin, Shield, Bell, Key, History, Award, Home } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { toast } from 'sonner';

interface ProfileProps {
  userProfile: {
    name: string;
    unit: string;
    role: string;
    email: string;
    avatar: string;
  };
}

export function Profile({ userProfile }: ProfileProps) {
  const votingHistory = [
    { proposal: 'Instalação de Painéis Solares', vote: 'A favor', date: '01/12/2025' },
    { proposal: 'Contratação de Nova Empresa de Limpeza', vote: 'A favor', date: '05/11/2025' },
    { proposal: 'Aumento da Taxa Condominial em 15%', vote: 'Contra', date: '01/11/2025' },
    { proposal: 'Implementação de Coleta Seletiva', vote: 'A favor', date: '28/10/2025' }
  ];

  const [boletos] = useLocalStorage<any[]>('wave_boletos', []);
  const paidBoletos = boletos
    .filter((b: any) => b.status === 'blockchain_registered' || b.status === 'paid' || b.status === 'compensated')
    .slice(0, 6);

  const paymentHistory = paidBoletos.length > 0
    ? paidBoletos.map((b: any) => ({
        month: b.description || b.referenceMonth,
        amount: `R$ ${b.amount?.toFixed(2).replace('.', ',')}`,
        status: 'Pago',
        date: b.paidAt ? new Date(b.paidAt).toLocaleDateString('pt-BR') : '—',
        explorerUrl: b.stellarExplorerUrl,
        txHash: b.blockchainHash,
      }))
    : [
        { month: 'Julho 2026', amount: 'R$ 850,00', status: 'Pago', date: '05/07/2026', explorerUrl: null, txHash: null },
        { month: 'Junho 2026', amount: 'R$ 850,00', status: 'Pago', date: '03/06/2026', explorerUrl: null, txHash: null },
      ];

  const achievements = [
    { title: 'Participação Ativa', description: 'Votou em mais de 10 propostas', icon: Award, color: 'bg-yellow-100 text-yellow-600' },
    { title: 'Pagador Pontual', description: '12 meses sem atraso', icon: Shield, color: 'bg-green-100 text-green-600' },
    { title: 'Membro Fundador', description: 'Desde o início da plataforma', icon: Key, color: 'bg-wave-100 text-wave-500' }
  ];

  const handleEditProfile = () => {
    toast.info('Funcionalidade de edição de perfil em desenvolvimento!', {
      description: 'Em breve você poderá editar suas informações.'
    });
  };

  const handleViewFullHistory = () => {
    toast.info('Histórico completo de votações', {
      description: 'Visualização completa com exportação em PDF em desenvolvimento.'
    });
  };

  const handleSavePreferences = () => {
    toast.success('Preferências salvas com sucesso!', {
      description: 'Suas configurações de notificação foram atualizadas.'
    });
  };

  const handleChangePassword = () => {
    toast.info('Alteração de senha', {
      description: 'Você será redirecionado para alterar sua senha.'
    });
  };

  const handleTwoFactorAuth = () => {
    toast.success('Autenticação em duas etapas está ativa', {
      description: 'Sua conta está protegida com 2FA.'
    });
  };

  const handleActiveSessions = () => {
    toast.info('Sessões ativas', {
      description: '2 dispositivos conectados: Desktop (agora) e Mobile (2h atrás)'
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-slate-900 text-2xl sm:text-3xl mb-2">Meu Perfil</h1>
        <p className="text-slate-600">Gerencie suas informações e preferências</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-wave-700 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-3xl">{userProfile.avatar}</span>
              </div>
              <h2 className="text-slate-900 text-xl mb-1">{userProfile.name}</h2>
              <div className="flex items-center justify-center gap-2 text-slate-600 mb-2">
                <Home className="w-4 h-4" />
                <p>{userProfile.unit}</p>
              </div>
              <span className="inline-block mt-2 px-3 py-1 bg-wave-100 text-wave-500 rounded-full text-sm">
                {userProfile.role}
              </span>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{userProfile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">(11) 98765-4321</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">São Paulo, SP</span>
              </div>
            </div>

            <button className="w-full mt-6 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" onClick={handleEditProfile}>
              Editar Perfil
            </button>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-slate-900 mb-4">Conquistas</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`p-2 ${achievement.color} rounded-lg`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-slate-900">{achievement.title}</p>
                      <p className="text-slate-600 text-sm">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-wave-400" />
              <h3 className="text-lg">Dados de Registro</h3>
            </div>
            <p className="text-slate-300 text-sm mb-3">
              Seus dados estão protegidos e registrados de forma segura na rede Stellar
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Votos Registrados:</span>
                <span className="text-white">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pagamentos:</span>
                <span className="text-white">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Documentos Acessados:</span>
                <span className="text-white">48</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity and Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Voting History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-wave-500" />
              <h3 className="text-slate-900 text-lg">Histórico de Votos</h3>
            </div>
            <div className="space-y-3">
              {votingHistory.map((vote, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-slate-900 mb-1">{vote.proposal}</p>
                    <p className="text-slate-600 text-sm">{vote.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    vote.vote === 'A favor'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {vote.vote}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-wave-500 hover:bg-wave-50 rounded-lg transition-colors" onClick={handleViewFullHistory}>
              Ver Histórico Completo
            </button>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="text-slate-900 text-lg">Histórico de Pagamentos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-slate-600">Período</th>
                    <th className="px-4 py-3 text-left text-sm text-slate-600">Valor</th>
                    <th className="px-4 py-3 text-left text-sm text-slate-600">Data</th>
                    <th className="px-4 py-3 text-left text-sm text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentHistory.map((payment, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900">{payment.month}</td>
                      <td className="px-4 py-3 text-slate-900">{payment.amount}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{payment.date}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-orange-500" />
              <h3 className="text-slate-900 text-lg">Preferências de Notificação</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-slate-900">Novas Propostas</p>
                  <p className="text-slate-600 text-sm">Receber notificação de novas votações</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-wave-500" />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-slate-900">Transações Financeiras</p>
                  <p className="text-slate-600 text-sm">Alertas de despesas e receitas</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-wave-500" />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-slate-900">Manutenções</p>
                  <p className="text-slate-600 text-sm">Atualizações de solicitações</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-wave-500" />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-slate-900">Avisos Importantes</p>
                  <p className="text-slate-600 text-sm">Comunicados da administração</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-wave-500" />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                <div>
                  <p className="text-slate-900">E-mail Semanal</p>
                  <p className="text-slate-600 text-sm">Resumo semanal das atividades</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-wave-500" />
              </label>
            </div>

            <button className="w-full mt-6 py-3 bg-wave-500 text-white rounded-lg hover:bg-wave-500 transition-colors" onClick={handleSavePreferences}>
              Salvar Preferências
            </button>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-red-500" />
              <h3 className="text-slate-900 text-lg">Segurança</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left" onClick={handleChangePassword}>
                <p className="text-slate-900 mb-1">Alterar Senha</p>
                <p className="text-slate-600 text-sm">Última alteração: 15/09/2025</p>
              </button>
              <button className="w-full p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left" onClick={handleTwoFactorAuth}>
                <p className="text-slate-900 mb-1">Autenticação em Duas Etapas</p>
                <p className="text-green-600 text-sm">Ativo</p>
              </button>
              <button className="w-full p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left" onClick={handleActiveSessions}>
                <p className="text-slate-900 mb-1">Sessões Ativas</p>
                <p className="text-slate-600 text-sm">2 dispositivos conectados</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}