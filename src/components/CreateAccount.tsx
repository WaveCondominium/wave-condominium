'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Camera, X, Mail, Phone, CreditCard, Calendar,
  Building2, Briefcase, Lock, Eye, EyeOff, CheckCircle, ArrowRight, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  isValidCPF, formatCPF,
  isValidCNPJ, formatCNPJ,
  isValidEmail,
  isValidPhone, formatPhone,
} from '@/lib/validators';

const MIN_PASSWORD_LENGTH = 8;
const STORAGE_KEY = 'wave_users';

// ---------------------------------------------------------------------------
// NOTA (dívida técnica documentada de propósito):
// Não há backend real de usuários ainda. As contas criadas aqui são
// persistidas em localStorage, seguindo o mesmo padrão mock usado em outras
// partes do projeto (wave_boletos, wave_pending_proposals, etc.). Quando o
// Postgres estiver conectado, `salvarConta` deve virar uma chamada de API
// real (com hash de senha no servidor — nunca client-side).
//
// Por decisão explícita deste ticket, NÃO há campo de "perfil/role" no
// formulário — todas as contas são criadas sem papel definido. A separação
// de perfis (síndico/morador/administradora/prestador) fica para uma etapa
// futura, conforme especificado.
// ---------------------------------------------------------------------------

interface CreateAccountFormData {
  photoPreview: string | null;
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  condominium: string;
  block: string;
  unit: string;
  company: string;
  jobTitle: string;
  workArea: string;
  companyCnpj: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: CreateAccountFormData = {
  photoPreview: null,
  fullName: '',
  cpf: '',
  birthDate: '',
  email: '',
  phone: '',
  condominium: '',
  block: '',
  unit: '',
  company: '',
  jobTitle: '',
  workArea: '',
  companyCnpj: '',
  password: '',
  confirmPassword: '',
};

function salvarConta(data: CreateAccountFormData) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const novaConta = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    photoPreview: data.photoPreview,
    fullName: data.fullName.trim(),
    cpf: data.cpf,
    birthDate: data.birthDate || null,
    email: data.email.trim().toLowerCase(),
    phone: data.phone,
    condominium: data.condominium.trim(),
    block: data.block.trim() || null,
    unit: data.unit.trim() || null,
    company: data.company.trim() || null,
    jobTitle: data.jobTitle.trim() || null,
    workArea: data.workArea.trim() || null,
    companyCnpj: data.companyCnpj || null,
    // NUNCA armazenar senha em texto puro em produção — isto é mock local
    // apenas para viabilizar a demo até existir backend com hash real.
    password: data.password,
  };
  existing.push(novaConta);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function CreateAccount() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateAccountFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof CreateAccountFormData>(key: K, value: CreateAccountFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateField('photoPreview', reader.result as string);
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    updateField('photoPreview', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function validate(): string | null {
    if (!formData.fullName.trim()) return 'Informe o nome completo.';
    if (!formData.cpf.trim()) return 'Informe o CPF.';
    if (!isValidCPF(formData.cpf)) return 'CPF inválido. Confira os números digitados.';
    if (!formData.email.trim()) return 'Informe o e-mail.';
    if (!isValidEmail(formData.email)) return 'E-mail inválido.';
    if (!formData.phone.trim()) return 'Informe o telefone/WhatsApp.';
    if (!isValidPhone(formData.phone)) return 'Telefone inválido. Use DDD + número.';
    if (!formData.condominium.trim()) return 'Informe o condomínio.';

    if (formData.companyCnpj.trim() && !isValidCNPJ(formData.companyCnpj)) {
      return 'CNPJ da empresa inválido. Confira os números digitados.';
    }

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    }
    if (formData.password !== formData.confirmPassword) {
      return 'As senhas não coincidem.';
    }

    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      // Simula latência de rede, consistente com o restante dos mocks do projeto
      await new Promise((resolve) => setTimeout(resolve, 800));
      salvarConta(formData);
      toast.success('Conta criada com sucesso!', {
        description: `${formData.fullName} foi cadastrado(a) na plataforma.`,
      });
      router.push('/dashboard');
    } catch {
      toast.error('Erro inesperado ao criar a conta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 md:p-8 bg-wave-50 min-h-screen">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-wave-500 hover:text-wave-700 text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          <h1 className="font-serif text-3xl text-wave-800 font-normal mb-1">Criar Nova Conta</h1>
          <p className="text-wave-500 text-sm">
            Cadastre um novo usuário na plataforma Wave Condominium.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-wave-100 shadow-sm p-6 md:p-8 space-y-10">

          {/* Foto de perfil */}
          <section>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-wave-50 border-2 border-dashed border-wave-200 flex items-center justify-center overflow-hidden">
                  {formData.photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.photoPreview} alt="Pré-visualização da foto de perfil" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-wave-300" />
                  )}
                </div>
                {formData.photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    aria-label="Remover foto"
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-wave-50 border border-wave-200 text-wave-600 rounded-xl hover:border-wave-300 hover:bg-wave-100 transition-all text-sm flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {formData.photoPreview ? 'Trocar foto' : 'Adicionar foto'}
                </button>
                <p className="text-wave-400 text-xs mt-1.5">JPG ou PNG, até 5MB.</p>
              </div>
            </div>
          </section>

          {/* Dados pessoais */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-wave-50 rounded-lg">
                <User className="w-4 h-4 text-wave-500" />
              </div>
              <h2 className="text-wave-800 font-medium">Dados pessoais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-wave-600 text-sm mb-1.5">Nome completo *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Ex: Maria da Silva Santos"
                  className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-wave-600 text-sm mb-1.5">CPF *</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    maxLength={14}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-wave-600 text-sm mb-1.5">Data de nascimento</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-wave-600 text-sm mb-1.5">E-mail *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-wave-600 text-sm mb-1.5">Telefone/WhatsApp *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', formatPhone(e.target.value))}
                    placeholder="(11) 91234-5678"
                    inputMode="numeric"
                    maxLength={16}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Dados do condomínio */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-wave-50 rounded-lg">
                <Building2 className="w-4 h-4 text-wave-500" />
              </div>
              <h2 className="text-wave-800 font-medium">Dados do condomínio</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-wave-600 text-sm mb-1.5">Condomínio *</label>
                <input
                  type="text"
                  value={formData.condominium}
                  onChange={(e) => updateField('condominium', e.target.value)}
                  placeholder="Ex: Residencial Aurora"
                  className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-wave-600 text-sm mb-1.5">Bloco</label>
                <input
                  type="text"
                  value={formData.block}
                  onChange={(e) => updateField('block', e.target.value)}
                  placeholder="Ex: B"
                  className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-wave-600 text-sm mb-1.5">Unidade/Apartamento</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => updateField('unit', e.target.value)}
                  placeholder="Ex: 203"
                  className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                />
              </div>
            </div>
          </section>

          {/* Dados profissionais (opcional) */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-wave-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-wave-500" />
              </div>
              <h2 className="text-wave-800 font-medium">Dados profissionais</h2>
              <span className="text-wave-400 text-xs italic">(opcional)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-wave-600 text-sm mb-1.5">Empresa</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  placeholder="Ex: Growth Tech"
                  className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-wave-600 text-sm mb-1.5">Cargo/Função</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  placeholder="Ex: Técnico de manutenção"
                  className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-wave-600 text-sm mb-1.5">Área de atuação</label>
                <input
                  type="text"
                  value={formData.workArea}
                  onChange={(e) => updateField('workArea', e.target.value)}
                  placeholder="Ex: Elétrica"
                  className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-wave-600 text-sm mb-1.5">CNPJ da empresa</label>
                <input
                  type="text"
                  value={formData.companyCnpj}
                  onChange={(e) => updateField('companyCnpj', formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                  maxLength={18}
                  className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm"
                />
              </div>
            </div>
          </section>

          {/* Credenciais de acesso */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-wave-50 rounded-lg">
                <Lock className="w-4 h-4 text-wave-500" />
              </div>
              <h2 className="text-wave-800 font-medium">Credenciais de acesso</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-wave-600 text-sm mb-1.5">Senha *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
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
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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
          </section>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-wave-100">
            <Link
              href="/dashboard"
              className="flex-1 py-3 bg-wave-50 border border-wave-200 text-wave-600 rounded-xl hover:bg-wave-100 transition-all text-center font-medium text-sm"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-3 bg-wave-500 text-white rounded-xl hover:bg-wave-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 font-medium text-sm"
            >
              {submitting ? 'Criando conta...' : 'Criar conta'}
              {!submitting && <CheckCircle className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
