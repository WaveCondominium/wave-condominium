'use client';

import { useState, useCallback } from 'react';
import { FileText, Upload, Search, CheckCircle, ExternalLink, Shield, Loader, X } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { registerDocumentOnChain, hashDocument } from '@/app/actions/blockchain';

interface DocumentRecord {
  id: string;
  title: string;
  category: string;
  stellarTxHash: string;
  contentHash: string;
  explorerUrl: string;
  registeredAt: string;
  registeredBy: string;
  fileName: string;
}

const categories = ['Ata', 'Laudo', 'Contrato', 'Comprovante', 'Regimento', 'Outros'];

export function DocumentsReal() {
  const { userProfile } = useUser();
  const [documents, setDocuments] = useLocalStorage<DocumentRecord[]>('wave_documents_stellar', []);

  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Ata',
    file: null as File | null,
  });

  const handleUpload = useCallback(async () => {
    setUploadError('');
    setUploadSuccess('');

    if (!uploadForm.title.trim()) {
      setUploadError('Preencha o título do documento.');
      return;
    }
    if (!uploadForm.file) {
      setUploadError('Selecione um arquivo.');
      return;
    }

    try {
      setUploading(true);

      // Lê o arquivo e gera o hash SHA-256
      const fileText = await uploadForm.file.text();
      const contentHash = await hashDocument(fileText);
      const cleanHash = contentHash.replace(/^0x/, '');

      // Registra o hash na Stellar via Server Action
      const result = await registerDocumentOnChain(cleanHash, userProfile.id || 'user');

      if (!result.success) {
        setUploadError(
          result.error?.includes('WAVE_STELLAR_SECRET')
            ? 'Variável WAVE_STELLAR_SECRET não configurada no servidor. Configure o .env.local para registrar documentos.'
            : `Erro ao registrar na rede: ${result.error}`
        );
        return;
      }

      const newDoc: DocumentRecord = {
        id: Date.now().toString(),
        title: uploadForm.title.trim(),
        category: uploadForm.category,
        stellarTxHash: result.txHash,
        contentHash: `0x${cleanHash}`,
        explorerUrl: result.explorerUrl,
        registeredAt: result.timestamp,
        registeredBy: userProfile.name || 'Usuário',
        fileName: uploadForm.file.name,
      };

      setDocuments(prev => [newDoc, ...prev]);
      setUploadForm({ title: '', category: 'Ata', file: null });
      setUploadSuccess(`Documento registrado com sucesso! Hash ancorado na rede Stellar.`);

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setUploadError(`Erro inesperado: ${err?.message ?? 'tente novamente.'}`);
    } finally {
      setUploading(false);
    }
  }, [uploadForm, userProfile, setDocuments]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-wave-700 to-wave-500 min-h-screen relative">

      {/* Header */}
      <div className="mb-8 relative z-10">
        <h1 className="text-wave-800 text-2xl sm:text-3xl mb-2">Documentos</h1>
        <p className="text-wave-500">
          Registro imutável de documentos com verificação criptográfica na rede Stellar
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-6 mb-8 shadow-lg relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-wave-500" />
          <h2 className="text-wave-800 text-xl">Registrar Documento</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-wave-800 mb-2 text-sm">Título do Documento</label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
              placeholder="Ex: Ata da Assembleia — Janeiro 2026"
              className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
          </div>

          <div>
            <label className="block text-wave-800 mb-2 text-sm">Categoria</label>
            <select
              value={uploadForm.category}
              onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
              className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-wave-800 mb-2 text-sm">Arquivo</label>
          <input
            id="file-input"
            type="file"
            onChange={e => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
            className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800
              file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:bg-wave-100 file:text-wave-600 hover:file:bg-wave-200 cursor-pointer"
          />
          <p className="text-wave-400 text-xs mt-2">
            O arquivo é convertido em hash SHA-256 localmente — o conteúdo nunca é enviado à rede.
            Apenas o hash é registrado como prova de autenticidade.
          </p>
        </div>

        {uploadError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{uploadError}</p>
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-emerald-700 text-sm">{uploadSuccess}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !uploadForm.title || !uploadForm.file}
          className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            !uploading && uploadForm.title && uploadForm.file
              ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white hover:opacity-90 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {uploading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Registrando na rede Stellar...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Registrar Documento
            </>
          )}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-4 mb-6 shadow-lg relative z-10">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-wave-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full pl-10 pr-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-wave-100 shadow-lg text-center relative z-10">
          <FileText className="w-16 h-16 text-wave-300 mx-auto mb-4" />
          <h3 className="text-wave-800 text-xl mb-2">
            {documents.length === 0 ? 'Nenhum documento registrado' : 'Nenhum resultado encontrado'}
          </h3>
          <p className="text-wave-500">
            {documents.length === 0
              ? 'Registre seu primeiro documento para criar uma prova de autenticidade permanente.'
              : 'Ajuste os filtros de busca.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 relative z-10">
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-wave-500" />
                    <h3 className="text-wave-800 text-lg">{doc.title}</h3>
                    <span className="px-3 py-1 bg-wave-100 text-wave-600 rounded-full text-xs">
                      {doc.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-wave-500">
                    <span>Arquivo: {doc.fileName}</span>
                    <span>•</span>
                    <span>Registrado em: {new Date(doc.registeredAt).toLocaleString('pt-BR')}</span>
                    <span>•</span>
                    <span>Por: {doc.registeredBy}</span>
                  </div>
                </div>
                <span className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs shrink-0">
                  <CheckCircle className="w-3 h-3" />
                  Verificado
                </span>
              </div>

              <div className="bg-wave-50 rounded-xl p-4 mb-4 space-y-2">
                <div>
                  <p className="text-wave-400 text-xs mb-1">Hash SHA-256 do documento</p>
                  <p className="text-wave-700 text-xs font-mono break-all">{doc.contentHash}</p>
                </div>
                {doc.stellarTxHash && (
                  <div>
                    <p className="text-wave-400 text-xs mb-1">Transação Stellar</p>
                    <p className="text-wave-700 text-xs font-mono break-all">{doc.stellarTxHash}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <a
                  href={doc.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver prova na Stellar
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-r from-wave-700 to-wave-500 rounded-2xl p-6 border border-wave-200 shadow-lg relative z-10">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-wave-300 shrink-0 mt-1" />
          <div>
            <h3 className="text-wave-800 mb-2">Cartório Digital</h3>
            <p className="text-wave-600 text-sm mb-3">
              Cada documento é convertido em um hash SHA-256 que funciona como sua impressão digital.
              Esse hash é registrado permanentemente na rede Stellar, criando uma prova de existência
              com data e hora verificável por qualquer parte, a qualquer momento.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-wave-500">
              <span>Documentos registrados: {documents.length}</span>
              <span>•</span>
              <span>Rede: Stellar Testnet</span>
              <span>•</span>
              <span>Verificação: stellar.expert</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
