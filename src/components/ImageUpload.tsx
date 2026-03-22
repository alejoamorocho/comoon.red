import { useState, useRef } from 'react';
import { Camera, CircleNotch, Trash, UploadSimple } from '@phosphor-icons/react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  shape?: 'circle' | 'rect';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  accentColor?: string;
}

export default function ImageUpload({
  value,
  onChange,
  shape = 'circle',
  size = 'md',
  label = 'Subir Foto',
  accentColor = 'comoon-purple',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: shape === 'circle' ? 'w-20 h-20' : 'w-32 h-20',
    md: shape === 'circle' ? 'w-28 h-28' : 'w-48 h-28',
    lg: shape === 'circle' ? 'w-36 h-36' : 'w-64 h-36',
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imagenes');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Maximo 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = (await res.json()) as { success?: boolean; url?: string; error?: string };

      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || 'Error al subir imagen');
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = () => {
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-dracula-fg">{label}</label>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`group relative cursor-pointer ${sizeClasses[size]} ${
          shape === 'circle' ? 'rounded-full' : 'rounded-xl'
        } ${
          dragOver
            ? `border-2 border-dashed border-${accentColor} bg-${accentColor}/10`
            : value
              ? 'border-2 border-transparent'
              : 'border-2 border-dashed border-dracula-current hover:border-dracula-comment'
        } mx-auto overflow-hidden transition-all`}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <UploadSimple size={20} className="text-white" />
              <span className="text-xs font-bold text-white">Cambiar</span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-dracula-comment">
            {uploading ? (
              <CircleNotch size={24} className="animate-spin" />
            ) : (
              <>
                <Camera
                  size={28}
                  className={`mb-1 group-hover:text-${accentColor} transition-colors`}
                />
                <span className="text-xs">Subir</span>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {value && (
        <button
          type="button"
          onClick={handleRemove}
          className="mx-auto flex items-center gap-1 text-xs text-dracula-red transition-colors hover:text-white"
        >
          <Trash size={12} />
          Quitar foto
        </button>
      )}

      {error && <p className="text-center text-xs text-dracula-red">{error}</p>}
    </div>
  );
}
