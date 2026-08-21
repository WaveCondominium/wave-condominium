// ---------------------------------------------------------------------------
// src/i18n/messages/es.ts — Diccionario en Español.
// Debe seguir exactamente la misma estructura de claves que pt-BR.ts.
// ---------------------------------------------------------------------------

import type { Messages } from "./pt-BR";

const es: Messages = {
  login: {
    hero: {
      titlePrefix: "Gobernanza de condominio con",
      titleHighlight: "prueba de integridad",
      subtitle:
        "Cada decisión registrada, cada voto auditable y todos los documentos protegidos.",
      features: {
        governanca: {
          label: "Gobernanza",
          desc: "Votaciones con registro inmutable",
        },
        documentos: {
          label: "Documentos",
          desc: "Actas con registro verificable",
        },
        transparencia: {
          label: "Transparencia",
          desc: "Auditable por cualquier residente",
        },
      },
      footer: "© 2026 Wave · Gestión Inteligente de Condominios",
    },
    badge: "Bienvenido(a) de nuevo",
    title: "Acceder a la plataforma",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "tu@correo.com",
    passwordLabel: "Contraseña",
    remember: "Recordarme",
    forgot: "Olvidé mi contraseña",
    signIn: "Entrar",
    signingIn: "Entrando...",
    back: "Volver",
    demo: {
      sindico: "Síndico",
      morador: "Residente",
      administradora: "Administradora",
    },
    errors: {
      fillFields: "Por favor, ingrese su correo y contraseña",
      invalidCredentials: "Verifique sus credenciales.",
      unexpected: "Error inesperado al iniciar sesión.",
    },
  },
  language: {
    selectorLabel: "Seleccionar idioma",
  },
};

export default es;
