import { useState } from 'react';
import { X, Upload, FileText, Waves } from 'lucide-react';

interface UploadDocumentModalProps {
  onClose: () => void;
  onUpload: (document: {
    name: string;
    category: string;
    version: string;
    size: string;
    uploadedBy: string;
  }) => void;
}

export function UploadDocumentModal({ onClose, onUpload }: UploadDocumentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Atas',
    version: '1.0',
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, file, name: formData.name || file.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.file) {
      alert('Por favor, preencha todos os campos e selecione um arquivo');
      return;
    }

    const sizeInMB = (formData.file.size / (1024 * 1024)).toFixed(1);
    
    onUpload({
      name: formData.name,
      category: formData.category,
      version: formData.version,
      size: `${sizeInMB} MB`,
      uploadedBy: 'João Silva - Apto 504'
    });
  };

  return (
    <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wave-400 rounded-xl">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-blue-900 text-2xl">Upload de Documento</h2>
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
              Nome do Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Ata da Assembleia - Dezembro 2025"
              required
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-900 mb-2">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Atas">Atas</option>
                <option value="Regimento">Regimento</option>
                <option value="Convenção">Convenção</option>
                <option value="Laudos">Laudos</option>
                <option value="Certidões">Certidões</option>
                <option value="Contratos">Contratos</option>
              </select>
            </div>

            <div>
              <label className="block text-blue-900 mb-2">Versão</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0"
                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-blue-900 mb-2">
              Arquivo <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-blue-50">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
                id="file-upload"
                required
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {formData.file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div className="text-left">
                      <p className="text-blue-900">{formData.file.name}</p>
                      <p className="text-blue-600 text-sm">
                        {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-blue-600 mb-1">Clique para selecionar ou arraste o arquivo</p>
                    <p className="text-blue-500 text-sm">PDF, DOC ou DOCX (máx. 10MB)</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-blue-900 mb-1">Registro Stellar</h4>
                <p className="text-blue-700 text-sm">
                  Este documento será registrado na rede Stellar com hash único,
                  garantindo autenticidade e imutabilidade permanentes.
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
              Fazer Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}