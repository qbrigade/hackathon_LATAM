import { useState } from 'react';
import type { UseFormSetValue, UseFormTrigger } from 'react-hook-form';

interface UseMultiImageUploadProps<T extends Record<string, unknown>> {
  fieldName: keyof T;
  setValue: UseFormSetValue<T>;
  trigger: UseFormTrigger<T>;
  maxImages?: number;
}

export function useMultiImageUpload<T extends Record<string, unknown>>({
  fieldName,
  setValue,
  trigger,
  maxImages = 5,
}: UseMultiImageUploadProps<T>) {
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);

    // For react-hook-form compatibility
    if (maxImages === 1) {
      // Single file mode - set as FileList for backwards compatibility
      const fileList = new DataTransfer();
      if (newFiles[0]) {
        fileList.items.add(newFiles[0]);
      }
      setValue(fieldName as never, fileList.files as never, { shouldValidate: true });
    } else {
      // Multiple files mode - set as File array
      setValue(fieldName as never, newFiles as never, { shouldValidate: true });
    }

    trigger(fieldName as never);
  };

  const reset = () => {
    setFiles([]);
    setValue(fieldName as never, (maxImages === 1 ? new DataTransfer().files : []) as never, { shouldValidate: true });
  };

  return {
    files,
    handleFilesChange,
    reset,
  };
}
