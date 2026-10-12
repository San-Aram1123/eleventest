import { useState, useCallback } from 'react';
import { batchDeleteSamples } from '../services/api';

export interface BatchDeleteProgress {
  current: number;
  total: number;
}

export function useBatchDelete(chunkSize = 400) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState<BatchDeleteProgress | null>(null);

  const executeBatchDelete = useCallback(
    async (idsToDelete: string[]): Promise<string[]> => {
      if (!idsToDelete || idsToDelete.length === 0) return [];

      setIsDeleting(true);
      setProgress({ current: 0, total: idsToDelete.length });

      const allDeletedIds: string[] = [];

      try {
        for (let i = 0; i < idsToDelete.length; i += chunkSize) {
          const chunk = idsToDelete.slice(i, i + chunkSize);
          const res = await batchDeleteSamples(chunk);
          if (res.deletedIds && res.deletedIds.length > 0) {
            allDeletedIds.push(...res.deletedIds);
          }
          setProgress({
            current: Math.min(i + chunkSize, idsToDelete.length),
            total: idsToDelete.length
          });
        }
        return allDeletedIds;
      } finally {
        setIsDeleting(false);
        setProgress(null);
      }
    },
    [chunkSize]
  );

  return {
    isDeleting,
    progress,
    executeBatchDelete
  };
}
