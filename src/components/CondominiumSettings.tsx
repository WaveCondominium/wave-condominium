'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert, MessageCircle, Save, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { isManager } from '@/lib/rbac';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  CONDOMINIUM_SETTINGS_KEY,
  DEFAULT_CONDOMINIUM_SETTINGS,
  isValidWhatsappGroupLink,
  type CondominiumSettings as CondominiumSettingsType,
} from '@/lib/condominiumSettings';

export function CondominiumSettings() {
  const { userProfile } = useUser();

  // ---------------------------------------------------------------------
  // Guarda RBAC (regra permanente do projeto): configurações do condomínio
  // são restritas a Síndico e Administrador. Bloqueia tanto quem chegou
  // aqui pelo menu (já oculto para Morador) quanto quem tentar acessar a
  // URL diretamente. Validação de backend real só existe quando o Postgres
  // estiver conectado — hoje é apenas frontend, como o resto do projeto.
  // ---------------------------------------------------------------------
  const podeAcessar = isManager(userProfile.role);

  const [settings, setSettings] = useLocalStorage<CondominiumSettingsType>(
    CONDOMINIUM_SETTINGS_KEY,
    DEFAULT_CONDOMINIUM_SETTINGS
  );
  const [linkInput, setLinkInput] = useState(settings.whatsappGroupLink ?? '');
  const [saving, setSaving] = useState(false);

  if (!podeAcessar) {
    return (
      <div className="p-8 bg-wave-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-wave-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-wave-800 text-xl font-medium mb-2">Acesso negado</h1>
          <p className="text-wave-500 text-sm mb-6">
            Esta área é restrita a Síndicos e Administradores. Seu perfil atual ({userProfile.role}) não tem permissão para alterar configurações do condomínio.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-wave-500 text-white rounded-xl hover:bg-wave-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  function handleSave() {
    const trimmed = linkInput.trim();

    if (!trimmed) {
      toast.error('Informe o link do grupo antes de salvar.');
      return;
    }
    if (!isValidWhatsappGroupLink(trimmed)) {
      toast.error('Link inválido. Use um link oficial do WhatsApp (chat.whatsapp.com ou wa.me).');
      return;
    }

    setSaving(true);
    setSettings({ ...settings, whatsappGroupLink: trimmed });
    toast.success('Link do grupo salvo com sucesso!', {
      description: 'Já está disponível em Ações Rápidas no Dashboard para os moradores.',
    });
    setSaving(false);
  }

  function handleRemove() {
    setSettings({ ...settings, whatsappGroupLink: null });
    setLinkInput('');
    toast.success('Link do grupo removido.', {
      description: 'O botão deixará de aparecer no Dashboard dos moradores.',
    });
  }

  const hasLink = !!settings.whatsappGroupLink;

  return (
    <div className="p-4 md:p-8 bg-wave-50 min-h-screen">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-wave-500 hover:text-wave-700 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          <h1 className="font-serif text-3xl text-wave-800 font-normal mb-1">Configurações do Condomínio</h1>
          <p className="text-wave-500 text-sm">
            Gerencie as configurações gerais visíveis para todos os moradores.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-wave-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-wave-800 font-medium">Grupo do WhatsApp</h2>
              <p className="text-wave-500 text-sm">
                Link do grupo oficial de comunicação do condomínio.
              </p>
            </div>
          </div>

          {hasLink && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
              <Check className="w-4 h-4 shrink-0" />
              Link ativo — o botão &quot;Grupo do Condomínio&quot; está visível no Dashboard.
            </div>
          )}

          <label className="block text-wave-600 text-sm mb-1.5">Link do grupo *</label>
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://chat.whatsapp.com/..."
            className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
          />
          <p className="text-wave-400 text-xs mt-1.5">
            Aceita apenas links oficiais do WhatsApp (chat.whatsapp.com ou wa.me).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-wave-100">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-wave-500 text-white rounded-xl hover:bg-wave-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              {hasLink ? 'Atualizar link' : 'Salvar link'}
            </button>
            {hasLink && (
              <button
                onClick={handleRemove}
                className="flex-1 py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remover link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}