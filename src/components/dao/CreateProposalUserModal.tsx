import { useState } from 'react';
import { X, FileText, Waves, AlertCircle } from 'lucide-react';

interface CreateProposalUserModalProps {
  onClose: () => void;
  onCreate: (proposal: {
    title: string;
    description: string;
    category: string;
    type: string;
    duration: number;
  }) => void;
}

export function CreateProposalUserModal({ onClose, onCreate }: CreateProposalUserModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Infraestrutura',
    type: 'Obra Útil',
    duration: 7
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wave-400 rounded-xl">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-blue-900 text-2xl">Nova Proposta</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-blue-900 mb-2">
              Título da Proposta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Instalação de Academia ao Ar Livre"
              required
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-blue-900 mb-2">
              Descrição Completa <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva os detalhes da proposta, benefícios esperados, custos estimados..."
              rows={6}
              required
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-900 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Infraestrutura">Infraestrutura</option>
                <option value="Sustentabilidade">Sustentabilidade</option>
                <option value="Segurança">Segurança</option>
                <option value="Prestadores">Prestadores</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Lazer">Lazer</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-900 mb-2">Tipo de Obra</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Obra Útil">Obra Útil</option>
                <option value="Obra Necessária">Obra Necessária</option>
                <option value="Obra Voluptuária">Obra Voluptuária</option>
                <option value="Alteração de Fachada">Alteração de Fachada</option>
                <option value="Alteração de Convenção">Alteração de Convenção</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-blue-900 mb-2">Prazo de Votação (dias)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 7 })}
              min="1"
              max="90"
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="text-orange-900 mb-1">Aprovação Necessária</h4>
                <p className="text-orange-700 text-sm">
                  Sua proposta será enviada para aprovação do administrador antes de ser 
                  publicada para votação dos moradores e registrada na rede Stellar.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-wave-500 text-white rounded-xl hover:hover:bg-wave-600 transition-all shadow-lg"
            >
              Enviar para Aprovação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
