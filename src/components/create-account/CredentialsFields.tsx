'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { MIN_PASSWORD_LENGTH } from '@/lib/accounts';

interface CredentialsFieldsProps {
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
}

// ---------------------------------------------------------------------------
// Nota de arquitetura: não existe um campo "Usuário" separado — o e-mail
// (já coletado na seção de dados pessoais de cada formulário) é o
// identificador de login, consistente com como useAuth.ts autentica hoje.
// Criar um campo "Usuário" isolado seria decorativo, sem ligação real com
// o login — por isso este componente cuida só de Senha/Confirmar Senha.
// ---------------------------------------------------------------------------
export function CredentialsFields({
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
}: CredentialsFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-wave-600 text-sm mb-1.5">Senha *</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
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
        <label className="block text-wave-600 text-sm mb-1.5">Confirmar senha *</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 pr-10 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-wave-300 hover:text-wave-500 transition-colors"
            aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
