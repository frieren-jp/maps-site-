export interface RoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface Route {
  id: number;
  userId: number;
  title: string;
  description: string;
  points: RoutePoint[];
  photos: string[];
  createdAt: Date;
}
