import { AppRole } from './roles';

export interface Account {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: AppRole[];
}

export interface Session {
  accessToken: string;
  expiresIn: number;
}

export interface ProblemDetail {
  status: number;
  title?: string;
  detail?: string;
}
