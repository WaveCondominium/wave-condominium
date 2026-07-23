import { useState } from 'react';
import { X, Video, Calendar, Clock, Users, FileText, Link as LinkIcon } from 'lucide-react';

interface CreateMeetingModalProps {
  onClose: () => void;
  onCreate: (meeting: {
    title: string;
    description: string;
    date: string;
    time: string;
    duration: number;
    meetLink: string;
    maxParticipants: number;
    agenda: string[];
  }) => void;
}

export function CreateMeetingModal({ onClose, onCreate }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '19:00',
    duration: 120,
    meetLink: '',
    maxParticipants: 100,
    agenda: ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.meetLink) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (formData.agenda.filter(item => item.trim()).length === 0) {
      alert('Adicione pelo menos um item na pauta');
      return;
    }

    onCreate({
      ...formData,
      agenda: formData.agenda.filter(item => item.trim())
    });
  };

  const addAgendaItem = () => {
    setFormData({
      ...formData,
      agenda: [...formData.agenda, '']
    });
  };

  const updateAgendaItem = (index: number, value: string) => {
    const newAgenda = [...formData.agenda];
    newAgenda[index] = value;
    setFormData({ ...formData, agenda: newAgenda });
  };

  const removeAgendaItem = (index: number) => {
    setFormData({
      ...formData,
      agenda: formData.agenda.filter((_, i) => i !== index)
    });
  };

  const generateMeetLink = () => {
    const randomCode = Math.random().toString(36).substring(2, 15);
    const meetLink = `https://meet.google.com/${randomCode.slice(0, 3)}-${randomCode.slice(3, 7)}-${randomCode.slice(7, 10)}`;
    setFormData({ ...formData, meetLink });
  };

  return (
    <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wave-400 rounded-xl">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-blue-900 text-2xl">Agendar Nova Reunião</h2>
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
              Título da Reunião <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Assembleia Ordinária - Dezembro 2025"
              required
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-blue-900 mb-2">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o objetivo e principais tópicos da reunião..."
              rows={3}
              required
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-900 mb-2">
                Duração (minutos)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                min="15"
                max="300"
                step="15"
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-blue-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Limite de Participantes
              </label>
              <input
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 100 })}
                min="10"
                max="500"
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-900 mb-2 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Link do Google Meets <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.meetLink}
                onChange={(e) => setFormData({ ...formData, meetLink: e.target.value })}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                required
                className="flex-1 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={generateMeetLink}
                className="px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all"
                title="Gerar link de exemplo"
              >
                Gerar
              </button>
            </div>
            <p className="text-blue-600 text-xs mt-2">
              💡 Crie uma reunião no Google Calendar e copie o link do Meet, ou use o botão "Gerar" para um link de exemplo
            </p>
          </div>

          <div>
            <label className="block text-blue-900 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Pauta da Reunião <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {formData.agenda.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex items-center justify-center w-8 h-11 bg-blue-100 text-blue-700 rounded-lg">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateAgendaItem(index, e.target.value)}
                    placeholder={`Item ${index + 1} da pauta`}
                    className="flex-1 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {formData.agenda.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAgendaItem(index)}
                      className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAgendaItem}
              className="mt-3 w-full py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all border-2 border-dashed border-blue-300"
            >
              + Adicionar Item
            </button>
          </div>

          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
            <h4 className="text-cyan-900 mb-2">📋 Checklist antes de criar:</h4>
            <ul className="text-cyan-700 text-sm space-y-1">
              <li>✓ Verifique se a data e horário estão corretos</li>
              <li>✓ Teste o link do Google Meets antes de enviar</li>
              <li>✓ Confirme que todos os itens da pauta estão incluídos</li>
              <li>✓ Os moradores receberão uma notificação automática</li>
            </ul>
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
              Agendar Reunião
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
