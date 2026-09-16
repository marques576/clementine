import { useCallback, useMemo, useState } from 'react';
import { getCategoryForFile, getOutputFormats, type Category, type FormatOption } from '../types';

export interface SelectedFile {
  file: File;
  category: Category;
}

export function useAppState() {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatOption | null>(null);

  const outputFormats = useMemo(
    () => (selectedFile ? getOutputFormats(selectedFile.file.name) : []),
    [selectedFile],
  );

  const handleFilesDropped = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    const category = getCategoryForFile(file.name);
    if (!category) return;

    setSelectedFile({ file, category });
    const formats = getOutputFormats(file.name);
    setSelectedFormat(formats[0] ?? null);
  }, []);

  const handleFormatSelect = useCallback((format: FormatOption) => {
    setSelectedFormat(format);
  }, []);

  const reset = useCallback(() => {
    setSelectedFile(null);
    setSelectedFormat(null);
  }, []);

  return {
    selectedFile,
    selectedFormat,
    outputFormats,
    handleFilesDropped,
    handleFormatSelect,
    reset,
  };
}
