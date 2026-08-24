import { describe, it, expect } from 'vitest';

import {
  totalDespesas,
  agruparPorCategoria,
  validarNovaDespesa,
  montarDespesa,
  CATEGORIA_COR,
  type Despesa,
  type NovaDespesaInput,
} from './despesas';

function d(overrides: Partial<Despesa> = {}): Despesa {
  return { id: 'D', descricao: 'x', categoria: 'Outras', valor: 100, data: '2026-08-01', origemRecurso: 'saldo', ...overrides };
}

function input(overrides: Partial<NovaDespesaInput> = {}): NovaDespesaInput {
  return { categoria: 'Manutenção', descricao: 'Troca de bomba', valor: 500, data: '2026-08-10', origemRecurso: 'saldo', ...overrides };
}

describe('totalDespesas', () => {
  it('soma os valores', () => {
    expect(totalDespesas([d({ valor: 100 }), d({ valor: 250 }), d({ valor: 50 })])).toBe(400);
  });

  it('retorna 0 para lista vazia', () => {
    expect(totalDespesas([])).toBe(0);
  });
});

describe('agruparPorCategoria', () => {
  it('soma por categoria, ordena desc e calcula percentual', () => {
    const out = agruparPorCategoria([
      d({ categoria: 'Manutenção', valor: 200 }),
      d({ categoria: 'Manutenção', valor: 100 }),
      d({ categoria: 'Energia', valor: 100 }),
    ]);
    expect(out.map((c) => c.categoria)).toEqual(['Manutenção', 'Energia']);
    expect(out[0].valor).toBe(300);
    expect(out[0].percentual).toBe(75); // 300 de 400
    expect(out[1].percentual).toBe(25);
  });

  it('anexa a cor de cada categoria', () => {
    const out = agruparPorCategoria([d({ categoria: 'Funcionários', valor: 10 })]);
    expect(out[0].cor).toBe(CATEGORIA_COR['Funcionários']);
  });

  it('lida com total zero sem dividir por zero', () => {
    const out = agruparPorCategoria([d({ categoria: 'Água', valor: 0 })]);
    expect(out[0].percentual).toBe(0);
  });

  it('não muta a entrada', () => {
    const lista = [d({ categoria: 'Energia', valor: 1 }), d({ categoria: 'Água', valor: 2 })];
    const snap = [...lista];
    agruparPorCategoria(lista);
    expect(lista).toEqual(snap);
  });
});

describe('validarNovaDespesa', () => {
  it('aceita um input completo', () => {
    expect(validarNovaDespesa(input())).toBeNull();
  });

  it('exige descrição, valor > 0 e data', () => {
    expect(validarNovaDespesa(input({ descricao: '  ' }))).toMatch(/descrição/i);
    expect(validarNovaDespesa(input({ valor: 0 }))).toMatch(/valor/i);
    expect(validarNovaDespesa(input({ valor: -5 }))).toMatch(/valor/i);
    expect(validarNovaDespesa(input({ data: '' }))).toMatch(/data/i);
  });
});

describe('montarDespesa', () => {
  it('monta a despesa com id fornecido e normaliza a descrição', () => {
    const desp = montarDespesa(input({ descricao: '  Pintura  ' }), 'DESP-X');
    expect(desp.id).toBe('DESP-X');
    expect(desp.descricao).toBe('Pintura');
    expect(desp.origemRecurso).toBe('saldo');
  });

  it('comprovante vazio vira undefined', () => {
    expect(montarDespesa(input({ comprovanteNome: '   ' }), 'DESP-Y').comprovanteNome).toBeUndefined();
    expect(montarDespesa(input({ comprovanteNome: 'nota.pdf' }), 'DESP-Z').comprovanteNome).toBe('nota.pdf');
  });
});
