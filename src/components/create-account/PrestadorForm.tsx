'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Wrench, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CredentialsFields } from './CredentialsFields';
import { salvarConta, validateCredentials } from '@/lib/accounts';
import { isValidEmail, isValidPhone, formatPhone, isValidCPF, formatCPF, isValidCNPJ, formatCNPJ, isValidCEP, formatCEP } from '@/lib/validators';

interface FormState {
  tipoPessoa: 'fisica' | 'juridica';
  nomeOuRazaoSocial: string;
  nomeFantasia: string;
  documento: string;
  responsavel: string;
  email: string;
  celular: string;
  telefone: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  categoriaServico: string;
  descricao: string;
  horarioAtendimento: string;
  password: string;
  confirmPassword: string;
}

const initialState: FormState = {
  tipoPessoa: 'fisica',
  nomeOuRazaoSocial: '',
  nomeFantasia: '',
  documento: '',
  responsavel: '',
  email: '',
  celular: '',
  telefone: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  categoriaServico: '',
  descricao: '',
  horarioAtendimento: '',
  password: '',
  confirmPassword: '',
};

export function PrestadorForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleDocumentoChange(value: string) {
    update('documento', form.tipoPessoa === 'fisica' ? formatCPF(value) : formatCNPJ(value));
  }

  function validate(): string | null {
    if (!form.nomeOuRazaoSocial.trim()) {
      return form.tipoPessoa === 'fisica' ? 'Informe o nome.' : 'Informe a razão social.';
    }
    if (!form.documento.trim()) return `Informe o ${form.tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'}.`;
    if (form.tipoPessoa === 'fisica' && !isValidCPF(form.documento)) return 'CPF inválido. Confira os números digitados.';
    if (form.tipoPessoa === 'juridica' && !isValidCNPJ(form.documento)) return 'CNPJ inválido. Confira os números digitados.';
    if (!form.email.trim()) return 'Informe o e-mail.';
    if (!isValidEmail(form.email)) return 'E-mail inválido.';
    if (!form.celular.trim()) return 'Informe o celular.';
    if (!isValidPhone(form.celular)) return 'Celular inválido.';
    if (form.cep.trim() && !isValidCEP(form.cep)) return 'CEP inválido.';
    if (!form.categoriaServico.trim()) return 'Informe a categoria do serviço.';
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
      salvarConta('prestador', {
        tipoPessoa: form.tipoPessoa,
        nomeOuRazaoSocial: form.nomeOuRazaoSocial.trim(),
        nomeFantasia: form.nomeFantasia.trim() || null,
        documento: form.documento,
        responsavel: form.responsavel.trim() || null,
        email: form.email.trim().toLowerCase(),
        celular: form.celular,
        telefone: form.telefone.trim() || null,
        endereco: {
          cep: form.cep || null,
          rua: form.rua.trim() || null,
          numero: form.numero.trim() || null,
          bairro: form.bairro.trim() || null,
          cidade: form.cidade.trim() || null,
          estado: form.estado.trim() || null,
        },
        categoriaServico: form.categoriaServico.trim(),
        descricao: form.descricao.trim() || null,
        horarioAtendimento: form.horarioAtendimento.trim() || null,
        password: form.password,
      });
      toast.success('Prestador de serviço cadastrado com sucesso!', {
        description: `${form.nomeOuRazaoSocial} foi adicionado(a) à plataforma.`,
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
      <section>
        <h2 className="text-wave-800 font-medium mb-4">Dados básicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Tipo</label>
            <select
              value={form.tipoPessoa}
              onChange={(e) => {
                update('tipoPessoa', e.target.value as 'fisica' | 'juridica');
                update('documento', '');
              }}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm">
              <option value="fisica">Pessoa Física</option>
              <option value="juridica">Pessoa Jurídica</option>
            </select>
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">{form.tipoPessoa === 'fisica' ? 'CPF' : 'CNPJ'} *</label>
            <input type="text" value={form.documento} onChange={(e) => handleDocumentoChange(e.target.value)}
              placeholder={form.tipoPessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
              inputMode="numeric" maxLength={form.tipoPessoa === 'fisica' ? 14 : 18}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">{form.tipoPessoa === 'fisica' ? 'Nome' : 'Razão Social'} *</label>
            <input type="text" value={form.nomeOuRazaoSocial} onChange={(e) => update('nomeOuRazaoSocial', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Nome Fantasia</label>
            <input type="text" value={form.nomeFantasia} onChange={(e) => update('nomeFantasia', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-wave-800 font-medium mb-4">Contato</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Responsável</label>
            <input type="text" value={form.responsavel} onChange={(e) => update('responsavel', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">E-mail *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                placeholder="contato@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Celular *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={form.celular} onChange={(e) => update('celular', formatPhone(e.target.value))}
                placeholder="(11) 91234-5678" inputMode="numeric" maxLength={16}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Telefone (opcional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-wave-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={form.telefone} onChange={(e) => update('telefone', formatPhone(e.target.value))}
                inputMode="numeric" maxLength={16}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-wave-500" />
          <h2 className="text-wave-800 font-medium">Endereço</h2>
          <span className="text-wave-400 text-xs italic">(opcional)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">CEP</label>
            <input type="text" value={form.cep} onChange={(e) => update('cep', formatCEP(e.target.value))}
              placeholder="00000-000" inputMode="numeric" maxLength={9}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-wave-600 text-sm mb-1.5">Rua</label>
            <input type="text" value={form.rua} onChange={(e) => update('rua', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Número</label>
            <input type="text" value={form.numero} onChange={(e) => update('numero', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Bairro</label>
            <input type="text" value={form.bairro} onChange={(e) => update('bairro', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Cidade</label>
            <input type="text" value={form.cidade} onChange={(e) => update('cidade', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Estado</label>
            <input type="text" value={form.estado} onChange={(e) => update('estado', e.target.value)}
              placeholder="Ex: SP" maxLength={2}
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-4 h-4 text-wave-500" />
          <h2 className="text-wave-800 font-medium">Serviço</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Categoria do serviço *</label>
            <input type="text" value={form.categoriaServico} onChange={(e) => update('categoriaServico', e.target.value)}
              placeholder="Ex: Elétrica, Encanamento, Limpeza"
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-wave-600 text-sm mb-1.5">Horário de atendimento</label>
            <input type="text" value={form.horarioAtendimento} onChange={(e) => update('horarioAtendimento', e.target.value)}
              placeholder="Ex: Seg a Sex, 8h-18h"
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-wave-600 text-sm mb-1.5">Descrição</label>
            <textarea value={form.descricao} onChange={(e) => update('descricao', e.target.value)} rows={3}
              placeholder="Descreva os serviços prestados..."
              className="w-full px-4 py-2.5 bg-white border border-wave-200 rounded-xl text-wave-800 placeholder-wave-300 focus:outline-none focus:ring-2 focus:ring-wave-300 focus:border-wave-400 transition-all text-sm resize-none" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-wave-800 font-medium mb-4">Acesso</h2>
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
