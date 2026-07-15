'use client';

import { useRef } from 'react';
import { User, Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemove() {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-wave-50 border-2 border-dashed border-wave-200 flex items-center justify-center overflow-hidden">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Pré-visualização da foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-wave-300" />
          )}
        </div>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remover foto"
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-wave-50 border border-wave-200 text-wave-600 rounded-xl hover:border-wave-300 hover:bg-wave-100 transition-all text-sm flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          {value ? 'Trocar foto' : 'Adicionar foto'}
        </button>
        <p className="text-wave-400 text-xs mt-1.5">JPG ou PNG, até 5MB.</p>
      </div>
    </div>
  );
}
