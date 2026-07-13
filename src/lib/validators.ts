// ---------------------------------------------------------------------------
// src/lib/validators.ts
//
// Responsabilidade única: validação e formatação de campos de identificação
// brasileiros (CPF, CNPJ, telefone) e e-mail. Extraído para cá porque esses
// mesmos validadores tendem a ser reutilizados em outras telas de cadastro
// futuras (ex: cadastro de unidades, fornecedores) — evita duplicar o
// algoritmo de dígito verificador em cada formulário novo.
// ---------------------------------------------------------------------------

/** Remove tudo que não for dígito */
function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

// --- CPF ---------------------------------------------------------------

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  // Rejeita sequências repetidas (ex: 111.111.111-11), que passariam no
  // cálculo do dígito verificador mas não são CPFs válidos
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i], 10) * (10 - i);
  let firstCheckDigit = 11 - (sum % 11);
  if (firstCheckDigit >= 10) firstCheckDigit = 0;
  if (firstCheckDigit !== parseInt(cpf[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i], 10) * (11 - i);
  let secondCheckDigit = 11 - (sum % 11);
  if (secondCheckDigit >= 10) secondCheckDigit = 0;
  if (secondCheckDigit !== parseInt(cpf[10], 10)) return false;

  return true;
}

export function formatCPF(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// --- CNPJ ----------------------------------------------------------------

export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calcCheckDigit = (base: string): number => {
    const weights = base.length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * weights[i];
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const base12 = cnpj.slice(0, 12);
  if (calcCheckDigit(base12) !== parseInt(cnpj[12], 10)) return false;

  const base13 = cnpj.slice(0, 13);
  if (calcCheckDigit(base13) !== parseInt(cnpj[13], 10)) return false;

  return true;
}

export function formatCNPJ(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

// --- E-mail ----------------------------------------------------------------

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// --- Telefone (Brasil) ------------------------------------------------------

export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);
  // Fixo: DDD (2) + 8 dígitos = 10. Celular: DDD (2) + 9 dígitos = 11.
  return digits.length === 10 || digits.length === 11;
}

export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}
