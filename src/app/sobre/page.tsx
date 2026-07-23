'use client';

import { Vote, Wallet, Wrench, MessageSquare, FileText, Shield, ArrowRight, Users, Clock, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { BuildingAnimation } from '@/components/BuildingAnimation';

export default function Sobre() {
  const features = [
    { icon: Vote,          title: 'Governança Digital',  description: 'Crie propostas, vote em assembleias e acompanhe decisões com total transparência.' },
    { icon: Wallet,        title: 'Gestão Financeira',   description: 'Controle de boletos, tesouraria e transações com auditabilidade completa.' },
    { icon: Wrench,        title: 'Manutenção & OS',     description: 'Abra chamados, acompanhe manutenções e gerencie ordens de serviço.' },
    { icon: MessageSquare, title: 'Comunicação',         description: 'Avisos, reservas de áreas comuns e comunicados integrados.' },
    { icon: FileText,      title: 'Documentos',          description: 'Atas, contratos e documentos com acesso controlado e integridade garantida.' },
    { icon: Shield,        title: 'Segurança total',     description: 'Decisões registradas de forma permanente e verificável por qualquer morador.' },
  ];

  const benefits = [
    { icon: Users,       text: 'Gestão colaborativa e transparente' },
    { icon: Clock,       text: 'Economia de tempo em processos manuais' },
    { icon: Lock,        text: 'Segurança e auditabilidade garantidas' },
    { icon: CheckCircle, text: 'Experiência simples e intuitiva' },
  ];

  return (
    <div className="min-h-screen bg-wave-50">

      <header className="bg-white border-b border-wave-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-wave-500 flex items-center justify-center">
              <span className="text-white font-serif text-sm">W</span>
            </div>
            <span className="font-serif text-xl text-wave-800">Wave</span>
          </div>
          <Link
            href="/login"
            className="px-5 py-2 bg-wave-500 text-white rounded-xl hover:bg-wave-600 transition-colors text-sm flex items-center gap-2"
          >
            Acessar plataforma
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
        <div className="flex flex-col justify-center px-10 lg:px-20 py-16 bg-wave-50">
          <p className="text-wave-400 text-sm italic font-serif mb-4">Gestão condominial inteligente</p>
          <h1 className="font-serif text-4xl lg:text-5xl text-wave-800 font-normal leading-tight mb-6">
            Transparência real para o seu condomínio
          </h1>
          <p className="text-wave-400 text-base leading-relaxed mb-10 max-w-md">
            Governança auditável, documentos protegidos e decisões registradas de forma segura e permanente — sem complicação para moradores e síndicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-wave-800 text-white rounded-xl hover:bg-wave-700 transition-colors font-serif text-base"
            >
              Começar agora
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-white border border-wave-200 text-wave-600 rounded-xl hover:border-wave-400 transition-colors text-sm"
            >
              Ver demonstração
            </Link>
          </div>
        </div>

        <div className="bg-[#0A0F2E] flex items-end justify-center overflow-hidden">
          <div className="w-full max-w-[380px] h-[300px] sm:h-[400px]">
            <BuildingAnimation />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-wave-100">
        {[
          { num: '500k+', label: 'Condomínios no Brasil' },
          { num: '100%',  label: 'Decisões auditáveis' },
          { num: '92%',   label: 'Satisfação dos moradores' },
          { num: '0',     label: 'Fraudes registradas' },
        ].map((m, i) => (
          <div key={i} className="bg-white py-6 px-8 text-center border-r border-wave-100 last:border-0">
            <p className="font-serif text-3xl text-wave-800 font-normal">{m.num}</p>
            <p className="text-wave-400 text-xs mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl border border-wave-100 p-6 hover:border-wave-300 transition-all">
              <b.icon className="w-5 h-5 text-wave-400 mb-3" />
              <p className="text-wave-700 text-sm leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <p className="text-wave-400 text-sm italic font-serif mb-3">Módulos integrados</p>
          <h2 className="font-serif text-3xl text-wave-800 font-normal">Tudo em um só lugar</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-wave-100 p-6 hover:border-wave-300 hover:-translate-y-0.5 transition-all">
              <div className="w-9 h-9 rounded-lg bg-wave-50 border border-wave-100 flex items-center justify-center mb-4">
                <f.icon className="w-4 h-4 text-wave-500" />
              </div>
              <h3 className="font-serif text-lg text-wave-800 font-normal mb-2">{f.title}</h3>
              <p className="text-wave-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-wave-800 rounded-2xl p-10 md:p-14 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white font-normal mb-4">
            Pronto para transformar a gestão do seu condomínio?
          </h2>
          <p className="text-wave-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Governança simples, decisões seguras e moradores mais satisfeitos — tudo em uma plataforma.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-3 bg-white text-wave-800 rounded-xl hover:bg-wave-50 transition-colors font-serif"
          >
            Acessar plataforma
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-wave-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-wave-500 flex items-center justify-center">
              <span className="text-white font-serif text-xs">W</span>
            </div>
            <span className="font-serif text-wave-800">Wave</span>
          </div>
          <p className="text-wave-400 text-xs italic font-serif">Gestão Condominial Inteligente · © 2026</p>
        </div>
      </footer>
    </div>
  );
}
