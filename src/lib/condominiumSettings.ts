// ---------------------------------------------------------------------------
// src/lib/condominiumSettings.ts
//
// Configurações do condomínio (mock via localStorage, mesmo padrão do resto
// do projeto — ver nota de dívida técnica em accounts.ts: quando o Postgres
// estiver conectado, isto vira uma tabela `condominium_settings` por
// condomínio, com validação de RBAC no servidor).
//
// Primeira configuração: link do grupo oficial do WhatsApp. A interface foi
// desenhada para crescer (outros campos de configuração do condomínio no
// futuro) sem precisar de nova arquitetura — só adicionar campos aqui.
//
// LIMITAÇÃO CONHECIDA: como é localStorage por navegador, uma alteração
// feita pelo Síndico não se propaga automaticamente para outros
// dispositivos/navegadores dos moradores — apenas para abas abertas no
// mesmo navegador (via React state). Propagação real entre usuários
// diferentes só existe com um backend de verdade.
// ---------------------------------------------------------------------------

export const CONDOMINIUM_SETTINGS_KEY = 'wave_condominium_settings';

export interface CondominiumSettings {
  whatsappGroupLink: string | null;
}

export const DEFAULT_CONDOMINIUM_SETTINGS: CondominiumSettings = {
  whatsappGroupLink: null,
};

/**
 * Aceita apenas links oficiais do WhatsApp (chat.whatsapp.com ou wa.me),
 * sempre em HTTPS — evita que um link malicioso ou de outro serviço seja
 * salvo por engano e disparado para todos os moradores.
 */
export function isValidWhatsappGroupLink(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'chat.whatsapp.com' || url.hostname === 'wa.me')
    );
  } catch {
    return false;
  }
}