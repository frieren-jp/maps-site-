import type { AuthUser, CreateRoutePayload, RouteComment, RouteDetails, RouteItem } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const LOCAL_ROUTES_KEY = 'route_finder_local_routes_v1';

const withApiPrefix = (url: string): string => {
  if (!url) {
    return url;
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const nowIso = () => new Date().toISOString();

const parseJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let message = 'Request failed';
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      message = `${response.status} ${response.statusText}`;
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
};

const fetchApi = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  return parseJson<T>(response);
};

const getLocalRoutes = (): RouteDetails[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ROUTES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as RouteDetails[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setLocalRoutes = (routes: RouteDetails[]) => {
  localStorage.setItem(LOCAL_ROUTES_KEY, JSON.stringify(routes));
};

const toRouteDetails = (route: RouteItem): RouteDetails => ({
  ...route,
  comments: [],
});

const mapRoute = (route: RouteItem | RouteDetails): RouteItem | RouteDetails => ({
  ...route,
  photos: route.photos.map(withApiPrefix),
});

export const authApi = {
  login: (username: string, password: string) =>
    fetchApi<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  register: (username: string, password: string) =>
    fetchApi<{ token: string; user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

export const routesApi = {
  async getRoutes(search?: string, sort: 'newest' | 'oldest' = 'newest'): Promise<RouteItem[]> {
    const query = new URLSearchParams();
    if (search) {
      query.set('search', search);
    }
    query.set('sort', sort);

    try {
      const data = await fetchApi<RouteItem[]>(`/api/routes?${query.toString()}`);
      return data.map((route) => mapRoute(route) as RouteItem);
    } catch {
      const local = getLocalRoutes();
      const filtered = local.filter((route) => {
        if (!search) {
          return true;
        }
        return (
          route.title.toLowerCase().includes(search.toLowerCase()) ||
          route.description.toLowerCase().includes(search.toLowerCase())
        );
      });
      const sorted = filtered.sort((a, b) =>
        sort === 'newest'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      return sorted;
    }
  },

  async getRouteById(routeId: string | number): Promise<RouteDetails> {
    try {
      const route = await fetchApi<RouteDetails>(`/api/routes/${routeId}`);
      return mapRoute(route) as RouteDetails;
    } catch {
      const localRoute = getLocalRoutes().find((route) => String(route.id) === String(routeId));
      if (!localRoute) {
        throw new Error('Route not found');
      }
      return localRoute;
    }
  },

  async createRoute(payload: CreateRoutePayload, token: string): Promise<RouteItem> {
    try {
      const route = await fetchApi<RouteItem>(
        '/api/routes',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        token
      );
      return mapRoute(route) as RouteItem;
    } catch {
      const localRoutes = getLocalRoutes();
      const newRoute: RouteDetails = {
        id: Date.now(),
        title: payload.title,
        description: payload.description,
        points: payload.points,
        photos: payload.photos,
        createdAt: nowIso(),
        stats: {
          ratingAverage: 0,
          ratingCount: 0,
          commentsCount: 0,
        },
        comments: [],
      };
      localRoutes.unshift(newRoute);
      setLocalRoutes(localRoutes);
      return newRoute;
    }
  },

  async uploadPhoto(file: File, token: string): Promise<string> {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const result = await fetchApi<{ url: string }>(
        '/api/routes/upload-photo',
        {
          method: 'POST',
          body: formData,
        },
        token
      );
      return withApiPrefix(result.url);
    } catch {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to process image file'));
        reader.readAsDataURL(file);
      });
    }
  },

  async addComment(routeId: string | number, comment: string, token: string): Promise<RouteComment> {
    try {
      return await fetchApi<RouteComment>(
        `/api/routes/${routeId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ comment }),
        },
        token
      );
    } catch {
      const routes = getLocalRoutes();
      const route = routes.find((item) => String(item.id) === String(routeId));
      if (!route) {
        throw new Error('Route not found');
      }
      const localComment: RouteComment = {
        id: Date.now(),
        username: 'admin',
        comment,
        createdAt: nowIso(),
      };
      route.comments.unshift(localComment);
      route.stats.commentsCount = route.comments.length;
      setLocalRoutes(routes);
      return localComment;
    }
  },

  async rateRoute(routeId: string | number, rating: number, token: string): Promise<{ ratingAverage: number; ratingCount: number }> {
    try {
      return await fetchApi<{ ratingAverage: number; ratingCount: number }>(
        `/api/routes/${routeId}/rate`,
        {
          method: 'POST',
          body: JSON.stringify({ rating }),
        },
        token
      );
    } catch {
      const routes = getLocalRoutes();
      const route = routes.find((item) => String(item.id) === String(routeId));
      if (!route) {
        throw new Error('Route not found');
      }
      route.stats.ratingAverage = rating;
      route.stats.ratingCount = Math.max(route.stats.ratingCount, 1);
      setLocalRoutes(routes);
      return {
        ratingAverage: route.stats.ratingAverage,
        ratingCount: route.stats.ratingCount,
      };
    }
  },
};

export const seedLocalDemoRoute = () => {
  const routes = getLocalRoutes();
  if (routes.length > 0) {
    return;
  }

  const demo: RouteDetails = {
    id: Date.now(),
    title: 'Пеший маршрут по центру Москвы',
    description: 'Тестовый локальный маршрут для режима без сервера.',
    points: [
      { lat: 55.751244, lng: 37.618423, name: 'Точка A' },
      { lat: 55.758, lng: 37.62, name: 'Точка B' },
      { lat: 55.764, lng: 37.605, name: 'Точка C' },
    ],
    photos: [],
    createdAt: nowIso(),
    stats: {
      ratingAverage: 4.5,
      ratingCount: 1,
      commentsCount: 1,
    },
    comments: [
      {
        id: Date.now() + 1,
        username: 'admin',
        comment: 'Демо-комментарий для офлайн-режима',
        createdAt: nowIso(),
      },
    ],
  };

  setLocalRoutes([demo]);
};

export const __internal = {
  getLocalRoutes,
  setLocalRoutes,
  toRouteDetails,
};
