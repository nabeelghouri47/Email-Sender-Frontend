<<<<<<< HEAD
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  enabled: boolean;
  canEditProfile: boolean;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Campaign {
  id: number;
  name: string;
  template: EmailTemplate;
  emailConfig: EmailConfig;
  dailyLimit: number;
  totalClients: number;
  sentCount: number;
  isActive: boolean;
  autoRestart: boolean;
  lastSentDate?: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
}

export interface EmailConfig {
  id: number;
  smtpHost: string;
  smtpPort: number;
  senderEmail: string;
  senderName?: string;
  useTls: boolean;
  isActive: boolean;
}
=======
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  enabled: boolean;
  canEditProfile: boolean;
  roles: string[];
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface Campaign {
  id: number;
  name: string;
  template: EmailTemplate;
  emailConfig: EmailConfig;
  dailyLimit: number;
  totalClients: number;
  sentCount: number;
  isActive: boolean;
  autoRestart: boolean;
  lastSentDate?: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
}

export interface EmailConfig {
  id: number;
  smtpHost: string;
  smtpPort: number;
  senderEmail: string;
  senderName?: string;
  useTls: boolean;
  isActive: boolean;
}
>>>>>>> 5e525f2 (Frontend updated)
