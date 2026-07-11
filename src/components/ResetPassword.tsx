'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { BuildingAnimation } from './BuildingAnimation';
import { clearPendingPasswordReset, hasPendingPasswordReset } from '@/lib/passwordReset';

const MIN_PASSWORD_LENGTH = 8;

export function ResetPassword() {
  const router = useRouter();
  const { userProfile, isAuthenticated, isLoading } = useUser();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Guarda de rota: sem sessão, não faz sentido estar aqui
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleConfirm = async () => {
    if (novaSenha.length < MIN_PASSWORD_LENGTH) {
      toast.error(`A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    // Simula latência de rede, consistente com o restante dos mocks do projeto
    await new Promise((resolve) => setTimeout(resolve, 700));

    // NOTA: como não há backend real de autenticação ainda, não existe
    // "salvar a nova senha" de fato — apenas encerramos o estado de
    // "redefinição pendente" para este e-mail. Ver src/lib/passwordReset.ts.
    clearPendingPasswordReset();

    setSubmitting(false);
    toast.success('Senha redefinida com sucesso!');
    router.push('/dashboard');
  };

  if (isLoading || !isAuthenticated) return null;

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
            Defina sua nova senha
          </h1>
          <p className="text-wave-300 leading-relaxed">
            Você está usando uma senha provisória. Por segurança, defina uma
            nova senha para continuar acessando a plataforma.
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

          <div className="mb-6 text-center lg:text-left">
            <div className="w-12 h-12 rounded-full bg-wave-100 flex items-center justify-center mb-4 mx-auto lg:mx-0">
              <KeyRound className="w-6 h-6 text-wave-500" />
            </div>
            <p className="text-wave-400 text-sm italic font-serif mb-1">Acesso provisório detectado</p>
            <h2 className="font-serif text-2xl text-wave-800 font-normal">Redefinir senha</h2>
            <p className="text-wave-500 text-sm mt-2">
              Olá, {userProfile.name || userProfile.email}. Defina uma nova senha para continuar.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-wave-600 text-sm mb-1.5">Nova senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                  placeholder="••••••••"
                  minLength={MIN_PASSWORD_LENGTH}
                  className="w-full px-4 py-2.5 pr-10 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wave-300 hover:text-wave-500 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-wave-400 text-xs mt-1">Mínimo de {MIN_PASSWORD_LENGTH} caracteres.</p>
            </div>

            <div>
              <label className="block text-wave-600 text-sm mb-1.5">Confirmar nova senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
              />
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full py-2.5 bg-wave-500 text-white rounded-xl hover:bg-wave-600 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 font-medium"
            >
              {submitting ? 'Confirmando...' : 'Confirmar'}
              {!submitting && <CheckCircle className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
