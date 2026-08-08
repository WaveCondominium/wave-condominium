'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { changePasswordAction } from '@/app/actions/auth';

const MIN_PASSWORD_LENGTH = 8;

/**
 * Tela de alteração obrigatória de senha — primeiro acesso do Morador.
 *
 * O usuário só chega aqui via middleware quando `mustChangePassword = true`
 * no JWT. Enquanto não definir uma nova senha, o acesso ao dashboard
 * permanece bloqueado (enforced server-side pelo middleware + JWT).
 */
export function ForceChangePassword() {
  const router = useRouter();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function getPasswordStrength(): { label: string; color: string; width: string } {
    const len = novaSenha.length;
    if (len === 0) return { label: '', color: 'bg-transparent', width: '0%' };
    if (len < MIN_PASSWORD_LENGTH) return { label: 'Fraca', color: 'bg-red-400', width: '25%' };
    const hasUpper = /[A-Z]/.test(novaSenha);
    const hasLower = /[a-z]/.test(novaSenha);
    const hasNumber = /\d/.test(novaSenha);
    const hasSpecial = /[^A-Za-z0-9]/.test(novaSenha);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (score <= 2) return { label: 'Média', color: 'bg-yellow-400', width: '50%' };
    if (score === 3) return { label: 'Boa', color: 'bg-brand-teal', width: '75%' };
    return { label: 'Forte', color: 'bg-green-500', width: '100%' };
  }

  const strength = getPasswordStrength();

  async function handleSubmit() {
    if (novaSenha.length < MIN_PASSWORD_LENGTH) {
      toast.error(`A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await changePasswordAction(novaSenha);
      if (result.error) {
        toast.error(result.error.message);
        return;
      }
      toast.success('Senha definida com sucesso! Bem-vindo(a) à plataforma.');
      router.push('/dashboard');
    } catch {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-abyss flex">

      {/* Painel esquerdo — informativo (apenas desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-brand-abyss p-14">
        <div>
          <div className="flex items-center gap-3 mb-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.png" alt="" aria-hidden="true" className="h-11 w-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/wordmark-light.png" alt="Wave Condominium" className="h-9 w-auto" />
          </div>

          <h1 className="font-display text-4xl text-white font-normal leading-[1.14] mb-4">
            Defina sua{' '}
            <span className="text-brand-blue">nova senha</span>
          </h1>
          <p className="text-brand-chrome leading-relaxed mb-12">
            Você está acessando a plataforma pela primeira vez. Por segurança, é necessário
            criar uma senha pessoal antes de continuar.
          </p>

          <div className="space-y-4">
            {[
              { icon: ShieldCheck, label: 'Segurança', desc: 'Sua senha provisória será invalidada' },
              { icon: KeyRound, label: 'Pessoal', desc: 'Defina uma senha que só você conhece' },
              { icon: CheckCircle, label: 'Acesso liberado', desc: 'Após a troca, acesse todas as funcionalidades' },
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

      {/* Painel direito — formulário */}
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-brand-deep">

        <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-brand-chrome/20">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-mark.png" alt="" aria-hidden="true" className="h-10 w-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/wordmark-dark.png" alt="Wave Condominium" className="h-8 w-auto" />
          </div>

          <div className="mb-6">
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-brand-teal" />
            </div>
            <p className="inline-flex items-center gap-2 mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-teal">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-teal" />
              Primeiro acesso
            </p>
            <h2 className="font-display text-2xl text-brand-navy font-normal">Criar nova senha</h2>
            <p className="text-brand-grey text-sm mt-2">
              Sua senha provisória será substituída permanentemente.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-brand-ink text-sm font-medium mb-1.5">Nova senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="••••••••"
                  minLength={MIN_PASSWORD_LENGTH}
                  autoFocus
                  className="w-full px-4 py-3 pr-10 bg-white border border-brand-chrome/60 rounded-xl text-brand-ink placeholder-brand-grey/70 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-grey hover:text-brand-ink transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Indicador de força */}
              {novaSenha.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-brand-chrome/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-brand-grey">
                    Força: <span className="font-medium">{strength.label}</span>
                  </p>
                </div>
              )}
              <p className="text-brand-grey/70 text-xs mt-1">Mínimo de {MIN_PASSWORD_LENGTH} caracteres.</p>
            </div>

            <div>
              <label className="block text-brand-ink text-sm font-medium mb-1.5">Confirmar nova senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white border border-brand-chrome/60 rounded-xl text-brand-ink placeholder-brand-grey/70 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal transition-all text-base"
              />
              {confirmarSenha.length > 0 && novaSenha !== confirmarSenha && (
                <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || novaSenha.length < MIN_PASSWORD_LENGTH || novaSenha !== confirmarSenha}
              className="w-full py-3 bg-brand-blue text-brand-deep rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 font-medium text-base"
            >
              {submitting ? 'Salvando...' : 'Definir senha e acessar'}
              {!submitting && <CheckCircle className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
