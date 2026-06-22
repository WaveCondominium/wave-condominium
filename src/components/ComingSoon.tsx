import { Construction } from 'lucide-react';

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
      <Construction className="w-16 h-16 mb-4 text-blue-500 opacity-50" />
      <h1 className="text-2xl font-bold mb-2 text-slate-700">{title}</h1>
      <p>Esta funcionalidade estará disponível em breve.</p>
    </div>
  );
}
