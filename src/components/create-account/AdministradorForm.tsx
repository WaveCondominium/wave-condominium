'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Calendar, Mail, Phone, Briefcase, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PhotoUpload } from './PhotoUpload';
import { CredentialsFields } from './CredentialsFields';
import { salvarConta, validateCredentials } from '@/lib/accounts';
import { isValidCPF, formatCPF, isValidEmail, isValidPhone, formatPhone, isValidCNPJ, formatCNPJ } from '@/lib/validators';

interface FormState {
  photoPreview: string | null;
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  email: string;
  celular: string;
  telefoneComercial: string;
  cargo: string;
  empresa: string;
  cnpj: string;
  permissaoAcesso: string;
  status: 'ativo' | 'inativo';
  password: string;
  confirmPassword: string;
}

const initialState: FormState = {
  photoPreview: null,
  fullName: '',
  cpf: '',
  rg: '',
  birthDate: '',
  email: '',
  celular: '',
  telefoneComercial: '',
  cargo: '',
  empresa: '',
  cnpj: '',
  permissaoAcesso: '',
  status: 'ativo',
  password: '',
  confirmPassword: '',
};

export function AdministradorForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.fullName.trim()) return 'Informe o nome completo.';
    if (!form.cpf.trim()) return 'Informe o CPF.';
    if (!isValidCPF(form.cpf)) return 'CPF inválido. Confira os números digitados.';
    if (!form.email.trim()) return 'Informe o e-mail.';
    if (!isValidEmail(form.email)) return 'E-mail inválido.';
    if (!form.celular.trim()) return 'Informe o telefone celular.';
    if (!isValidPhone(form.celular)) return 'Telefone celular inválido.';
    if (form.cnpj.trim() && !isValidCNPJ(form.cnpj)) return 'CNPJ inválido. Confira os números digitados.';
    return validateCredentials(form.password, form.confirmPassword);
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      salvarConta('administrador', {
        photoPreview: form.photoPreview,
        fullName: form.fullName.trim(),
        cpf: form.cpf,
        rg: form.rg.trim() || null,
        birthDate: form.birthDate || null,
        email: form.email.trim().toLowerCase(),
        celular: form.celular,
        telefoneComercial: form.telefoneComercial.trim() || null,
        cargo: form.cargo.trim() || null,
        empresa: form.empresa.trim() || null,
        cnpj: form.cnpj || null,
        permissaoAcesso: form.permissaoAcesso.trim() || null,
        status: form.status,
        password: form.password,
      });
      toast.success('Administrador cadastrado com sucesso!', {
        description: `${form.fullName} foi adicionado(a) à plataforma.`,
      });
      router.push('/dashboard');
    } catch {
      toast.error('Erro inesperado ao criar a conta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PhotoUpload value={form.photoPreview} onChange={(v) => update('photoPreview', v)} />

      <section>
        <h2 className="text-wave-800 font-medium mb-4">Dados pessoais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-wave-600 text-sm mb-1.5">Nome completo *</label>
            <input type="text" value={form.fullName} onChange={(e) => update('fullName', e.target.value)}
              placeholder="Ex: Ana Paula Rodrigues"
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">CPF *</label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={form.cpf} onChange={(e) => update('cpf', formatCPF(e.target.value))}
                placeholder="000.000.000-00" inputMode="numeric" maxLength={14}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">RG (opcional)</label>
            <input type="text" value={form.rg} onChange={(e) => update('rg', e.target.value)}
              placeholder="00.000.000-0"
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Data de nascimento</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">E-mail *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Telefone celular *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={form.celular} onChange={(e) => update('celular', formatPhone(e.target.value))}
                placeholder="(11) 91234-5678" inputMode="numeric" maxLength={16}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Telefone comercial (opcional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={form.telefoneComercial} onChange={(e) => update('telefoneComercial', formatPhone(e.target.value))}
                placeholder="(11) 3456-7890" inputMode="numeric" maxLength={16}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-4 h-4 text-wave-500" />
          <h2 className="text-wave-800 font-medium">Dados profissionais</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Cargo</label>
            <input type="text" value={form.cargo} onChange={(e) => update('cargo', e.target.value)}
              placeholder="Ex: Gerente de Contas"
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Empresa (Administradora)</label>
            <input type="text" value={form.empresa} onChange={(e) => update('empresa', e.target.value)}
              placeholder="Ex: Growth Tech Administradora"
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">CNPJ (se aplicável)</label>
            <input type="text" value={form.cnpj} onChange={(e) => update('cnpj', formatCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00" inputMode="numeric" maxLength={18}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Permissão de acesso</label>
            <input type="text" value={form.permissaoAcesso} onChange={(e) => update('permissaoAcesso', e.target.value)}
              placeholder="Ex: Administrador geral"
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
            <p className="text-wave-400 text-xs mt-1">Campo livre por enquanto — granularidade de permissões será definida com o time.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-wave-800 font-medium mb-4">Dados de acesso</h2>
        <div className="mb-4">
          <label className="block text-wave-600 text-sm mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => update('status', e.target.value as 'ativo' | 'inativo')}
            className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm">
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <CredentialsFields
          password={form.password}
          onPasswordChange={(v) => update('password', v)}
          confirmPassword={form.confirmPassword}
          onConfirmPasswordChange={(v) => update('confirmPassword', v)}
        />
      </section>

      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-wave-100">
        <button onClick={() => router.push('/dashboard')}
          className="flex-1 py-3 bg-wave-50 border border-wave-200 text-wave-600 rounded-xl hover:bg-wave-100 transition-all font-medium text-sm">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={submitting}
          className="flex-1 py-3 bg-wave-500 text-white rounded-xl hover:bg-wave-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 font-medium text-sm">
          {submitting ? 'Criando conta...' : 'Criar conta'}
          {!submitting && <CheckCircle className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
