'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Mail, KeyRound, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { BuildingAnimation } from './BuildingAnimation';
import { setPendingPasswordReset } from '@/lib/passwordReset';

// ---------------------------------------------------------------------------
// NOTA IMPORTANTE (decisão de escopo):
// Não existe, hoje, nenhum backend de envio de e-mail neste projeto — toda a
// autenticação é mock (qualquer email/senha funciona no login). Por isso,
// esta tela gera uma senha provisória e a EXIBE na própria tela, com aviso
// claro de que em produção isso seria enviado por e-mail. Quando houver um
// serviço de e-mail real integrado, é só trocar a função `gerarSenhaProvisoria`
// por uma chamada de API de verdade.
// ---------------------------------------------------------------------------
function gerarSenhaProvisoria(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let senha = '';
  for (let i = 0; i < 8; i++) {
    senha += chars[Math.floor(Math.random() * chars.length)];
  }
  return senha;
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [senhaProvisoria, setSenhaProvisoria] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      toast.error('Digite o e-mail cadastrado.');
      return;
    }
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      toast.error('Digite um e-mail válido.');
      return;
    }

    setLoading(true);
    // Simula latência de rede, igual outros mocks do projeto
    await new Promise((resolve) => setTimeout(resolve, 900));
    const senha = gerarSenhaProvisoria();
    setSenhaProvisoria(senha);
    setPendingPasswordReset(email);
    setLoading(false);
    toast.success('Senha provisória gerada!');
  };

  return (
    <div className="min-h-screen bg-wave-50 flex">

      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-wave-800 p-14">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-white font-serif text-sm">W</span>
            </div>
            <span className="font-serif text-xl text-white">Wave</span>
          </div>

          <h1 className="font-serif text-4xl text-white font-normal leading-tight mb-4">
            Recupere o acesso à sua conta
          </h1>
          <p className="text-wave-300 leading-relaxed">
            Informe o e-mail cadastrado e geraremos uma senha provisória
            para você acessar novamente e definir uma nova senha.
          </p>
        </div>

        <p className="text-wave-500 text-xs italic font-serif">
          © 2026 Wave · Gestão Condominial Inteligente
        </p>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden bg-wave-50 lg:bg-[#0A0F2E]">
        <div className="hidden lg:block absolute inset-0 z-0" aria-hidden="true">
          <BuildingAnimation className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F2E]/40 via-transparent to-[#0A0F2E]/20" />
        </div>

        <div className="relative z-10 w-full max-w-sm lg:bg-white/95 lg:backdrop-blur-md lg:rounded-2xl lg:shadow-2xl lg:p-8 lg:border lg:border-white/20">

          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-wave-500 flex items-center justify-center">
              <span className="text-white font-serif text-sm">W</span>
            </div>
            <span className="font-serif text-xl text-wave-800">Wave</span>
          </div>

          {!senhaProvisoria ? (
            <>
              <div className="mb-8">
                <p className="text-wave-400 text-sm italic font-serif mb-1">Recuperação de senha</p>
                <h2 className="font-serif text-2xl text-wave-800 font-normal">Esqueceu sua senha?</h2>
                <p className="text-wave-500 text-sm mt-2">
                  Digite o e-mail cadastrado e enviaremos uma senha provisória.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-wave-600 text-sm mb-1.5">E-mail cadastrado</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-2.5 bg-wave-500 text-white rounded-xl hover:bg-wave-600 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 font-medium"
                >
                  {loading ? 'Gerando senha provisória...' : 'Enviar senha provisória'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="font-serif text-2xl text-wave-800 font-normal mb-1">Senha provisória gerada</h2>
                <p className="text-wave-500 text-sm">
                  Use a senha abaixo para entrar e depois troque por uma nova.
                </p>
              </div>

              <div className="bg-wave-50 border border-wave-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-wave-500 shrink-0" />
                <p className="font-mono text-lg text-wave-800 tracking-wider">{senhaProvisoria}</p>
              </div>

              <p className="text-wave-400 text-xs italic font-serif mb-6">
                Em produção, esta senha seria enviada por e-mail para <strong>{email}</strong>, não exibida na tela.
              </p>

              <Link
                href="/login"
                className="w-full py-2.5 bg-wave-500 text-white rounded-xl hover:bg-wave-600 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                Ir para o login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          <p className="text-wave-300 text-xs text-center mt-6 flex items-center justify-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <Link href="/login" className="hover:text-wave-500 transition-colors">Voltar para o login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
