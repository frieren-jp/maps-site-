export interface AuthUser {
  id?: number;
  username: string;
  isLocalAdmin?: boolean;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface RouteStats {
  ratingAverage: number;
  ratingCount: number;
  commentsCount: number;
}

export interface RouteComment {
  id: number;
  username: string;
  comment: string;
  createdAt: string;
}

export interface RouteItem {
  id: number;
  userId?: number | null;
  title: string;
  description: string;
  points: RoutePoint[];
  photos: string[];
  createdAt: string;
  stats: RouteStats;
}

export interface RouteDetails extends RouteItem {
  comments: RouteComment[];
}

export interface CreateRoutePayload {
  title: string;
  description: string;
  points: RoutePoint[];
  photos: string[];
}
