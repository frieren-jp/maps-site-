import { useEffect, useState } from 'react';
import { routesApi } from '../services/api';
import type { RouteItem } from '../types';

export const useRoutes = (search: string, sort: 'newest' | 'oldest') => {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await routesApi.getRoutes(search, sort);
      setRoutes(data);
    } catch (err) {
      setError((err as Error).message || 'Не удалось загрузить маршруты');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoutes();
  }, [search, sort]);

  return {
    routes,
    loading,
    error,
    reload: loadRoutes,
  };
};
