'use client';

// ---------------------------------------------------------------------------
// src/components/access/GerenciarAcessosModal.tsx
//
// Gestão de acessos de moradores a partir de uma unidade (SÍN-022). O Síndico
// adiciona um morador (nome, e-mail, telefone, vínculo), gera um convite com
// link de ativação seguro (e-mail SIMULADO nesta fase → link copiável), e
// gerencia os convites da unidade: reenviar (pendente/expirado), consultar
// status e revogar acesso.
//
// A SENHA nunca aparece aqui: é definida pelo morador na ativação. O token só
// chega no retorno de gerar/reenviar (para o link copiável) e não é guardado.
// ---------------------------------------------------------------------------

import { useMemo, useState } from 'react';
import {
  X, UserPlus, Copy, Check, Send, Ban, Loader2, ShieldCheck, Mail, Clock, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useConvites } from '@/hooks/useConvites';
import { useBlockchainAutoRegistry } from '@/hooks/useBlockchainAutoRegistry';
import {
  VINCULOS, VINCULO_LABEL, STATUS_CONVITE_LABEL, STATUS_CONVITE_COR,
  CONVITE_VALIDADE_HORAS, validarMorador, statusConviteView, podeReenviar, podeRevogar,
  type ConviteAcesso, type MoradorInput, type VinculoMorador,
} from '@/components/access/convites';
import type { Unidade } from '@/components/units/unidades';
import { rotuloUnidade } from '@/components/units/unidades';

const inputCls =
  'w-full px-4 py-2.5 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300';

function linkAbsoluto(path: string): string {
  if (typeof window === 'undefined') return path;
  return `${window.location.origin}${path}`;
}

export function GerenciarAcessosModal({
  unidade,
  responsavel,
  onClose,
}: {
  unidade: Unidade;
  responsavel: string;
  onClose: () => void;
}) {
  const { convites, loading, error, gerar, reenviar, revogar } = useConvites();
  const { registerAccessChange } = useBlockchainAutoRegistry();

  const daUnidade = useMemo(
    () => convites.filter((c) => c.unidadeId === unidade.id),
    [convites, unidade.id],
  );

  // Formulário de novo morador
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [vinculo, setVinculo] = useState<VinculoMorador>('PROPRIETARIO');
  const [gerando, setGerando] = useState(false);

  // Link recém-gerado (token só existe agora) + estado das ações por convite
  const [linkGerado, setLinkGerado] = useState<{ conviteId: string; url: string; para: string } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [acaoEmCurso, setAcaoEmCurso] = useState<string | null>(null);
  const [confirmarRevogar, setConfirmarRevogar] = useState<string | null>(null);

  const rotulo = rotuloUnidade(unidade);

  async function copiar(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      toast.success('Link copiado.');
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error('Não foi possível copiar. Selecione e copie manualmente.');
    }
  }

  async function handleGerar() {
    const input: MoradorInput = { nome, email, telefone: telefone.trim() || undefined, vinculo };
    const erro = validarMorador(input);
    if (erro) { toast.error(erro); return; }

    setGerando(true);
    setLinkGerado(null);
    const res = await gerar({ unidadeId: unidade.id, unidadeRotulo: rotulo, morador: input });
    setGerando(false);

    if (!res.ok) { toast.error(res.error); return; }

    const url = linkAbsoluto(res.resultado.ativacaoPath);
    setLinkGerado({ conviteId: res.resultado.convite.id, url, para: res.resultado.convite.email });
    void registerAccessChange({
      acao: 'convite_gerado', morador: res.resultado.convite.nome, unidadeRotulo: rotulo,
      vinculo: VINCULO_LABEL[vinculo], responsavel,
    });
    toast.success('Convite gerado. E-mail simulado enviado — copie o link abaixo.');
    setNome(''); setEmail(''); setTelefone(''); setVinculo('PROPRIETARIO');
  }

  async function handleReenviar(c: ConviteAcesso) {
    setAcaoEmCurso(c.id);
    const res = await reenviar(c.id);
    setAcaoEmCurso(null);
    if (!res.ok) { toast.error(res.error); return; }
    const url = linkAbsoluto(res.resultado.ativacaoPath);
    setLinkGerado({ conviteId: c.id, url, para: c.email });
    void registerAccessChange({
      acao: 'convite_reenviado', morador: c.nome, unidadeRotulo: rotulo,
      vinculo: VINCULO_LABEL[c.vinculo], responsavel,
    });
    toast.success('Novo convite gerado — copie o link abaixo.');
  }

  async function handleRevogar(c: ConviteAcesso) {
    setAcaoEmCurso(c.id);
    const res = await revogar(c.id);
    setAcaoEmCurso(null);
    setConfirmarRevogar(null);
    if (!res.ok) { toast.error(res.error); return; }
    if (linkGerado?.conviteId === c.id) setLinkGerado(null);
    void registerAccessChange({
      acao: 'acesso_revogado', morador: c.nome, unidadeRotulo: rotulo,
      vinculo: VINCULO_LABEL[c.vinculo], responsavel,
    });
    toast.success('Acesso revogado.');
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-wave-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-wave-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-wave-100 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-wave-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-wave-800 text-lg font-serif truncate">Acessos · {rotulo}</h2>
              <p className="text-wave-400 text-xs">Gere e gerencie o acesso dos moradores à plataforma</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="p-2 hover:bg-wave-50 rounded-lg shrink-0">
            <X className="w-5 h-5 text-wave-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Novo morador */}
          <section className="space-y-3">
            <h3 className="text-wave-700 text-sm font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Adicionar morador
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="ac-nome" className="block text-wave-500 text-xs mb-1.5">Nome completo</label>
                <input id="ac-nome" value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} placeholder="Ex.: Maria Silva" />
              </div>
              <div>
                <label htmlFor="ac-email" className="block text-wave-500 text-xs mb-1.5">E-mail</label>
                <input id="ac-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="maria@email.com" />
              </div>
              <div>
                <label htmlFor="ac-tel" className="block text-wave-500 text-xs mb-1.5">Telefone <span className="text-wave-300">(opcional)</span></label>
                <input id="ac-tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputCls} placeholder="(21) 99999-0000" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ac-vinc" className="block text-wave-500 text-xs mb-1.5">Vínculo</label>
                <select id="ac-vinc" value={vinculo} onChange={(e) => setVinculo(e.target.value as VinculoMorador)} className={inputCls}>
                  {VINCULOS.map((v) => <option key={v} value={v}>{VINCULO_LABEL[v]}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={handleGerar}
              disabled={gerando}
              className="w-full py-2.5 bg-gradient-to-r from-brand-deep to-brand-steel text-white rounded-xl shadow flex items-center justify-center gap-2 text-sm hover:opacity-90 transition-all disabled:opacity-60"
            >
              {gerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {gerando ? 'Gerando convite...' : 'Gerar convite de acesso'}
            </button>
            <p className="text-wave-400 text-xs flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              A senha é definida pelo próprio morador na ativação. Você nunca a vê nem a define. O link expira em {CONVITE_VALIDADE_HORAS}h e é de uso único.
            </p>
          </section>

          {/* Link recém-gerado (copiável — e-mail simulado) */}
          {linkGerado && (
            <div className="bg-brand-teal/10 border border-brand-teal/30 rounded-xl p-4 space-y-2">
              <p className="text-wave-700 text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-teal" /> E-mail simulado enviado para {linkGerado.para}
              </p>
              <p className="text-wave-500 text-xs">Copie e envie este link de ativação ao morador:</p>
              <div className="flex items-center gap-2">
                <input readOnly value={linkGerado.url} className="flex-1 px-3 py-2 bg-white border border-wave-200 rounded-lg text-wave-700 text-xs" onFocus={(e) => e.target.select()} />
                <button onClick={() => copiar(linkGerado.url)} className="px-3 py-2 bg-brand-teal text-white rounded-lg text-xs flex items-center gap-1.5 hover:opacity-90 shrink-0">
                  {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          )}

          {/* Lista de convites da unidade */}
          <section className="space-y-3">
            <h3 className="text-wave-700 text-sm font-medium">Acessos desta unidade</h3>

            {loading ? (
              <div className="space-y-2" aria-busy="true">
                {[0, 1].map((i) => <div key={i} className="h-16 rounded-xl bg-wave-100 animate-pulse" />)}
              </div>
            ) : error ? (
              <div className="py-6 text-center bg-wave-50 rounded-xl border border-wave-100">
                <AlertCircle className="w-6 h-6 text-orange-500 mx-auto mb-1.5" />
                <p className="text-wave-600 text-sm">{error}</p>
              </div>
            ) : daUnidade.length === 0 ? (
              <div className="py-6 text-center bg-wave-50 rounded-xl border border-wave-100">
                <Mail className="w-7 h-7 text-wave-300 mx-auto mb-2" />
                <p className="text-wave-500 text-sm">Nenhum acesso gerado para esta unidade ainda.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {daUnidade.map((c) => {
                  const view = statusConviteView({ status: c.status, expiresAt: c.expiresAt });
                  const emCurso = acaoEmCurso === c.id;
                  return (
                    <li key={c.id} className="border border-wave-100 rounded-xl p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-wave-800 text-sm font-medium truncate">{c.nome}</p>
                          <p className="text-wave-400 text-xs truncate">{c.email} · {VINCULO_LABEL[c.vinculo]}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_CONVITE_COR[view]}`}>
                          {STATUS_CONVITE_LABEL[view]}
                        </span>
                      </div>

                      {view !== 'ATIVADO' && view !== 'REVOGADO' && (
                        <p className="text-wave-400 text-xs mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Expira em {new Date(c.expiresAt).toLocaleString('pt-BR')}
                        </p>
                      )}
                      {view === 'REVOGADO' && c.revogadoPor && (
                        <p className="text-wave-400 text-xs mt-1.5">Revogado por {c.revogadoPor}</p>
                      )}

                      {/* Ações */}
                      {confirmarRevogar === c.id ? (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                          <p className="text-red-700 text-xs flex-1">Revogar o acesso deste morador? Ele não conseguirá mais entrar.</p>
                          <button onClick={() => handleRevogar(c)} disabled={emCurso} className="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 disabled:opacity-60">
                            {emCurso ? '...' : 'Revogar'}
                          </button>
                          <button onClick={() => setConfirmarRevogar(null)} className="px-2.5 py-1 bg-white border border-wave-200 text-wave-600 rounded-md text-xs">Cancelar</button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {podeReenviar(view) && (
                            <button onClick={() => handleReenviar(c)} disabled={emCurso} className="px-3 py-1.5 bg-wave-100 text-wave-700 rounded-lg text-xs flex items-center gap-1.5 hover:bg-wave-200 disabled:opacity-60">
                              {emCurso ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Reenviar
                            </button>
                          )}
                          {podeRevogar(view) && (
                            <button onClick={() => setConfirmarRevogar(c.id)} className="px-3 py-1.5 text-red-600 rounded-lg text-xs flex items-center gap-1.5 hover:bg-red-50">
                              <Ban className="w-3.5 h-3.5" /> Revogar acesso
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="p-6 pt-0">
          <button onClick={onClose} className="w-full py-2.5 bg-wave-800 text-white rounded-xl hover:bg-wave-700 transition-all text-sm">Fechar</button>
        </div>
      </div>
    </div>
  );
}
