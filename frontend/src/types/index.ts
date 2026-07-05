/**
 * Type Definitions
 * Centralized TypeScript interfaces for the application
 */

// User type for authenticated users
export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  storeName?: string;
  isVerified?: boolean;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
}

export interface VerifyEmailFormData {
  token: string;
}

// Form error types
// Recursive form error type: supports nested objects and arrays of objects
export type FormErrors<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<FormErrors<U> | string>
    : T[K] extends object
    ? FormErrors<T[K]>
    : string;
};

export interface ApiFormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  api?: string;
  apiType?: "unverified" | "invalid" | "server";
}

// Navigation item type
export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

// Statistics card type
export interface StatCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
  color: string;
}

// Lead type
export interface Lead {
  name: string;
  phone: string;
  product: string;
  score: number;
  status: "new" | "reviewed" | "approved" | "rejected";
}

// Activity type
export interface ActivityItem {
  type: "lead" | "message" | "order" | "campaign" | "customer";
  text: string;
  time: string;
  icon: React.ReactNode;
}

// Bar chart data
export interface BarData {
  day: string;
  sent: number;
}

// Quick action type
export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  id: string;
  sub: string;
}

// Session state
export interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth context type
export interface AuthContextType extends SessionState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  refreshUser: () => Promise<void>;
}