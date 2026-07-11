'use client';

import { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Extraido de src/app/page.tsx (landing page) para ser reutilizavel.
// A LOGICA DE ANIMACAO NAO FOI ALTERADA - apenas o SVG deixou de ter
// width/height fixos (380x400) e passou a ocupar 100% do container pai,
// via className + viewBox, para poder servir tanto como elemento de
// tamanho fixo (landing) quanto como fundo de painel inteiro (login).
// ---------------------------------------------------------------------------
export function BuildingAnimation({ className = 'w-full h-full' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const COLS = 5, ROWS = 8;
    const ALL: [number, number][] = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        ALL.push([c, r]);

    const W = new Set([
      '0,0', '4,0',
      '0,1', '4,1',
      '0,2', '4,2',
      '0,3', '4,3',
      '0,4', '1,4', '3,4', '4,4',
      '1,5', '2,5', '3,5',
      '1,6', '4,6',
      '2,7', '3,7',
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

    function dim(c: number, r: number) { setLight(c, r, '#0D1430', 1); }
    function warmOn(c: number, r: number) { setLight(c, r, '#F5D78A', 1); }
    function wOn(c: number, r: number) { setLight(c, r, '#FFFFFF', 1); }
    function wGlow(c: number, r: number) { setLight(c, r, '#D4EAFF', 0.95); }

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
        const wByRow: [number, number][][] = [];
        for (let r = 0; r < ROWS; r++) {
          const row: [number, number][] = [];
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
    <svg ref={svgRef} className={className} viewBox="0 0 380 400" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="380" height="340" fill="#0A0F2E"/>
      <circle cx="30"  cy="20" r="1"  fill="#fff" opacity=".5"/>
      <circle cx="80"  cy="38" r=".8" fill="#fff" opacity=".4"/>
      <circle cx="140" cy="15" r="1"  fill="#fff" opacity=".6"/>
      <circle cx="220" cy="28" r=".8" fill="#fff" opacity=".4"/>
      <circle cx="300" cy="18" r="1"  fill="#fff" opacity=".5"/>
      <circle cx="350" cy="42" r=".8" fill="#fff" opacity=".3"/>
      <circle cx="55"  cy="55" r=".6" fill="#fff" opacity=".4"/>
      <circle cx="310" cy="60" r=".6" fill="#fff" opacity=".3"/>

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

      <rect x="138" y="22" width="104" height="26" fill="#121840" rx="2"/>
      <rect x="155" y="14" width="70"  height="12" fill="#0D1430" rx="2"/>
      <rect x="173" y="8"  width="6"   height="8"  fill="#0A1028" rx="1"/>
      <rect x="201" y="8"  width="6"   height="8"  fill="#0A1028" rx="1"/>
      <line x1="190" y1="8" x2="190" y2="1" stroke="#1E2761" strokeWidth="1.5"/>
      <circle cx="190" cy="1" r="2.5" fill="#4A5FC1" opacity=".8"/>

      <rect x="82" y="46" width="216" height="8" fill="#121840" rx="1"/>

      <rect x="86" y="52" width="208" height="272" fill="#151C45" rx="1"/>

      <rect x="86"  y="52" width="7" height="272" fill="#0D1430"/>
      <rect x="287" y="52" width="7" height="272" fill="#0D1430"/>
      <rect x="152" y="52" width="4" height="272" fill="#0D1430" opacity=".7"/>
      <rect x="224" y="52" width="4" height="272" fill="#0D1430" opacity=".7"/>

      {[52, 82, 112, 142, 172, 202, 232, 262, 292].map(y => (
        <rect key={y} x="86" y={y} width="208" height="3" fill="#0D1430"/>
      ))}

      <rect x="86" y="322" width="208" height="5" fill="#121840"/>
      {[96, 118, 143, 168, 193, 218, 243, 268].map(x => (
        <rect key={x} x={x} y="296" width="8" height="30" fill="#0D1430"/>
      ))}

      <rect x="150" y="296" width="80" height="32" fill="#0D1028"/>
      <rect x="154" y="299" width="32" height="29" fill="#151C45" rx="1" opacity=".7"/>
      <rect x="190" y="299" width="32" height="29" fill="#151C45" rx="1" opacity=".7"/>
      <line x1="170" y1="299" x2="170" y2="328" stroke="#1E2761" strokeWidth=".8"/>
      <line x1="206" y1="299" x2="206" y2="328" stroke="#1E2761" strokeWidth=".8"/>
      <circle cx="174" cy="314" r="2" fill="#4A5FC1" opacity=".9"/>
      <circle cx="210" cy="314" r="2" fill="#4A5FC1" opacity=".9"/>
      <rect x="150" y="296" width="80" height="4" fill="#4A5FC1" opacity=".5"/>
      <ellipse cx="190" cy="300" rx="30" ry="8" fill="#4A5FC1" opacity=".08"/>

      <rect x="0" y="326" width="380" height="12" fill="#0A0F2E"/>
      <rect x="0" y="336" width="380" height="8"  fill="#080D28" opacity=".9"/>
      <ellipse cx="190" cy="332" rx="40" ry="5" fill="#4A5FC1" opacity=".1"/>

      {Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => (
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
