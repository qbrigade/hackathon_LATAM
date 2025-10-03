import { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface MultiImageUploadProps {
  /** Maximum number of images allowed */
  maxImages?: number;
  /** Callback when images change */
  onChange: (files: File[]) => void;
  /** Current files (for controlled component) */
  files?: File[];
  /** Error message to display */
  error?: string;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in bytes */
  maxFileSize?: number;
}

interface ImagePreview {
  file: File;
  url: string;
  id: string;
}

export function MultiImageUpload({
  maxImages = 5,
  onChange,
  files = [],
  error,
  disabled = false,
  accept = 'image/*',
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update previews when files prop changes
  useEffect(() => {
    const newPreviews: ImagePreview[] = files.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      id: `${file.name}-${index}-${file.lastModified}`,
    }));

    // Clean up old URLs
    setPreviews(oldPreviews => {
      oldPreviews.forEach(preview => {
        if (!newPreviews.find(p => p.id === preview.id)) {
          URL.revokeObjectURL(preview.url);
        }
      });
      return newPreviews;
    });
  }, [files]);

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      setPreviews(currentPreviews => {
        currentPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        return [];
      });
    };
  }, []);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'El archivo debe ser una imagen válida';
    }
    if (file.size > maxFileSize) {
      return `El archivo es demasiado grande. Máximo ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }
    return null;
  };

  const handleFileSelect = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    const currentFileCount = files.length;
    const availableSlots = maxImages - currentFileCount;
    const filesToAdd = validFiles.slice(0, availableSlots);

    if (validFiles.length > availableSlots && availableSlots > 0) {
      alert(`Solo se pueden agregar ${availableSlots} imagen(es) más`);
    } else if (availableSlots === 0) {
      alert(`Máximo ${maxImages} imagen(es) permitidas`);
      return;
    }

    const updatedFiles = [...files, ...filesToAdd];
    onChange(updatedFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length > 0) {
      handleFileSelect(newFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    onChange(updatedFiles);
  };

  const canAddMore = files.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragOver
              ? 'border-blue-400 bg-blue-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={maxImages > 1}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              {maxImages === 1 ? (
                <>
                  <span className="font-medium text-blue-600">Haz clic para seleccionar</span>
                  <span> o arrastra una imagen aquí</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-blue-600">Haz clic para seleccionar</span>
                  <span> o arrastra imágenes aquí</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {files.length}/{maxImages} imágenes seleccionadas
                  </div>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">
              PNG, JPG, GIF hasta {Math.round(maxFileSize / (1024 * 1024))}MB
            </div>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className={`grid gap-4 ${maxImages === 1
          ? 'grid-cols-1'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          }`}>
          {previews.map((preview, index) => (
            <div key={preview.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                <img
                  src={preview.url}
                  alt={`Vista previa ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>

              {/* File info */}
              <div className="mt-2 text-xs text-gray-600 truncate">
                {preview.file.name}
              </div>
              <div className="text-xs text-gray-500">
                {(preview.file.size / (1024 * 1024)).toFixed(1)}MB
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state for when maxImages = 1 and no files */}
      {maxImages === 1 && files.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <div className="text-sm">No hay imagen seleccionada</div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Info text */}
      {maxImages > 1 && files.length === maxImages && (
        <p className="text-sm text-gray-600">
          Has alcanzado el límite máximo de {maxImages} imágenes.
        </p>
      )}
    </div>
  );
}
