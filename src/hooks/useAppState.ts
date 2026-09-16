import { useCallback, useState } from 'react';
import type { Category, FormatOption } from '../types';

interface SelectedFile {
  file: File;
  category: Category;
}

export function useAppState() {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<FormatOption | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');

  const handleFilesDropped = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const ext = '.' + file.name.split('.').pop()!.toLowerCase();

    // Find matching category
    let category: Category | null = null;
    for (const cat of [
      { cat: 'image' as Category, exts: ['.jpg','.jpeg','.png','.webp','.heic','.heif','.tiff','.tif','.svg','.bmp','.avif','.gif'] },
      { cat: 'audio' as Category, exts: ['.mp3','.m4a','.wav','.flac','.ogg','.opus','.aiff','.wma'] },
      { cat: 'video' as Category, exts: ['.mp4','.mov','.mkv','.webm','.avi','.wmv','.gif'] },
      { cat: 'document' as Category, exts: ['.pdf','.docx','.txt'] },
      { cat: 'subtitle' as Category, exts: ['.srt','.vtt','.txt'] },
      { cat: 'archive' as Category, exts: ['.zip','.tar','.gz','.gzip','.rar'] },
    ]) {
      if (cat.exts.includes(ext)) {
        category = cat.cat;
        break;
      }
    }

    if (category) {
      setSelectedFile({ file, category });
    } else {
      setSelectedFile({ file, category: 'document' });
    }
    setSelectedFormat(null);
  }, []);

  const handleFormatSelect = useCallback((format: FormatOption) => {
    setSelectedFormat(format);
  }, []);

  return {
    selectedFile,
    selectedFormat,
    activeCategoryTab,
    setActiveCategoryTab,
    handleFilesDropped,
    handleFormatSelect,
  };
}