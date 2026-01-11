// hooks\useTables.tsx
import { getTables } from '@/api/tableApi';
import { DiningTable } from '@/props/DiningTable';
import { useEffect, useState } from 'react';

export const useTables = () => {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await getTables();
      setTables(data);

      // Lấy danh sách khu vực duy nhất
      const uniqueAreas = Array.from(new Set(data.map((t) => t.area).filter(Boolean)));
      setAreas(['All', ...uniqueAreas]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { tables, setTables, areas, loading, reload: loadTables };
};
