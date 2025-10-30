export type User = {
  id: number;
  name: string;
  email: string;
  role: number;
  rol: string;
  last_login: Date | null;
  created: Date;
  last_activity: Date | null;
  expired_at: Date | null;
  sesion: Date | null;
}

export type Rol = {
  id: number;
  name: string;
}