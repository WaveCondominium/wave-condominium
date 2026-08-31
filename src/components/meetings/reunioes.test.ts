import { describe, it, expect } from 'vitest';

import {
  STATUS_REUNIAO_LABEL,
  validarNovaReuniao,
  type NovaReuniaoInput,
} from './reunioes';

function nova(overrides: Partial<NovaReuniaoInput> = {}): NovaReuniaoInput {
  return {
    title: 'Assembleia Ordinária',
    description: 'Pauta mensal',
    date: '2026-09-20',
    time: '19:00',
    duration: 120,
    meetLink: '',
    maxParticipants: 100,
    agenda: ['Aprovação da ata', 'Prestação de contas'],
    ...overrides,
  };
}

describe('status de reunião', () => {
  it('rotula os três status', () => {
    expect(STATUS_REUNIAO_LABEL.scheduled).toBe('Agendada');
    expect(STATUS_REUNIAO_LABEL.ongoing).toBe('Ao Vivo');
    expect(STATUS_REUNIAO_LABEL.completed).toBe('Concluída');
  });
});

describe('validarNovaReuniao', () => {
  it('aceita entrada válida', () => {
    expect(validarNovaReuniao(nova())).toBeNull();
  });
  it('exige título', () => {
    expect(validarNovaReuniao(nova({ title: '  ' }))).toMatch(/título/i);
  });
  it('exige descrição', () => {
    expect(validarNovaReuniao(nova({ description: '' }))).toMatch(/descrição/i);
  });
  it('exige data e horário', () => {
    expect(validarNovaReuniao(nova({ date: '' }))).toMatch(/data/i);
    expect(validarNovaReuniao(nova({ time: '' }))).toMatch(/horário/i);
  });
  it('exige ao menos um item de pauta (ignora vazios)', () => {
    expect(validarNovaReuniao(nova({ agenda: ['', '  '] }))).toMatch(/pauta/i);
    expect(validarNovaReuniao(nova({ agenda: [] }))).toMatch(/pauta/i);
  });
});
