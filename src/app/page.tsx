'use client';

import { Vote, Wallet, Wrench, MessageSquare, FileText, Shield, ArrowRight, Users, Clock, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

function BuildingAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const COLS = 5, ROWS = 8;
    const ALL: [number,number][] = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        ALL.push([c, r]);

    const W = new Set([
      '0,0','4,0',
      '0,1','4,1',
      '0,2','4,2',
      '0,3','4,3',
      '0,4','1,4','3,4','4,4',
      '1,5','2,5','3,5',
      '1,6','4,6',
      '2,7','3,7',
    ]);

    function getEl(c: number, r: number) {
      return document.getElementById(`j${c}r${r}`);
    }

    function setLight(c: number, r: number, color: string, opacity: number) {
      const e = getEl(c, r);
      if (!e) return;
      e.setAttribute('fill', color);
      e.setAttribute('opacity', String(opacity));
    }

    function dim(c: number, r: number)  { setLight(c, r, '#0D1430', 1); }
    function warmOn(c: number, r: number){ setLight(c, r, '#F5D78A', 1); }
    function wOn(c: number, r: number)  { setLight(c, r, '#FFFFFF', 1); }
    function wGlow(c: number, r: number){ setLight(c, r, '#D4EAFF', 0.95); }

    // Fase 1 — ruído
    const randomOn = new Set<string>();
    const noise = setInterval(() => {
      const [c, r] = ALL[Math.floor(Math.random() * ALL.length)];
      const key = `${c},${r}`;
      if (randomOn.has(key)) {
        randomOn.delete(key);
        dim(c, r);
      } else {
        randomOn.add(key);
        Math.random() < 0.5
          ? warmOn(c, r)
          : setLight(c, r, '#C8D8FF', 0.8);
      }
    }, 55);

    const t1 = setTimeout(() => {
      clearInterval(noise);
      ALL.forEach(([c, r]) => dim(c, r));

      const t2 = setTimeout(() => {
        // Fase 2 — revelar W linha por linha
        const wByRow: [number,number][][] = [];
        for (let r = 0; r < ROWS; r++) {
          const row: [number,number][] = [];
          for (let c = 0; c < COLS; c++)
            if (W.has(`${c},${r}`)) row.push([c, r]);
          if (row.length) wByRow.push(row);
        }

        let rowIdx = 0;
        const reveal = setInterval(() => {
          if (rowIdx >= wByRow.length) {
            clearInterval(reveal);
            const t3 = setTimeout(startLoop, 400);
            return () => clearTimeout(t3);
          }
          wByRow[rowIdx].forEach(([c, r]) => wOn(c, r));
          rowIdx++;
        }, 160);

        return () => clearInterval(reveal);
      }, 500);

      return () => clearTimeout(t2);
    }, 2000);

    function startLoop() {
      let tick = 0;
      const residents = new Map<string, ReturnType<typeof setTimeout>>();

      const loop = setInterval(() => {
        tick++;
        W.forEach(key => {
          const [cs, rs] = key.split(',');
          tick % 10 < 5
            ? wOn(parseInt(cs), parseInt(rs))
            : wGlow(parseInt(cs), parseInt(rs));
        });

        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (W.has(`${c},${r}`)) continue;
            const key = `${c},${r}`;
            if (!residents.has(key) && Math.random() < 0.012) {
              warmOn(c, r);
              const t = setTimeout(() => {
                dim(c, r);
                residents.delete(key);
              }, 1500 + Math.random() * 3500);
              residents.set(key, t);
            }
          }
        }
      }, 200);

      return () => {
        clearInterval(loop);
        residents.forEach(t => clearTimeout(t));
      };
    }

    return () => clearTimeout(t1);
  }, []);

  return (
    <svg ref={svgRef} width="380" height="400" viewBox="0 0 380 400" xmlns="http://www.w3.org/2000/svg">
      {/* Céu */}
      <rect x="0" y="0" width="380" height="340" fill="#0A0F2E"/>
      {/* Estrelas */}
      <circle cx="30"  cy="20" r="1"  fill="#fff" opacity=".5"/>
      <circle cx="80"  cy="38" r=".8" fill="#fff" opacity=".4"/>
      <circle cx="140" cy="15" r="1"  fill="#fff" opacity=".6"/>
      <circle cx="220" cy="28" r=".8" fill="#fff" opacity=".4"/>
      <circle cx="300" cy="18" r="1"  fill="#fff" opacity=".5"/>
      <circle cx="350" cy="42" r=".8" fill="#fff" opacity=".3"/>
      <circle cx="55"  cy="55" r=".6" fill="#fff" opacity=".4"/>
      <circle cx="310" cy="60" r=".6" fill="#fff" opacity=".3"/>

      {/* Prédio fundo esquerda */}
      <rect x="5"  y="160" width="55" height="180" fill="#111835" rx="1" opacity=".8"/>
      <rect x="5"  y="155" width="55" height="7"   fill="#0D1430" rx="1"/>
      <rect x="20" y="148" width="28" height="9"   fill="#0A1028" rx="1"/>
      <rect x="11" y="167" width="9" height="7" fill="#1E2761" rx="1" opacity=".5"/>
      <rect x="24" y="167" width="9" height="7" fill="#2A3570" rx="1" opacity=".4"/>
      <rect x="37" y="167" width="9" height="7" fill="#1E2761" rx="1" opacity=".6"/>
      <rect x="11" y="180" width="9" height="7" fill="#2A3570" rx="1" opacity=".5"/>
      <rect x="24" y="180" width="9" height="7" fill="#1E2761" rx="1" opacity=".6"/>
      <rect x="37" y="180" width="9" height="7" fill="#2A3570" rx="1" opacity=".4"/>
      <rect x="11" y="193" width="9" height="7" fill="#1E2761" rx="1" opacity=".5"/>
      <rect x="24" y="193" width="9" height="7" fill="#1E2761" rx="1" opacity=".6"/>
      <rect x="37" y="193" width="9" height="7" fill="#2A3570" rx="1" opacity=".5"/>

      {/* Prédio fundo direita */}
      <rect x="316" y="175" width="60" height="165" fill="#111835" rx="1" opacity=".7"/>
      <rect x="316" y="170" width="60" height="7"   fill="#0D1430" rx="1"/>
      <rect x="330" y="163" width="30" height="9"   fill="#0A1028" rx="1"/>
      <rect x="322" y="182" width="9" height="7" fill="#2A3570" rx="1" opacity=".5"/>
      <rect x="335" y="182" width="9" height="7" fill="#1E2761" rx="1" opacity=".6"/>
      <rect x="348" y="182" width="9" height="7" fill="#2A3570" rx="1" opacity=".4"/>
      <rect x="361" y="182" width="9" height="7" fill="#1E2761" rx="1" opacity=".6"/>
      <rect x="322" y="195" width="9" height="7" fill="#1E2761" rx="1" opacity=".6"/>
      <rect x="335" y="195" width="9" height="7" fill="#2A3570" rx="1" opacity=".5"/>
      <rect x="348" y="195" width="9" height="7" fill="#1E2761" rx="1" opacity=".6"/>
      <rect x="361" y="195" width="9" height="7" fill="#2A3570" rx="1" opacity=".4"/>

      {/* Caixa d'água */}
      <rect x="138" y="22" width="104" height="26" fill="#121840" rx="2"/>
      <rect x="155" y="14" width="70"  height="12" fill="#0D1430" rx="2"/>
      <rect x="173" y="8"  width="6"   height="8"  fill="#0A1028" rx="1"/>
      <rect x="201" y="8"  width="6"   height="8"  fill="#0A1028" rx="1"/>
      <line x1="190" y1="8" x2="190" y2="1" stroke="#1E2761" strokeWidth="1.5"/>
      <circle cx="190" cy="1" r="2.5" fill="#4A5FC1" opacity=".8"/>

      {/* Platibanda */}
      <rect x="82" y="46" width="216" height="8" fill="#121840" rx="1"/>

      {/* Corpo do prédio */}
      <rect x="86" y="52" width="208" height="272" fill="#151C45" rx="1"/>

      {/* Estrutura vertical */}
      <rect x="86"  y="52" width="7" height="272" fill="#0D1430"/>
      <rect x="287" y="52" width="7" height="272" fill="#0D1430"/>
      <rect x="152" y="52" width="4" height="272" fill="#0D1430" opacity=".7"/>
      <rect x="224" y="52" width="4" height="272" fill="#0D1430" opacity=".7"/>

      {/* Lajes / varandas */}
      {[52,82,112,142,172,202,232,262,292].map(y => (
        <rect key={y} x="86" y={y} width="208" height="3" fill="#0D1430"/>
      ))}

      {/* Pilotis */}
      <rect x="86" y="322" width="208" height="5" fill="#121840"/>
      {[96,118,143,168,193,218,243,268].map(x => (
        <rect key={x} x={x} y="296" width="8" height="30" fill="#0D1430"/>
      ))}

      {/* Entrada */}
      <rect x="150" y="296" width="80" height="32" fill="#0D1028"/>
      <rect x="154" y="299" width="32" height="29" fill="#151C45" rx="1" opacity=".7"/>
      <rect x="190" y="299" width="32" height="29" fill="#151C45" rx="1" opacity=".7"/>
      <line x1="170" y1="299" x2="170" y2="328" stroke="#1E2761" strokeWidth=".8"/>
      <line x1="206" y1="299" x2="206" y2="328" stroke="#1E2761" strokeWidth=".8"/>
      <circle cx="174" cy="314" r="2" fill="#4A5FC1" opacity=".9"/>
      <circle cx="210" cy="314" r="2" fill="#4A5FC1" opacity=".9"/>
      <rect x="150" y="296" width="80" height="4" fill="#4A5FC1" opacity=".5"/>
      <ellipse cx="190" cy="300" rx="30" ry="8" fill="#4A5FC1" opacity=".08"/>

      {/* Calçada */}
      <rect x="0" y="326" width="380" height="12" fill="#0A0F2E"/>
      <rect x="0" y="336" width="380" height="8"  fill="#080D28" opacity=".9"/>
      <ellipse cx="190" cy="332" rx="40" ry="5" fill="#4A5FC1" opacity=".1"/>

      {/* Janelas animáveis — 5 col × 8 andares */}
      {Array.from({length: 8}, (_, r) =>
        Array.from({length: 5}, (_, c) => (
          <rect
            key={`${c}${r}`}
            id={`j${c}r${r}`}
            x={97 + c * 34}
            y={56 + r * 30}
            width="28"
            height="22"
            fill="#0D1430"
            rx="1.5"
          />
        ))
      )}
    </svg>
  );
}

export default function Home() {
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

      {/* Header */}
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

      {/* Hero — split */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px]">
        {/* Lado esquerdo — texto */}
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

        {/* Lado direito — prédio animado */}
        <div className="bg-[#0A0F2E] flex items-end justify-center overflow-hidden">
          <BuildingAnimation />
        </div>
      </section>

      {/* Métricas */}
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

      {/* Benefícios */}
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

      {/* Features */}
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

      {/* CTA final */}
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

      {/* Footer */}
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
