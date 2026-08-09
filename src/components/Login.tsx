'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Shield, Vote, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<any>;
}

export function Login({ onLogin }: LoginProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Por favor, preencha email e senha');
      return;
    }
    setLoading(true);
    try {
      const { error } = await onLogin(formData.email, formData.password);
      if (error) toast.error('Verifique suas credenciais.');
    } catch {
      toast.error('Erro inesperado ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-abyss flex">

      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-brand-abyss p-14">
        <div>
          <div className="flex items-center gap-3 mb-16">
            {/* Logo oficial da marca (mesmos assets da tela de Boas-Vindas) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.png" alt="" aria-hidden="true" className="h-11 w-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/wordmark-light.png" alt="Wave Condominium" className="h-9 w-auto" />
          </div>

          {/* Título no mesmo padrão do hero da Boas-Vindas: Montserrat branco,
              entrelinha 1.14, destaque em azul oficial (--blue / brand-blue). */}
          <h1 className="font-display text-4xl text-white font-normal leading-[1.14] mb-4">
            Governança condominial com{' '}
            <span className="text-brand-blue">prova de integridade</span>
          </h1>
          <p className="text-brand-chrome leading-relaxed mb-12">
            Cada decisão registrada, cada voto auditável e todos os documentos protegidos.
          </p>

          <div className="space-y-4">
            {[
              { icon: Vote,     label: 'Governança',  desc: 'Votações com registro imutável' },
              { icon: FileText, label: 'Documentos',  desc: 'Atas com registro verificável' },
              { icon: Shield,   label: 'Transparência', desc: 'Auditável por qualquer morador' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-brand-chrome/20 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-brand-teal" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-brand-chrome text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-brand-chrome/60 text-xs">
          © 2026 Wave · Gestão Condominial Inteligente
        </p>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-brand-deep">

        <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-brand-chrome/20">

          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            {/* Logo oficial da marca (mesmos assets da tela de Boas-Vindas) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.png" alt="" aria-hidden="true" className="h-10 w-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/wordmark-dark.png" alt="Wave Condominium" className="h-8 w-auto" />
          </div>

          <div className="mb-8">
            <p className="inline-flex items-center gap-2 mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
              Bem Vindo(a) de volta
            </p>
            <h2 className="font-display text-2xl text-brand-navy font-normal">Acessar plataforma</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-brand-ink text-sm font-medium mb-1.5">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-white border border-brand-chrome/60 rounded-xl text-brand-ink placeholder-brand-grey/70 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all text-base"
              />
            </div>

            <div>
              <label className="block text-brand-ink text-sm font-medium mb-1.5">Senha</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-brand-chrome/60 rounded-xl text-brand-ink placeholder-brand-grey/70 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all text-base"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-brand-grey cursor-pointer">
                <input type="checkbox" className="rounded accent-brand-steel w-3.5 h-3.5" />
                <span>Lembrar-me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-brand-steel hover:text-brand-navy text-sm font-medium"
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-brand-blue text-brand-deep rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 font-medium text-base"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-brand-light">
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { label: 'Síndico',        email: 'sindico@wave.com' },
                { label: 'Morador',        email: 'morador@wave.com' },
                { label: 'Administradora', email: 'administradora@wave.com' },
              ].map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ email: item.email, password: 'Senha@12345' })}
                  className="px-2 py-1.5 bg-brand-light border border-brand-chrome/50 rounded-lg text-brand-grey hover:border-brand-steel hover:text-brand-navy transition-all text-center"
                >
                  <p className="font-medium text-xs">{item.label}</p>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full mt-4 py-2.5 text-brand-grey hover:text-brand-navy transition-all flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
