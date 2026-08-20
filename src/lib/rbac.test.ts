import { describe, it, expect } from "vitest";
import { isManager, isPlatformAdmin, isAdministradora } from "./rbac";

// RBAC é o coração da segurança do Wave: um erro aqui libera ou bloqueia
// funcionalidades inteiras para o perfil errado. Estes testes travam o
// contrato dos papéis (inclusive a hierarquia Admin/Administradora ⊃ Síndico).

describe("isManager", () => {
  it("retorna true para papéis de gestão (Síndico, Admin, Administradora)", () => {
    expect(isManager("Síndico")).toBe(true);
    expect(isManager("Admin")).toBe(true);
    expect(isManager("Administradora")).toBe(true);
  });

  it("retorna false para Morador", () => {
    expect(isManager("Morador")).toBe(false);
  });

  it("retorna false para ausência de papel (undefined/null)", () => {
    expect(isManager(undefined)).toBe(false);
    expect(isManager(null)).toBe(false);
  });
});

describe("isPlatformAdmin", () => {
  it("retorna true apenas para Admin", () => {
    expect(isPlatformAdmin("Admin")).toBe(true);
  });

  it("retorna false para Síndico, Administradora e Morador", () => {
    expect(isPlatformAdmin("Síndico")).toBe(false);
    expect(isPlatformAdmin("Administradora")).toBe(false);
    expect(isPlatformAdmin("Morador")).toBe(false);
  });

  it("retorna false para undefined/null", () => {
    expect(isPlatformAdmin(undefined)).toBe(false);
    expect(isPlatformAdmin(null)).toBe(false);
  });
});

describe("isAdministradora", () => {
  it("retorna true apenas para Administradora", () => {
    expect(isAdministradora("Administradora")).toBe(true);
  });

  it("retorna false para os demais papéis", () => {
    expect(isAdministradora("Admin")).toBe(false);
    expect(isAdministradora("Síndico")).toBe(false);
    expect(isAdministradora("Morador")).toBe(false);
    expect(isAdministradora(null)).toBe(false);
  });
});
