import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
}

export function MetricCard({ label, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-500" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{change}</span>
        </div>
      </div>
      <p className="text-slate-600 text-sm mb-1">{label}</p>
      <p className="text-slate-900 text-2xl">{value}</p>
    </div>
  );
}
