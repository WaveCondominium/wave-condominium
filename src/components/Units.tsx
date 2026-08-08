'use client';

import {
  Home, User, Key, Users, Plus, X, Search, Edit2, CheckCircle,
  Building2, Ruler, AlertCircle, Layers, Dumbbell, PartyPopper,
  Waves, TreePine, Flame, Trophy, UtensilsCrossed, Car, ShieldCheck,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface Unit {
  id: string;
  number: string;
  floor: number;
  block?: string;
  status: 'Ocupado' | 'Alugado' | 'Vago';
  owner: string;
  tenant?: string;
  votingPower: number;
  area: string;
  residents: number;
  lastTransfer: string;
  email?: string;
  phone?: string;
}

const INITIAL_UNITS: Unit[] = [
  { id: '101', number: '101', floor: 1, status: 'Ocupado', owner: 'João Silva', votingPower: 1, area: '85 m²', residents: 3, lastTransfer: '15/03/2020', email: 'joao@email.com', phone: '(21) 99999-0101' },
  { id: '102', number: '102', floor: 1, status: 'Alugado', owner: 'Maria Santos', tenant: 'Carlos Souza', votingPower: 1, area: '85 m²', residents: 2, lastTransfer: '22/08/2021', email: 'maria@email.com', phone: '(21) 99999-0102' },
  { id: '103', number: '103', floor: 1, status: 'Vago', owner: 'Pedro Costa', votingPower: 1, area: '85 m²', residents: 0, lastTransfer: '10/11/2024', email: 'pedro@email.com', phone: '(21) 99999-0103' },
  { id: '104', number: '104', floor: 1, status: 'Ocupado', owner: 'Ana Lima', votingPower: 1, area: '85 m²', residents: 4, lastTransfer: '05/01/2019', email: 'ana@email.com', phone: '(21) 99999-0104' },
  { id: '201', number: '201', floor: 2, status: 'Ocupado', owner: 'Fernanda Alves', votingPower: 1, area: '92 m²', residents: 2, lastTransfer: '18/06/2020', email: 'fernanda@email.com', phone: '(21) 99999-0201' },
  { id: '202', number: '202', floor: 2, status: 'Ocupado', owner: 'Roberto Dias', votingPower: 1, area: '92 m²', residents: 3, lastTransfer: '30/09/2018', email: 'roberto@email.com', phone: '(21) 99999-0202' },
  { id: '203', number: '203', floor: 2, status: 'Alugado', owner: 'Juliana Mendes', tenant: 'Lucas Pereira', votingPower: 1, area: '92 m²', residents: 1, lastTransfer: '12/04/2022', email: 'juliana@email.com', phone: '(21) 99999-0203' },
  { id: '204', number: '204', floor: 2, status: 'Ocupado', owner: 'Ricardo Campos', votingPower: 1, area: '92 m²', residents: 2, lastTransfer: '25/02/2021', email: 'ricardo@email.com', phone: '(21) 99999-0204' },
  { id: '301', number: '301', floor: 3, status: 'Ocupado', owner: 'Camila Rocha', votingPower: 1, area: '110 m²', residents: 3, lastTransfer: '08/07/2019', email: 'camila@email.com', phone: '(21) 99999-0301' },
  { id: '302', number: '302', floor: 3, status: 'Vago', owner: 'Empresa XYZ Ltda', votingPower: 1, area: '110 m²', residents: 0, lastTransfer: '01/01/2023', email: 'xyz@empresa.com', phone: '(21) 3333-0302' },
];

const statusColors: Record<string, string> = {
  'Ocupado': 'bg-brand-teal/15 text-brand-teal',
  'Alugado': 'bg-blue-100 text-blue-700',
  'Vago': 'bg-gray-100 text-gray-600',
};

export function Units() {
  const { userProfile } = useUser();
  const isMorador = userProfile.role === 'Morador';

  if (isMorador) {
    return <MoradorUnitView />;
  }

  return <AdminUnitsView />;
}

// ===========================================================================
// MORADOR — Visualização somente leitura da própria unidade
// ===========================================================================

// Áreas comuns do condomínio — dados agregados, sem informação pessoal
const COMMON_AREAS: { label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { label: 'Salão de Festas',      icon: PartyPopper,       color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'Churrasqueira',        icon: Flame,             color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Quadra Poliesportiva', icon: Trophy,            color: 'text-brand-teal', bg: 'bg-brand-teal/15' },
  { label: 'Espaço Gourmet',       icon: UtensilsCrossed,   color: 'text-rose-600',   bg: 'bg-rose-100' },
  { label: 'Academia',             icon: Dumbbell,          color: 'text-blue-600',   bg: 'bg-blue-100' },
  { label: 'Piscina',              icon: Waves,             color: 'text-cyan-600',   bg: 'bg-cyan-100' },
  { label: 'Playground',           icon: TreePine,          color: 'text-green-600',  bg: 'bg-green-100' },
  { label: 'Estacionamento',       icon: Car,               color: 'text-gray-600',   bg: 'bg-gray-100' },
];

function MoradorUnitView() {
  const { userProfile } = useUser();
  const [units] = useLocalStorage<Unit[]>('wave_units', INITIAL_UNITS);

  // Normaliza o número da unidade do perfil (ex: "Apto 203" → "203")
  const normalizedUnit = useMemo(() => {
    return (userProfile.unit ?? '').replace(/[^0-9]/g, '').trim();
  }, [userProfile.unit]);

  // Busca a unidade correspondente
  const myUnit = useMemo(() => {
    if (!normalizedUnit) return null;
    return units.find(u => u.number === normalizedUnit) ?? null;
  }, [units, normalizedUnit]);

  // Dados agregados do condomínio (sem informação pessoal)
  const condoStats = useMemo(() => {
    const totalUnits = units.length;
    const floors = new Set(units.map(u => u.floor));
    const blocks = new Set(units.map(u => u.block).filter(Boolean));
    return {
      totalUnits,
      totalFloors: floors.size,
      totalBlocks: blocks.size,
      blockNames: Array.from(blocks).sort() as string[],
    };
  }, [units]);

  // Extrai bloco do formato "Apto 203" ou da unit.block
  const blockLabel = myUnit?.block || null;
  const floorLabel = myUnit ? `${myUnit.floor}º andar` : null;

  // Campos para exibição da unidade
  const infoFields: { label: string; value: string | null; icon: React.ElementType }[] = [
    {
      label: 'Unidade',
      value: myUnit?.number ? `Apto ${myUnit.number}` : userProfile.unit || null,
      icon: Home,
    },
    {
      label: 'Bloco',
      value: blockLabel,
      icon: Building2,
    },
    {
      label: 'Andar',
      value: floorLabel,
      icon: Building2,
    },
    {
      label: 'Metragem',
      value: myUnit?.area || null,
      icon: Ruler,
    },
    {
      label: 'Proprietário',
      value: myUnit?.owner || null,
      icon: User,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-brand-light min-h-screen relative">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-brand-navy text-2xl sm:text-3xl mb-1">Unidades</h1>
        <p className="text-wave-500 text-sm">
          Informações da sua unidade e do condomínio
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ────────────────────────────────────────────────────────────── */}
        {/* Coluna 1: Minha Unidade                                      */}
        {/* ────────────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-wave-800 text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
            <Home className="w-4 h-4 text-wave-400" />
            Minha Unidade
          </h2>

          {!myUnit && !normalizedUnit ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 shadow-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-wave-300 mx-auto mb-4" />
              <p className="text-wave-700 font-medium mb-1">Nenhuma unidade vinculada</p>
              <p className="text-wave-400 text-sm">
                Seu perfil ainda não está vinculado a uma unidade. Entre em contato com o síndico ou a administração para realizar o vínculo.
              </p>
            </div>
          ) : !myUnit ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-wave-100 rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-wave-500" />
                </div>
                <div>
                  <p className="text-wave-800 text-lg font-semibold">{userProfile.unit}</p>
                  <p className="text-wave-400 text-xs">Unidade vinculada ao seu perfil</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 text-sm font-medium">Informações em atualização</p>
                  <p className="text-amber-600 text-xs mt-0.5">
                    Os dados detalhados desta unidade ainda não foram cadastrados. Entre em contato com o síndico para mais informações.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 shadow-lg overflow-hidden">
              {/* Destaque da unidade */}
              <div className="bg-gradient-to-r from-brand-deep to-brand-steel p-5 sm:p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-white text-xl font-semibold">Apto {myUnit.number}</p>
                  <p className="text-wave-300 text-sm">
                    {floorLabel}{blockLabel ? ` · ${blockLabel}` : ''}
                  </p>
                </div>
                {myUnit.status && (
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${statusColors[myUnit.status] || 'bg-wave-100 text-wave-600'}`}>
                    {myUnit.status}
                  </span>
                )}
              </div>

              {/* Campos */}
              <div className="divide-y divide-wave-100">
                {infoFields.map(field => {
                  const Icon = field.icon;
                  return (
                    <div key={field.label} className="flex items-center gap-4 px-5 sm:px-6 py-4">
                      <div className="w-9 h-9 bg-wave-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-wave-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-wave-400 text-xs font-medium uppercase tracking-wide">{field.label}</p>
                        {field.value ? (
                          <p className="text-wave-800 text-sm font-medium mt-0.5">{field.value}</p>
                        ) : (
                          <p className="text-wave-300 text-sm italic mt-0.5">Informação não cadastrada</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nota informativa */}
          <p className="text-wave-400 text-xs mt-3">
            Caso alguma informação esteja incorreta, entre em contato com o síndico ou a administração.
          </p>
        </div>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* Coluna 2: Informações do Condomínio                          */}
        {/* ────────────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-wave-800 text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-wave-400" />
            Informações do Condomínio
          </h2>

          {/* Stats agregados */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Unidades', value: condoStats.totalUnits, icon: Home, color: 'text-wave-600', bg: 'bg-wave-100' },
              { label: 'Andares', value: condoStats.totalFloors, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Áreas comuns', value: COMMON_AREAS.length, icon: ShieldCheck, color: 'text-brand-teal', bg: 'bg-brand-teal/15' },
            ].map(s => (
              <div key={s.label} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-4 shadow-lg text-center">
                <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xl font-semibold text-wave-800">{s.value}</p>
                <p className="text-wave-500 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Blocos */}
          {condoStats.totalBlocks > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 shadow-lg p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-wave-400" />
                <h3 className="text-wave-700 text-sm font-medium">Blocos</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {condoStats.blockNames.map(block => (
                  <span key={block} className="px-3 py-1.5 bg-wave-50 border border-wave-200 rounded-lg text-wave-700 text-sm">
                    {block}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Áreas comuns */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-wave-100">
              <PartyPopper className="w-4 h-4 text-wave-400" />
              <h3 className="text-wave-700 text-sm font-medium">Áreas Comuns</h3>
              <span className="ml-auto text-wave-400 text-xs">{COMMON_AREAS.length} disponíveis</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-wave-100">
              {COMMON_AREAS.map((area, idx) => {
                const Icon = area.icon;
                return (
                  <div
                    key={area.label}
                    className={`flex items-center gap-3 px-5 py-3.5 ${
                      idx % 2 === 0 && idx < COMMON_AREAS.length - 1 ? 'sm:border-r sm:border-wave-100' : ''
                    } ${idx >= 2 ? 'sm:border-t sm:border-wave-100' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${area.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${area.color}`} />
                    </div>
                    <p className="text-wave-700 text-sm">{area.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nota de privacidade */}
          <div className="flex items-start gap-2 mt-3 text-wave-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <p>Apenas informações gerais do condomínio são exibidas. Dados pessoais de outros moradores são protegidos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================================================
// SÍNDICO / ADMIN — Gestão completa de unidades
// ===========================================================================

function AdminUnitsView() {
  const [units, setUnits] = useLocalStorage<Unit[]>('wave_units', INITIAL_UNITS);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Ocupado' | 'Alugado' | 'Vago'>('all');

  const [form, setForm] = useState<Partial<Unit>>({
    status: 'Ocupado', floor: 1, votingPower: 1, residents: 0, area: '85 m²', lastTransfer: new Date().toLocaleDateString('pt-BR')
  });

  const filtered = units.filter(u => {
    const matchSearch = u.number.includes(search) || u.owner.toLowerCase().includes(search.toLowerCase()) || (u.tenant || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    if (!form.number || !form.owner) { toast.error('Preencha número e proprietário'); return; }
    const newUnit: Unit = {
      id: form.number!,
      number: form.number!,
      floor: form.floor || 1,
      status: form.status as Unit['status'] || 'Ocupado',
      owner: form.owner!,
      tenant: form.tenant,
      votingPower: form.votingPower || 1,
      area: form.area || '85 m²',
      residents: form.residents || 0,
      lastTransfer: new Date().toLocaleDateString('pt-BR'),
      email: form.email,
      phone: form.phone,
    };
    setUnits([...units, newUnit]);
    setShowAddModal(false);
    setForm({ status: 'Ocupado', floor: 1, votingPower: 1, residents: 0, area: '85 m²', lastTransfer: new Date().toLocaleDateString('pt-BR') });
    toast.success('Unidade cadastrada com sucesso!');
  };

  const handleEdit = () => {
    if (!editingUnit) return;
    setUnits(units.map(u => u.id === editingUnit.id ? { ...editingUnit } : u));
    if (selectedUnit?.id === editingUnit.id) setSelectedUnit(editingUnit);
    setShowEditModal(false);
    setEditingUnit(null);
    toast.success('Unidade atualizada com sucesso!');
  };

  const totalResidents = units.reduce((s, u) => s + u.residents, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-brand-light min-h-screen relative">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 relative z-10">
        <div>
          <h1 className="font-display text-brand-navy text-2xl sm:text-3xl mb-2">Unidades</h1>
          <p className="text-wave-500">Gestão de apartamentos e moradores do condomínio</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-3 bg-gradient-to-r from-brand-deep to-brand-steel text-white rounded-xl shadow-lg flex items-center gap-2 hover:opacity-90 transition-all">
          <Plus className="w-5 h-5" /> Nova Unidade
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
        {[
          { label: 'Total', value: units.length, color: 'bg-wave-100', text: 'text-wave-600' },
          { label: 'Ocupadas', value: units.filter(u => u.status === 'Ocupado').length, color: 'bg-brand-teal/15', text: 'text-brand-teal' },
          { label: 'Alugadas', value: units.filter(u => u.status === 'Alugado').length, color: 'bg-blue-100', text: 'text-blue-700' },
          { label: 'Moradores', value: totalResidents, color: 'bg-purple-100', text: 'text-purple-700' },
        ].map(s => (
          <div key={s.label} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-5 shadow-lg">
            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>
              <Home className={`w-5 h-5 ${s.text}`} />
            </div>
            <p className="text-2xl font-semibold text-wave-800">{s.value}</p>
            <p className="text-wave-500 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-4 mb-6 shadow-lg relative z-10 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wave-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por unidade ou morador..." className="w-full pl-9 pr-4 py-2 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300" />
        </div>
        {(['all', 'Ocupado', 'Alugado', 'Vago'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-xl text-sm transition-all ${filterStatus === s ? 'bg-wave-700 text-white shadow' : 'bg-wave-50 text-wave-500 hover:bg-wave-100'}`}>
            {s === 'all' ? 'Todas' : s}
          </button>
        ))}
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        {filtered.map(unit => (
          <div key={unit.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => setSelectedUnit(unit)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-wave-100 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-wave-600" />
                </div>
                <div>
                  <p className="text-wave-800 font-semibold">Apto {unit.number}</p>
                  <p className="text-wave-400 text-xs">{unit.floor}º andar · {unit.area}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[unit.status]}`}>{unit.status}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-wave-600">
                <User className="w-3.5 h-3.5" /> <span>{unit.owner}</span>
              </div>
              {unit.tenant && (
                <div className="flex items-center gap-2 text-sm text-wave-500">
                  <Key className="w-3.5 h-3.5" /> <span>Inquilino: {unit.tenant}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-wave-500">
                <Users className="w-3.5 h-3.5" /> <span>{unit.residents} morador{unit.residents !== 1 ? 'es' : ''}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-wave-100">
            <div className="flex items-center justify-between p-6 border-b border-wave-100">
              <h2 className="text-wave-800 text-xl font-serif">Apto {selectedUnit.number}</h2>
              <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-wave-50 rounded-lg"><X className="w-5 h-5 text-wave-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Status', value: selectedUnit.status },
                { label: 'Andar', value: `${selectedUnit.floor}º andar` },
                { label: 'Área', value: selectedUnit.area },
                { label: 'Proprietário', value: selectedUnit.owner },
                { label: 'Inquilino', value: selectedUnit.tenant || '—' },
                { label: 'Moradores', value: `${selectedUnit.residents}` },
                { label: 'E-mail', value: selectedUnit.email || '—' },
                { label: 'Telefone', value: selectedUnit.phone || '—' },
                { label: 'Última transferência', value: selectedUnit.lastTransfer },
              ].map(r => (
                <div key={r.label} className="flex justify-between py-2 border-b border-wave-50">
                  <span className="text-wave-400 text-sm">{r.label}</span>
                  <span className="text-wave-700 text-sm font-medium">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => { setEditingUnit({ ...selectedUnit }); setShowEditModal(true); setSelectedUnit(null); }} className="flex-1 py-2.5 bg-wave-100 text-wave-600 rounded-xl hover:bg-wave-200 transition-all flex items-center justify-center gap-2 text-sm">
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => setSelectedUnit(null)} className="flex-1 py-2.5 bg-wave-800 text-white rounded-xl hover:bg-wave-700 transition-all text-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-wave-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-wave-100">
              <h2 className="text-wave-800 text-xl font-serif">{showAddModal ? 'Nova Unidade' : 'Editar Unidade'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingUnit(null); }} className="p-2 hover:bg-wave-50 rounded-lg"><X className="w-5 h-5 text-wave-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Número do apartamento', key: 'number', placeholder: 'Ex: 305' },
                { label: 'Proprietário', key: 'owner', placeholder: 'Nome completo' },
                { label: 'Inquilino (opcional)', key: 'tenant', placeholder: 'Nome do inquilino' },
                { label: 'E-mail', key: 'email', placeholder: 'email@exemplo.com' },
                { label: 'Telefone', key: 'phone', placeholder: '(21) 99999-0000' },
                { label: 'Área', key: 'area', placeholder: 'Ex: 85 m²' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-wave-700 text-sm mb-1">{f.label}</label>
                  <input
                    value={(showEditModal ? editingUnit : form)?.[f.key as keyof Unit] as string || ''}
                    onChange={e => showEditModal ? setEditingUnit(prev => ({ ...prev!, [f.key]: e.target.value })) : setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300"
                  />
                </div>
              ))}
              <div>
                <label className="block text-wave-700 text-sm mb-1">Status</label>
                <select
                  value={(showEditModal ? editingUnit : form)?.status || 'Ocupado'}
                  onChange={e => showEditModal ? setEditingUnit(prev => ({ ...prev!, status: e.target.value as Unit['status'] })) : setForm(prev => ({ ...prev, status: e.target.value as Unit['status'] }))}
                  className="w-full px-4 py-2.5 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300"
                >
                  <option>Ocupado</option>
                  <option>Alugado</option>
                  <option>Vago</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-wave-700 text-sm mb-1">Andar</label>
                  <input type="number" min={1}
                    value={(showEditModal ? editingUnit : form)?.floor || 1}
                    onChange={e => showEditModal ? setEditingUnit(prev => ({ ...prev!, floor: parseInt(e.target.value) })) : setForm(prev => ({ ...prev, floor: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300"
                  />
                </div>
                <div>
                  <label className="block text-wave-700 text-sm mb-1">Moradores</label>
                  <input type="number" min={0}
                    value={(showEditModal ? editingUnit : form)?.residents || 0}
                    onChange={e => showEditModal ? setEditingUnit(prev => ({ ...prev!, residents: parseInt(e.target.value) })) : setForm(prev => ({ ...prev, residents: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-wave-50 border border-wave-200 rounded-xl text-wave-800 text-sm focus:outline-none focus:ring-2 focus:ring-wave-300"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingUnit(null); }} className="flex-1 py-2.5 bg-wave-50 border border-wave-200 text-wave-600 rounded-xl text-sm">Cancelar</button>
              <button onClick={showAddModal ? handleAdd : handleEdit} className="flex-1 py-2.5 bg-wave-800 text-white rounded-xl hover:bg-wave-700 transition-all text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> {showAddModal ? 'Cadastrar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
