'use client';

import { Vote, CheckCircle, XCircle, Users, Activity, Trophy } from 'lucide-react';

import type { GovernanceStats } from './useGovernance';
import { apurar } from './governanceCore';

/** Indicadores do módulo de Governança (spec: Dashboard da Governança). */
export function GovernanceDashboard({ stats }: { stats: GovernanceStats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Metric icon={<Vote className="h-5 w-5 text-wave-600" />} label="Em votacao" value={stats.emVotacao} tint="bg-wave-100" />
        <Metric icon={<CheckCircle className="h-5 w-5 text-green-600" />} label="Aprovadas" value={stats.aprovadas} tint="bg-green-100" />
        <Metric icon={<XCircle className="h-5 w-5 text-red-600" />} label="Rejeitadas" value={stats.rejeitadas} tint="bg-red-100" />
        <Metric icon={<Users className="h-5 w-5 text-purple-600" />} label="Participantes" value={stats.totalParticipantes} tint="bg-purple-100" />
        <Metric icon={<Activity className="h-5 w-5 text-amber-600" />} label="Participacao" value={`${stats.taxaParticipacao}%`} tint="bg-amber-100" />
      </div>

      {stats.ranking.length > 0 && (
        <div className="rounded-2xl border border-wave-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
          <h3 className="mb-3 flex items-center gap-2 text-wave-800">
            <Trophy className="h-5 w-5 text-amber-500" />
            Propostas mais votadas
          </h3>
          <ol className="space-y-2">
            {stats.ranking.map((p, i) => {
              const ap = apurar(p);
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-wave-50 px-3 py-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wave-200 text-sm font-medium text-wave-700">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-wave-800">{p.titulo}</span>
                  <span className="shrink-0 text-sm font-medium text-green-600">{ap.percentAprovacao}%</span>
                  <span className="shrink-0 text-xs text-wave-500">{ap.aprovo} votos</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number | string; tint: string }) {
  return (
    <div className="rounded-2xl border border-wave-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className={`mb-2 inline-flex rounded-xl p-2 ${tint}`}>{icon}</div>
      <p className="text-2xl text-wave-800">{value}</p>
      <p className="text-xs text-wave-500">{label}</p>
    </div>
  );
}
