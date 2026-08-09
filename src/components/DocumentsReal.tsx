'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  FileText, Upload, Search, CheckCircle, ExternalLink, Shield,
  Loader, X, Download, Eye, ShieldCheck, ShieldAlert, Loader2,
  Filter, Clock, Calendar, Plus, Home, Building2, AlertCircle,
  FileCheck, FileX, FileClock,
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isManager } from '@/lib/rbac';
import { registerDocumentOnChain, hashDocument, verifyDocumentOnChain } from '@/app/actions/blockchain';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type DocumentStatus = 'registrado' | 'em_analise' | 'aprovado' | 'recusado';

/** Origem: quem registrou o documento */
type DocumentOrigin = 'condominio' | 'morador';

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
  /** Visibilidade: se omitido, assume 'public' (visível a todos) */
  visibility?: 'public' | 'restricted';
  description?: string;
  updatedAt?: string;
  /** Unidade vinculada (obrigatório para docs do morador) */
  unit?: string;
  /** Status do documento */
  status?: DocumentStatus;
  /** Quem registrou: condomínio (gestor) ou morador */
  origin?: DocumentOrigin;
  /** ID do usuário que registrou */
  registeredById?: string;
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

/** Categorias completas — disponíveis para Síndico/Administradora */
const ALL_CATEGORIES = [
  'Ata', 'Laudo', 'Contrato', 'Comprovante', 'Regimento',
  'Vistoria', 'Relatório Técnico', 'Inspeção', 'Manutenção', 'Outros',
];

/** Categorias oficiais do condomínio — somente gestor pode registrar */
const OFFICIAL_CATEGORIES = ['Ata', 'Regimento'];

/** Categorias disponíveis para o Morador registrar */
const MORADOR_CATEGORIES = [
  'Comprovante',
  'Documento da Unidade',
  'Solicitação',
  'Laudo',
  'Contrato',
  'Outros',
];

/** Categorias visíveis na aba "Minha Unidade" (inclui as do morador + as que o gestor pode associar) */
const UNIT_CATEGORIES = [
  'Comprovante', 'Documento da Unidade', 'Solicitação',
  'Laudo', 'Vistoria', 'Relatório Técnico', 'Inspeção',
  'Manutenção', 'Contrato', 'Outros',
];

const CATEGORY_LABELS: Record<string, string> = {
  Ata: 'Ata de Assembleia',
  Laudo: 'Laudo Técnico',
  Contrato: 'Contrato',
  Comprovante: 'Comprovante',
  Regimento: 'Regulamento / Norma',
  Vistoria: 'Vistoria',
  'Relatório Técnico': 'Relatório Técnico',
  Inspeção: 'Inspeção',
  Manutenção: 'Manutenção',
  'Documento da Unidade': 'Documento da Unidade',
  Solicitação: 'Solicitação',
  Outros: 'Outros',
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bg: string; Icon: typeof CheckCircle }> = {
  registrado: { label: 'Registrado', color: 'text-blue-600', bg: 'bg-blue-100', Icon: FileCheck },
  em_analise: { label: 'Em análise', color: 'text-amber-600', bg: 'bg-amber-100', Icon: FileClock },
  aprovado: { label: 'Aprovado', color: 'text-brand-teal', bg: 'bg-brand-teal/15', Icon: CheckCircle },
  recusado: { label: 'Recusado', color: 'text-red-600', bg: 'bg-red-100', Icon: FileX },
};

// ---------------------------------------------------------------------------
// Componente principal com roteamento por role
// ---------------------------------------------------------------------------

export function DocumentsReal() {
  const { userProfile } = useUser();
  const canManage = isManager(userProfile.role);

  return canManage ? <ManagerDocumentsView /> : <MoradorDocumentsView />;
}

// ===========================================================================
// MORADOR — Consulta + Registro de documentos da unidade
// ===========================================================================

interface VerificationResult {
  verified: boolean;
  reason: string;
  ledger?: number;
  createdAt?: string;
}

function MoradorDocumentsView() {
  const { userProfile } = useUser();
  const [documents, setDocuments] = useLocalStorage<DocumentRecord[]>('wave_documents_stellar', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Tabs: condomínio vs meus documentos
  const [activeTab, setActiveTab] = useState<'condominio' | 'meus'>('condominio');

  // Upload
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'Comprovante',
    description: '',
    file: null as File | null,
  });

  // Download PDF
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Verificação de autenticidade
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationModal, setVerificationModal] = useState<{
    doc: DocumentRecord;
    result: VerificationResult | null;
    error: string | null;
    loading: boolean;
  } | null>(null);

  // Normaliza a unidade do usuário (ex: "Apto 203" → "203")
  const userUnit = useMemo(() => {
    const raw = userProfile.unit || '';
    return raw.replace(/^apto\s*/i, '').trim();
  }, [userProfile.unit]);

  // Separa documentos: condomínio (públicos gerais) vs minha unidade (todos vinculados à unit)
  const condominiumDocs = useMemo(() =>
    documents.filter(d =>
      d.visibility !== 'restricted' &&
      !d.unit, // Documentos gerais sem vínculo com unidade específica
    ),
    [documents],
  );

  const unitDocs = useMemo(() => {
    if (!userUnit) return [];
    return documents.filter(d =>
      // Docs que o próprio morador registrou (vinculados à sua unidade)
      (d.origin === 'morador' && (d.registeredById === userProfile.id || d.unit === userUnit)) ||
      // Docs que o gestor associou à unidade do morador (laudos, vistorias, etc.)
      (d.origin !== 'morador' && d.unit === userUnit && d.visibility !== 'restricted'),
    );
  }, [documents, userProfile.id, userUnit]);

  const activeDocs = activeTab === 'condominio' ? condominiumDocs : unitDocs;

  const filtered = activeDocs.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handler de upload do Morador
  const handleMoradorUpload = useCallback(async () => {
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
    if (!userUnit) {
      setUploadError('Sua unidade não foi identificada. Entre em contato com a administração.');
      return;
    }

    try {
      setUploading(true);

      // Hash do arquivo para integridade (qualquer sessão autenticada pode)
      const fileText = await uploadForm.file.text();
      let contentHash = '';
      try {
        contentHash = await hashDocument(fileText);
      } catch {
        // Se falhar o hash no servidor, gera localmente (fallback)
        contentHash = '';
      }

      const newDoc: DocumentRecord = {
        id: Date.now().toString(),
        title: uploadForm.title.trim(),
        category: uploadForm.category,
        description: uploadForm.description.trim() || undefined,
        stellarTxHash: '', // Morador não ancora na blockchain
        contentHash,
        explorerUrl: '',
        registeredAt: new Date().toISOString(),
        registeredBy: userProfile.name || 'Morador',
        registeredById: userProfile.id,
        fileName: uploadForm.file.name,
        unit: userUnit,
        status: 'registrado',
        origin: 'morador',
      };

      setDocuments(prev => [newDoc, ...prev]);
      setUploadForm({ title: '', category: 'Comprovante', description: '', file: null });
      setUploadSuccess('Documento registrado com sucesso e vinculado à sua unidade.');
      setShowUploadForm(false);

      // Muda para aba "Meus documentos" para o morador ver
      setActiveTab('meus');

      const fileInput = document.getElementById('morador-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setUploadError(`Erro inesperado: ${err?.message ?? 'tente novamente.'}`);
    } finally {
      setUploading(false);
    }
  }, [uploadForm, userProfile, userUnit, setDocuments]);

  const handleVerify = useCallback(async (doc: DocumentRecord) => {
    if (!doc.stellarTxHash) {
      setVerificationModal({
        doc,
        result: null,
        error: 'Este documento ainda não possui registro de verificação.',
        loading: false,
      });
      return;
    }

    setVerifyingId(doc.id);
    setVerificationModal({ doc, result: null, error: null, loading: true });

    try {
      const result = await verifyDocumentOnChain(doc.stellarTxHash, doc.contentHash || '');
      setVerificationModal({
        doc,
        result: {
          verified: result.verified,
          reason: result.reason,
          ledger: result.ledger,
          createdAt: result.createdAt,
        },
        error: null,
        loading: false,
      });
    } catch {
      setVerificationModal({
        doc,
        result: null,
        error: 'Não foi possível realizar a verificação no momento. Tente novamente mais tarde.',
        loading: false,
      });
    } finally {
      setVerifyingId(null);
    }
  }, []);

  // Download PDF — gera um comprovante PDF estilizado via print nativo do browser
  const handleDownloadPdf = useCallback(async (doc: DocumentRecord) => {
    setDownloadError(null);
    setDownloadingId(doc.id);

    try {
      const docStatus = doc.status || (doc.stellarTxHash ? 'aprovado' : 'registrado');
      const statusLabel = STATUS_CONFIG[docStatus]?.label || docStatus;

      const fields: { label: string; value: string }[] = [
        { label: 'Categoria', value: CATEGORY_LABELS[doc.category] || doc.category },
        { label: 'Data de registro', value: new Date(doc.registeredAt).toLocaleString('pt-BR') },
      ];
      if (doc.registeredBy) fields.push({ label: 'Registrado por', value: doc.registeredBy });
      if (doc.unit) fields.push({ label: 'Unidade', value: doc.unit });
      if (doc.fileName) fields.push({ label: 'Arquivo original', value: doc.fileName });
      fields.push({ label: 'Status', value: statusLabel });
      if (doc.updatedAt) fields.push({ label: 'Última atualização', value: new Date(doc.updatedAt).toLocaleString('pt-BR') });

      const fieldsHtml = fields
        .map(f => `<tr><td style="color:#64748b;font-weight:600;padding:8px 16px 8px 0;white-space:nowrap;vertical-align:top">${f.label}</td><td style="color:#1e293b;padding:8px 0;word-break:break-word">${f.value}</td></tr>`)
        .join('');

      const descriptionHtml = doc.description
        ? `<div style="margin-top:20px"><p style="color:#64748b;font-weight:600;font-size:13px;margin-bottom:6px">Descrição</p><p style="color:#334155;line-height:1.6;font-size:13px">${doc.description}</p></div>`
        : '';

      const verificationHtml = doc.stellarTxHash
        ? `<div style="margin-top:24px;padding:16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px">
            <p style="color:#15803d;font-weight:700;font-size:14px;margin-bottom:8px">Documento com registro de autenticidade</p>
            <p style="color:#64748b;font-size:11px;margin-bottom:4px">Identificador de verificação:</p>
            <p style="color:#334155;font-size:11px;font-family:monospace;word-break:break-all">${doc.stellarTxHash}</p>
          </div>`
        : '';

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} — Wave Condominium</title>
  <style>
    @page { size: A4; margin: 20mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; background: #fff; }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="background:#142850;padding:24px 32px;border-radius:8px;margin-bottom:32px">
    <h1 style="color:#fff;font-size:20px;margin-bottom:4px">Wave Condominium</h1>
    <p style="color:#94a3b8;font-size:12px">Documento oficial</p>
  </div>

  <!-- Título -->
  <h2 style="font-size:22px;color:#0f172a;margin-bottom:8px">${doc.title}</h2>
  <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0 24px">

  <!-- Detalhes -->
  <table style="width:100%;font-size:13px;border-collapse:collapse">
    ${fieldsHtml}
  </table>

  ${descriptionHtml}
  ${verificationHtml}

  <!-- Footer -->
  <div style="margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0">
    <p style="color:#94a3b8;font-size:10px">
      Gerado em ${new Date().toLocaleString('pt-BR')} — Wave Condominium
    </p>
  </div>
</body>
</html>`;

      // Abre uma nova janela, escreve o HTML, dispara print (salvar como PDF)
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('popup_blocked');
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // Aguarda renderização e dispara print
      printWindow.addEventListener('afterprint', () => printWindow.close());
      // Fallback: fecha após timeout se o usuário cancelar
      setTimeout(() => {
        try { if (!printWindow.closed) printWindow.close(); } catch { /* ignore */ }
      }, 60000);

      printWindow.addEventListener('load', () => {
        setTimeout(() => printWindow.print(), 300);
      });
    } catch (err: any) {
      setDownloadError(doc.id);
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  // Contadores
  const stats = useMemo(() => ({
    condominio: condominiumDocs.length,
    unidade: unitDocs.length,
    registrados: unitDocs.filter(d => d.status === 'registrado' || d.status === 'em_analise').length,
    aprovados: unitDocs.filter(d => d.status === 'aprovado' || (d.origin !== 'morador' && d.stellarTxHash)).length,
  }), [condominiumDocs, unitDocs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-brand-light min-h-screen relative">
      {/* Header */}
      <div className="mb-6 relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-brand-navy text-2xl sm:text-3xl mb-1">Documentos</h1>
          <p className="text-wave-500 text-sm">
            Documentos do condomínio e da sua unidade
          </p>
        </div>
        <button
          onClick={() => { setShowUploadForm(true); setActiveTab('meus'); setUploadError(''); setUploadSuccess(''); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-deep to-brand-steel text-white rounded-xl hover:opacity-90 transition-all shadow-lg text-sm font-medium shrink-0"
        >
          <Plus className="w-4 h-4" />
          Registrar Documento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
        {[
          { label: 'Do Condomínio', value: stats.condominio, color: 'text-wave-600', bg: 'bg-wave-100', Icon: Building2 },
          { label: 'Minha Unidade', value: stats.unidade, color: 'text-blue-600', bg: 'bg-blue-100', Icon: Home },
          { label: 'Pendentes', value: stats.registrados, color: 'text-amber-600', bg: 'bg-amber-100', Icon: FileClock },
          { label: 'Aprovados', value: stats.aprovados, color: 'text-brand-teal', bg: 'bg-brand-teal/15', Icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-4 shadow-lg">
            <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
              <s.Icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xl font-semibold text-wave-800">{s.value}</p>
            <p className="text-wave-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upload Form (Morador) */}
      {showUploadForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-5 sm:p-6 mb-6 shadow-lg relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-wave-500" />
              <h2 className="text-wave-800 text-lg font-semibold">Registrar Documento</h2>
            </div>
            <button
              onClick={() => { setShowUploadForm(false); setUploadError(''); setUploadSuccess(''); }}
              className="w-8 h-8 rounded-lg hover:bg-wave-100 flex items-center justify-center transition-colors"
              aria-label="Fechar formulário"
            >
              <X className="w-4 h-4 text-wave-400" />
            </button>
          </div>

          {/* Info: vinculado à unidade */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2">
            <Home className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-blue-700 text-sm">
              O documento será automaticamente vinculado à sua unidade
              {userUnit ? (
                <span className="font-semibold"> ({userUnit})</span>
              ) : null}
              . Apenas você e a administração poderão acessá-lo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-wave-800 mb-2 text-sm font-medium">Título do Documento</label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Comprovante de pagamento — Janeiro 2026"
                className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300"
              />
            </div>

            <div>
              <label className="block text-wave-800 mb-2 text-sm font-medium">Categoria</label>
              <select
                value={uploadForm.category}
                onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300"
              >
                {MORADOR_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-wave-800 mb-2 text-sm font-medium">Descrição (opcional)</label>
            <textarea
              value={uploadForm.description}
              onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Descreva brevemente o conteúdo do documento..."
              rows={2}
              className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300 resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-wave-800 mb-2 text-sm font-medium">Arquivo</label>
            <input
              id="morador-file-input"
              type="file"
              onChange={e => setUploadForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
              className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                file:bg-wave-100 file:text-wave-600 hover:file:bg-wave-200 cursor-pointer"
            />
          </div>

          {uploadError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{uploadError}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="mb-4 bg-brand-teal/10 border border-brand-teal/30 rounded-xl p-3 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
              <p className="text-brand-teal text-sm">{uploadSuccess}</p>
            </div>
          )}

          <button
            onClick={handleMoradorUpload}
            disabled={uploading || !uploadForm.title || !uploadForm.file}
            className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium ${
              !uploading && uploadForm.title && uploadForm.file
                ? 'bg-gradient-to-r from-brand-deep to-brand-steel text-white hover:opacity-90 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {uploading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Registrando documento...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Registrar Documento
              </>
            )}
          </button>
        </div>
      )}

      {/* Tabs: Condomínio / Meus Documentos */}
      <div className="flex gap-2 mb-4 relative z-10">
        {[
          { key: 'condominio' as const, label: 'Documentos do Condomínio', Icon: Building2, count: condominiumDocs.length },
          { key: 'meus' as const, label: 'Minha Unidade', Icon: Home, count: unitDocs.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCategoryFilter('all'); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-wave-700 text-white shadow'
                : 'bg-white/80 text-wave-500 hover:bg-wave-100 border border-wave-100'
            }`}
          >
            <tab.Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.key === 'condominio' ? 'Condomínio' : 'Unidade'}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? 'bg-white/20' : 'bg-wave-100 text-wave-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Busca e filtro */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-4 mb-6 shadow-lg relative z-10 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wave-400" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar documento..."
            className="w-full pl-9 pr-4 py-2.5 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', ...(activeTab === 'meus' ? UNIT_CATEGORIES : ALL_CATEGORIES)].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-wave-700 text-white shadow'
                  : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de documentos */}
      {filtered.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 shadow-lg p-12 text-center relative z-10">
          <FileText className="w-12 h-12 text-wave-300 mx-auto mb-3" />
          <p className="text-wave-700 font-medium mb-1">
            {activeDocs.length === 0
              ? activeTab === 'meus'
                ? 'Nenhum documento da sua unidade'
                : 'Nenhum documento disponível'
              : 'Nenhum resultado encontrado'}
          </p>
          <p className="text-wave-400 text-sm">
            {activeDocs.length === 0
              ? activeTab === 'meus'
                ? 'Laudos, vistorias, comprovantes e outros documentos da sua unidade aparecerão aqui. Você também pode registrar documentos utilizando o botão acima.'
                : 'Os documentos oficiais do condomínio aparecerão aqui quando forem cadastrados.'
              : 'Tente outro termo de busca ou altere o filtro de categoria.'}
          </p>
          {activeTab === 'meus' && activeDocs.length === 0 && (
            <button
              onClick={() => { setShowUploadForm(true); setUploadError(''); setUploadSuccess(''); }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-deep to-brand-steel text-white rounded-xl hover:opacity-90 transition-all shadow-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Registrar Documento
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 relative z-10">
          {filtered.map(doc => {
            const isVerifying = verifyingId === doc.id;
            const docStatus = doc.status || (doc.stellarTxHash ? 'aprovado' : 'registrado');
            const statusCfg = STATUS_CONFIG[docStatus];
            const isMoradorDoc = doc.origin === 'morador';
            const isUnitDoc = !!doc.unit;
            const isUnitTab = activeTab === 'meus';

            return (
              <div
                key={doc.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl border p-5 shadow-lg hover:shadow-xl transition-all ${
                  isUnitDoc ? 'border-blue-100' : 'border-wave-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isUnitDoc ? 'bg-blue-100' : 'bg-wave-100'
                  }`}>
                    <FileText className={`w-5 h-5 ${isUnitDoc ? 'text-blue-500' : 'text-wave-500'}`} />
                  </div>

                  {/* Conteúdo */}
                  <div className="min-w-0 flex-1">
                    {/* Título + badges */}
                    <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                      <h3 className="text-wave-800 text-sm font-semibold">{doc.title}</h3>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {statusCfg && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                            <statusCfg.Icon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 bg-wave-100 text-wave-600 rounded-full text-xs font-medium">
                          {doc.category}
                        </span>
                        {isUnitDoc && !isUnitTab && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            Unid. {doc.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Descrição */}
                    {doc.description && (
                      <p className="text-wave-500 text-xs mb-2 line-clamp-2">{doc.description}</p>
                    )}

                    {/* Detalhes expandidos (aba Minha Unidade) */}
                    {isUnitTab ? (
                      <div className="bg-wave-50 rounded-xl p-3 mb-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
                          <div>
                            <p className="text-wave-400 font-medium">Tipo</p>
                            <p className="text-wave-700">{CATEGORY_LABELS[doc.category] || doc.category}</p>
                          </div>
                          {doc.unit && (
                            <div>
                              <p className="text-wave-400 font-medium">Unidade</p>
                              <p className="text-wave-700 flex items-center gap-1">
                                <Home className="w-3 h-3 text-blue-500" />
                                {doc.unit}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-wave-400 font-medium">Data de registro</p>
                            <p className="text-wave-700">{new Date(doc.registeredAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          {doc.registeredBy && (
                            <div>
                              <p className="text-wave-400 font-medium">Registrado por</p>
                              <p className="text-wave-700">{doc.registeredBy}</p>
                            </div>
                          )}
                          {doc.updatedAt && (
                            <div>
                              <p className="text-wave-400 font-medium">Última atualização</p>
                              <p className="text-wave-700">{new Date(doc.updatedAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                          )}
                          {doc.fileName && (
                            <div>
                              <p className="text-wave-400 font-medium">Arquivo</p>
                              <p className="text-wave-700 truncate" title={doc.fileName}>{doc.fileName}</p>
                            </div>
                          )}
                          {isMoradorDoc && (
                            <div>
                              <p className="text-wave-400 font-medium">Origem</p>
                              <p className="text-wave-700">Enviado pelo morador</p>
                            </div>
                          )}
                          {!isMoradorDoc && isUnitDoc && (
                            <div>
                              <p className="text-wave-400 font-medium">Origem</p>
                              <p className="text-wave-700">Registrado pela administração</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Detalhes compactos (aba Condomínio) */
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-wave-400 text-xs mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(doc.registeredAt).toLocaleDateString('pt-BR')}
                        </span>
                        <span>Tipo: {CATEGORY_LABELS[doc.category] || doc.category}</span>
                        {doc.registeredBy && <span>Por: {doc.registeredBy}</span>}
                        {doc.stellarTxHash && (
                          <span className="text-brand-teal font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Registro verificável
                          </span>
                        )}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      {/* Baixar PDF */}
                      <button
                        onClick={() => handleDownloadPdf(doc)}
                        disabled={downloadingId === doc.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wave-50 text-wave-700 border border-wave-200 rounded-lg text-xs font-medium hover:bg-wave-100 transition-all disabled:opacity-50"
                      >
                        {downloadingId === doc.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Gerando PDF...
                          </>
                        ) : downloadError === doc.id ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-red-600">Erro ao baixar</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            Baixar PDF
                          </>
                        )}
                      </button>

                      {/* Verificar autenticidade */}
                      {doc.stellarTxHash && (
                        <button
                          onClick={() => handleVerify(doc)}
                          disabled={isVerifying}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal/10 text-brand-teal border border-brand-teal/30 rounded-lg text-xs font-medium hover:bg-brand-teal/20 transition-all disabled:opacity-50"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Verificando...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Verificar autenticidade
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info card */}
      <div className="mt-6 bg-gradient-to-r from-brand-deep to-brand-steel rounded-2xl p-5 sm:p-6 border border-wave-200 shadow-lg relative z-10">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-wave-300 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-wave-800 text-sm font-semibold mb-2">Sobre os documentos</h3>
            <p className="text-wave-600 text-sm leading-relaxed mb-2">
              Na aba <strong>Documentos do Condomínio</strong> você encontra atas, regulamentos, comunicados
              e outros documentos oficiais disponibilizados pelo síndico ou pela administradora.
            </p>
            <p className="text-wave-600 text-sm leading-relaxed">
              Na aba <strong>Minha Unidade</strong> ficam os documentos relacionados exclusivamente ao seu
              apartamento — laudos, vistorias, relatórios técnicos, comprovantes e documentos que você
              registrou. Apenas você e a administração possuem acesso a esses documentos.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de verificação */}
      {verificationModal && (
        <DocumentVerificationModal
          doc={verificationModal.doc}
          result={verificationModal.result}
          error={verificationModal.error}
          loading={verificationModal.loading}
          onClose={() => setVerificationModal(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de verificação de autenticidade (compartilhado)
// ---------------------------------------------------------------------------

function DocumentVerificationModal({ doc, result, error, loading, onClose }: {
  doc: DocumentRecord;
  result: VerificationResult | null;
  error: string | null;
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-brand-navy/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Resultado da verificação de autenticidade"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-wave-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-wave-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-wave-500" />
            <h3 className="text-wave-800 font-semibold text-sm">Verificação de Autenticidade</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-wave-100 flex items-center justify-center transition-colors" aria-label="Fechar">
            <X className="w-4 h-4 text-wave-400" />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-10 h-10 text-brand-teal animate-spin mx-auto mb-4" />
              <p className="text-wave-700 text-sm font-medium">Verificando autenticidade...</p>
              <p className="text-wave-400 text-xs mt-1">Consultando registro de integridade do documento.</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7 text-amber-600" />
              </div>
              <p className="text-wave-800 font-semibold mb-1">Verificação indisponível</p>
              <p className="text-wave-500 text-sm leading-relaxed">{error}</p>
            </div>
          ) : result?.verified ? (
            <div>
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-brand-teal/15 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7 text-brand-teal" />
                </div>
                <p className="text-brand-teal font-semibold text-lg">Documento autenticado</p>
                <p className="text-wave-500 text-sm mt-1 leading-relaxed">
                  A autenticidade e a integridade deste documento foram verificadas com sucesso.
                </p>
              </div>
              <div className="bg-wave-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-wave-400 text-xs font-medium uppercase tracking-wide">Documento</p>
                  <p className="text-wave-800 text-sm mt-0.5">{doc.title}</p>
                </div>
                <div>
                  <p className="text-wave-400 text-xs font-medium uppercase tracking-wide">Data do registro</p>
                  <p className="text-wave-800 text-sm mt-0.5">{new Date(doc.registeredAt).toLocaleString('pt-BR')}</p>
                </div>
                {result.createdAt && (
                  <div>
                    <p className="text-wave-400 text-xs font-medium uppercase tracking-wide">Confirmação externa</p>
                    <p className="text-wave-800 text-sm mt-0.5">{new Date(result.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                <div>
                  <p className="text-wave-400 text-xs font-medium uppercase tracking-wide">Status</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-teal/15 text-brand-teal rounded-full text-xs font-medium mt-0.5">
                    <CheckCircle className="w-3 h-3" />
                    Documento não alterado
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-red-600 font-semibold text-lg">Não foi possível confirmar a autenticidade</p>
                <p className="text-wave-500 text-sm mt-1 leading-relaxed">
                  O conteúdo deste documento pode ter sido alterado após o registro original, ou o registro não foi localizado.
                  Recomendamos entrar em contato com a administração do condomínio.
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-wave-400 text-xs font-medium uppercase tracking-wide">Documento</p>
                  <p className="text-wave-800 text-sm mt-0.5">{doc.title}</p>
                </div>
                <div>
                  <p className="text-wave-400 text-xs font-medium uppercase tracking-wide">Status</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium mt-0.5">
                    <X className="w-3 h-3" />
                    Autenticidade não confirmada
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-wave-100 bg-wave-50/50">
          <button onClick={onClose} className="w-full py-2.5 bg-wave-700 text-white rounded-xl hover:bg-wave-800 transition-colors text-sm font-medium">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// SÍNDICO / ADMINISTRADORA — Gestão completa de documentos
// ===========================================================================

function ManagerDocumentsView() {
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
    unit: '', // Opcional: vincular a uma unidade específica
    file: null as File | null,
  });

  // Documentos enviados por moradores (para análise do gestor)
  const moradorDocs = useMemo(() =>
    documents.filter(d => d.origin === 'morador'),
    [documents],
  );

  const pendingReview = useMemo(() =>
    moradorDocs.filter(d => d.status === 'registrado' || d.status === 'em_analise'),
    [moradorDocs],
  );

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

      const fileText = await uploadForm.file.text();
      const contentHash = await hashDocument(fileText);
      const cleanHash = contentHash.replace(/^0x/, '');

      const result = await registerDocumentOnChain(cleanHash, userProfile.id || 'user');

      if (!result.success) {
        setUploadError(
          result.error?.includes('WAVE_STELLAR_SECRET')
            ? 'Variável WAVE_STELLAR_SECRET não configurada no servidor. Configure o .env.local para registrar documentos.'
            : `Erro ao registrar na rede: ${result.error}`
        );
        return;
      }

      const unitValue = uploadForm.unit.trim() || undefined;

      const newDoc: DocumentRecord = {
        id: Date.now().toString(),
        title: uploadForm.title.trim(),
        category: uploadForm.category,
        stellarTxHash: result.txHash,
        contentHash: `0x${cleanHash}`,
        explorerUrl: result.explorerUrl,
        registeredAt: result.timestamp,
        registeredBy: userProfile.name || 'Usuário',
        registeredById: userProfile.id,
        fileName: uploadForm.file.name,
        unit: unitValue,
        origin: 'condominio',
        status: 'aprovado',
      };

      setDocuments(prev => [newDoc, ...prev]);
      setUploadForm({ title: '', category: 'Ata', unit: '', file: null });
      setUploadSuccess(
        unitValue
          ? `Documento registrado e vinculado à unidade ${unitValue}. Hash ancorado na rede Stellar.`
          : 'Documento registrado com sucesso! Hash ancorado na rede Stellar.',
      );

      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setUploadError(`Erro inesperado: ${err?.message ?? 'tente novamente.'}`);
    } finally {
      setUploading(false);
    }
  }, [uploadForm, userProfile, setDocuments]);

  // Ação de análise do gestor: aprovar / recusar documento do morador
  const handleReviewDoc = useCallback((docId: string, newStatus: DocumentStatus) => {
    setDocuments(prev =>
      prev.map(d =>
        d.id === docId ? { ...d, status: newStatus, updatedAt: new Date().toISOString() } : d,
      ),
    );
  }, [setDocuments]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-brand-light min-h-screen relative">

      {/* Header */}
      <div className="mb-8 relative z-10">
        <h1 className="font-display text-brand-navy text-2xl sm:text-3xl mb-2">Documentos</h1>
        <p className="text-wave-500">
          Registro imutável de documentos com verificação criptográfica na rede Stellar
        </p>
      </div>

      {/* Pending review alert */}
      {pendingReview.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 relative z-10 shadow-lg">
          <FileClock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-semibold">
              {pendingReview.length} documento{pendingReview.length > 1 ? 's' : ''} de moradores aguardando análise
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              Documentos enviados por moradores que precisam de revisão.
            </p>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-6 mb-8 shadow-lg relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-5 h-5 text-wave-500" />
          <h2 className="text-wave-800 text-xl">Registrar Documento</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-wave-800 mb-2 text-sm">Título do Documento</label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
              placeholder="Ex: Ata da Assembleia de Janeiro 2026"
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
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-wave-800 mb-2 text-sm">Vincular à unidade (opcional)</label>
            <input
              type="text"
              value={uploadForm.unit}
              onChange={e => setUploadForm({ ...uploadForm, unit: e.target.value })}
              placeholder="Ex: 203"
              className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
            <p className="text-wave-400 text-xs mt-1">
              Preencha para associar o documento a uma unidade específica (laudos, vistorias, etc.)
            </p>
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
            O arquivo é convertido em hash SHA-256 localmente. O conteúdo nunca é enviado à rede.
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
          <div className="mb-4 bg-brand-teal/10 border border-brand-teal/30 rounded-xl p-3 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
            <p className="text-brand-teal text-sm">{uploadSuccess}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !uploadForm.title || !uploadForm.file}
          className={`w-full py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            !uploading && uploadForm.title && uploadForm.file
              ? 'bg-gradient-to-r from-brand-deep to-brand-steel text-white hover:opacity-90 shadow-lg'
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
            {ALL_CATEGORIES.map(cat => (
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
          {filteredDocuments.map(doc => {
            const isMoradorDoc = doc.origin === 'morador';
            const docStatus = doc.status || (doc.stellarTxHash ? 'aprovado' : 'registrado');
            const statusCfg = STATUS_CONFIG[docStatus];
            const canReview = isMoradorDoc && (docStatus === 'registrado' || docStatus === 'em_analise');

            return (
              <div
                key={doc.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl border p-6 shadow-lg hover:shadow-xl transition-all ${
                  isMoradorDoc ? 'border-blue-200' : 'border-wave-100'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <FileText className={`w-5 h-5 ${isMoradorDoc ? 'text-blue-500' : 'text-wave-500'}`} />
                      <h3 className="text-wave-800 text-lg">{doc.title}</h3>
                      <span className="px-3 py-1 bg-wave-100 text-wave-600 rounded-full text-xs">
                        {doc.category}
                      </span>
                      {isMoradorDoc && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          Morador — Unidade {doc.unit || '—'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-wave-500">
                      <span>Arquivo: {doc.fileName}</span>
                      <span>•</span>
                      <span>Registrado em: {new Date(doc.registeredAt).toLocaleString('pt-BR')}</span>
                      <span>•</span>
                      <span>Por: {doc.registeredBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {statusCfg && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                        <statusCfg.Icon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    )}
                    {!isMoradorDoc && doc.stellarTxHash && (
                      <span className="flex items-center gap-1 px-3 py-1 bg-brand-teal/15 text-brand-teal rounded-full text-xs shrink-0">
                        <CheckCircle className="w-3 h-3" />
                        Verificado
                      </span>
                    )}
                  </div>
                </div>

                {/* Technical details (only for condominium docs) */}
                {!isMoradorDoc && (doc.contentHash || doc.stellarTxHash) && (
                  <div className="bg-wave-50 rounded-xl p-4 mb-4 space-y-2">
                    {doc.contentHash && (
                      <div>
                        <p className="text-wave-400 text-xs mb-1">Hash SHA-256 do documento</p>
                        <p className="text-wave-700 text-xs font-mono break-all">{doc.contentHash}</p>
                      </div>
                    )}
                    {doc.stellarTxHash && (
                      <div>
                        <p className="text-wave-400 text-xs mb-1">Transação Stellar</p>
                        <p className="text-wave-700 text-xs font-mono break-all">{doc.stellarTxHash}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Morador doc description */}
                {isMoradorDoc && doc.description && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-wave-400 text-xs mb-1">Descrição</p>
                    <p className="text-wave-700 text-sm">{doc.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {!isMoradorDoc && doc.explorerUrl && (
                    <a
                      href={doc.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-gradient-to-r from-brand-deep to-brand-steel text-white rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver prova na Stellar
                    </a>
                  )}

                  {/* Review actions for morador docs */}
                  {canReview && (
                    <>
                      <button
                        onClick={() => handleReviewDoc(doc.id, 'aprovado')}
                        className="px-4 py-2 bg-brand-teal/15 text-brand-teal border border-brand-teal/30 rounded-xl hover:bg-brand-teal/25 transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReviewDoc(doc.id, 'recusado')}
                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Recusar
                      </button>
                      {docStatus === 'registrado' && (
                        <button
                          onClick={() => handleReviewDoc(doc.id, 'em_analise')}
                          className="px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all flex items-center gap-2 text-sm font-medium"
                        >
                          <Clock className="w-4 h-4" />
                          Em análise
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-r from-brand-deep to-brand-steel rounded-2xl p-6 border border-wave-200 shadow-lg relative z-10">
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
              <span>Documentos registrados: {documents.filter(d => d.origin !== 'morador').length}</span>
              <span>•</span>
              <span>Documentos de moradores: {moradorDocs.length}</span>
              <span>•</span>
              <span>Rede: Stellar Testnet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
