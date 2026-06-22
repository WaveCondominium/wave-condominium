import { useState } from 'react';
import { X, Wrench, AlertCircle } from 'lucide-react';

interface CreateMaintenanceModalProps {
  onClose: () => void;
  onCreate: (order: any) => void;
}

export function CreateMaintenanceModal({ onClose, onCreate }: CreateMaintenanceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Elétrica',
    priority: 'medium',
    description: '',
    location: ''
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.description) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const newOrder = {
      id: `OS-${Date.now().toString().slice(-3)}`,
      title: formData.title,
      priority: formData.priority,
      status: 'pending',
      openedDate: new Date().toLocaleDateString('pt-BR'),
      assignedTo: null,
      category: formData.category,
      hasDocument: false,
      description: formData.description,
      location: formData.location
    };

    onCreate(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100">
        <div className="sticky top-0 bg-white border-b border-blue-100 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-wave-400 rounded-xl">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-blue-900 text-2xl">Nova Ordem de Serviço</h2>
                <p className="text-blue-600 text-sm">Abra uma solicitação de manutenção</p>
              </div>
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
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-blue-900 mb-2">
                Título da Solicitação *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Reparo no Interfone do 5º andar"
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-blue-900 mb-2">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="Elétrica">Elétrica</option>
                  <option value="Hidráulica">Hidráulica</option>
                  <option value="Equipamento">Equipamento</option>
                  <option value="Iluminação">Iluminação</option>
                  <option value="Pintura">Pintura</option>
                  <option value="Limpeza">Limpeza</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Jardinagem">Jardinagem</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-blue-900 mb-2">Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-blue-900 mb-2">Local</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Hall do 5º andar, Garagem, Piscina..."
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-blue-900 mb-2">
                Descrição do Problema *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva detalhadamente o problema ou solicitação..."
                rows={5}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-blue-900 text-sm">
                    A ordem de serviço será registrada e enviada para análise do síndico/administradora. 
                    Você receberá atualizações sobre o andamento.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-wave-500 text-white rounded-xl hover:hover:bg-wave-600 transition-all shadow-lg"
            >
              Criar Ordem de Serviço
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
