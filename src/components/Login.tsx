'use client';

import { useState } from 'react';
import { ArrowRight, Shield, Vote, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<any>;
}

export function Login({ onLogin }: LoginProps) {
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
    <div className="min-h-screen bg-wave-50 flex">

      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-wave-800 p-14">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-white font-serif text-sm">W</span>
            </div>
            <span className="font-serif text-xl text-white">Wave Condominium</span>
          </div>

          <h1 className="font-serif text-4xl text-white font-normal leading-tight mb-4">
            Gestão condominial com transparência
          </h1>
          <p className="text-wave-300 leading-relaxed mb-12">
            Cada decisão registrada, cada voto auditável, cada documento protegido —
            sem precisar confiar apenas no síndico.
          </p>

          <div className="space-y-4">
            {[
              { icon: Vote,     label: 'Governança',  desc: 'Votações com registro imutável' },
              { icon: FileText, label: 'Documentos',  desc: 'Atas com registro verificável na Stellar' },
              { icon: Shield,   label: 'Transparência', desc: 'Auditável por qualquer morador' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-wave-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-wave-400 text-xs italic font-serif">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-wave-500 text-xs italic font-serif">
          © 2026 Wave · Gestão Condominial Inteligente
        </p>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden bg-wave-50 lg:bg-wave-800">

        <div className="relative z-10 w-full max-w-sm lg:bg-white/95 lg:backdrop-blur-md lg:rounded-2xl lg:shadow-2xl lg:p-8 lg:border lg:border-white/20">

          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-wave-500 flex items-center justify-center">
              <span className="text-white font-serif text-sm">W</span>
            </div>
            <span className="font-serif text-xl text-wave-800">Wave Condominium</span>
          </div>

          <div className="mb-8">
            <p className="text-wave-400 text-sm italic font-serif mb-1">Bem-vinda de volta</p>
            <h2 className="font-serif text-2xl text-wave-800 font-normal">Acessar plataforma</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-wave-600 text-sm mb-1.5">E-mail</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-wave-600 text-sm mb-1.5">Senha</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-wave-500 cursor-pointer">
                <input type="checkbox" className="rounded accent-wave-500 w-3.5 h-3.5" />
                <span>Lembrar-me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-wave-500 hover:text-wave-700 italic font-serif text-sm"
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-wave-500 text-white rounded-xl hover:bg-wave-600 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 font-medium"
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-wave-100">
            <p className="text-wave-400 text-xs text-center italic font-serif">
              Use qualquer email e senha para acessar a demonstração
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              {[
                { label: 'Síndico', hint: 'sindico@...' },
                { label: 'Admin',   hint: 'admin@...' },
                { label: 'Morador', hint: 'qualquer' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => setFormData({ email: `${item.label.toLowerCase()}@wave.com`, password: '123456' })}
                  className="px-2 py-1.5 bg-wave-50 border border-wave-100 rounded-lg text-wave-500 hover:border-wave-300 hover:text-wave-700 transition-all text-center"
                >
                  <p className="font-medium text-xs">{item.label}</p>
                  <p className="text-wave-400 text-xs italic font-serif">{item.hint}</p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
